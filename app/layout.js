import "./globals.css";

export const metadata = {
  title: "Namma Bengaluru 3D Explorer | Silicon Valley of India",
  description: "Interactive 3D city explorer exclusively for Bengaluru (Bangalore), India. Explore Vidhana Soudha, UB City, Electronic City, Lalbagh, and iconic tech hubs in 3D photorealistic perspective.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/Widgets/widgets.css"
        />
        <script src="https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium/Cesium.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
