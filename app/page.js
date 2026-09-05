"use client";

import dynamic from "next/dynamic";

const EarthViewer = dynamic(() => import("../components/EarthViewer"), {
  ssr: false,
  loading: () => (
    <div className="loading-screen">
      <div className="loader-glow"></div>
      <div className="loader-spinner"></div>
      <div className="loader-content">
        <h2>ನಮ್ಮ Bengaluru 3D</h2>
        <p>Loading Bangalore 3D terrain, high-res satellite & landmarks...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="main-viewport">
      <EarthViewer />
    </main>
  );
}
