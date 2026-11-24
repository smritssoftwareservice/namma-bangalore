// FLOODGUARD AI - Weather Service Abstraction
import { WeatherData } from '@/lib/types/hazard';

export interface WeatherProvider {
  name: string;
  getWeather(lat: number, lng: number): Promise<WeatherData>;
}

export function classifyRainIntensity(rainfallMm: number): WeatherData['rain_intensity'] {
  if (rainfallMm <= 0.1) return 'NONE';
  if (rainfallMm <= 5.0) return 'LIGHT';
  if (rainfallMm <= 15.0) return 'MODERATE';
  if (rainfallMm <= 35.0) return 'HEAVY';
  return 'VERY_HEAVY';
}

/**
 * Open-Meteo Weather Provider
 * Reliable, free, no-key public API for precise meteorological data
 */
export class OpenMeteoWeatherProvider implements WeatherProvider {
  name = 'Open-Meteo Free GIS Weather API';

  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);

      const data = await res.json();
      const precipitation = data.current?.precipitation ?? data.current?.rain ?? 0;
      const temperature = data.current?.temperature_2m ?? 24.5;
      const humidity = data.current?.relative_humidity_2m ?? 78;

      return {
        latitude: lat,
        longitude: lng,
        rainfall: precipitation,
        rain_intensity: classifyRainIntensity(precipitation),
        temperature,
        humidity,
        timestamp: new Date().toISOString(),
        is_demo: false,
      };
    } catch {
      return new DemoWeatherProvider().getWeather(lat, lng);
    }
  }
}

/**
 * Demo Weather Provider
 * Deterministic weather simulation when external API is unreachable or DEMO_MODE=true
 */
export class DemoWeatherProvider implements WeatherProvider {
  name = 'Demo Weather Simulation Provider';

  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    // Dynamic pseudo-random variation based on coordinates
    const offset = (Math.sin(lat * 100) + Math.cos(lng * 100) + 2) / 4; // 0..1
    const rainfall = Math.round(offset * 42 * 10) / 10; // 0 to 42mm

    return {
      latitude: lat,
      longitude: lng,
      rainfall,
      rain_intensity: classifyRainIntensity(rainfall),
      temperature: Math.round((22 + offset * 8) * 10) / 10,
      humidity: Math.round(65 + offset * 30),
      timestamp: new Date().toISOString(),
      is_demo: true,
    };
  }
}

export function getWeatherProvider(): WeatherProvider {
  if (process.env.DEMO_MODE === 'true' && !process.env.WEATHER_API_KEY) {
    return new DemoWeatherProvider();
  }
  return new OpenMeteoWeatherProvider();
}

export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
  const provider = getWeatherProvider();
  return provider.getWeather(lat, lng);
}
