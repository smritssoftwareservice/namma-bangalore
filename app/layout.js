import "./globals.css";

export const metadata = {
  title: "Namma Bengaluru 3D | Real Estate & Urban Development Platform",
  description: "Premium 3D real estate visualization, masterplan configurator, and urban planning platform for Bengaluru. Place towers, villas, and custom 3D models, simulate solar shadows, inspect cadastral parcel boundaries, and compare existing vs proposed developments.",
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
