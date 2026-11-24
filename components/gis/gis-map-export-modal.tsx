'use client';

import React, { useState } from 'react';
import {
  Download,
  Printer,
  Compass,
  Layers,
  FileText,
  Calendar,
  Globe,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ElevationColorPalette } from '@/lib/types/gis';

interface GISMapExportModalProps {
  currentModule: string;
  palette: ElevationColorPalette;
  onClose: () => void;
}

export function GISMapExportModal({ currentModule, palette, onClose }: GISMapExportModalProps) {
  const [mapTitle, setMapTitle] = useState('Bengaluru Topographic & Flood Inundation Analysis');
  const [paperFormat, setPaperFormat] = useState<'A4' | 'A3' | 'Letter'>('A4');
  const [dpi, setDpi] = useState<number>(300);
  const [includeLegend, setIncludeLegend] = useState(true);
  const [includeNorthArrow, setIncludeNorthArrow] = useState(true);
  const [includeScaleBar, setIncludeScaleBar] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExport = (format: 'PNG' | 'PDF') => {
    setIsExporting(true);
    setExportSuccess(null);

    // Simulate high-res rendering and generate downloadable dossier
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(`Map exported successfully as ${format} (${paperFormat}, ${dpi} DPI)`);

      // Trigger dummy download file
      const element = document.createElement('a');
      const file = new Blob(
        [
          JSON.stringify(
            {
              title: mapTitle,
              crs: 'EPSG:4326 (WGS84)',
              extent: '12.80N to 13.15N, 77.45E to 77.78E',
              elevationDatum: 'Copernicus DEM (GLO-30)',
              date: new Date().toISOString(),
              dpi,
              format,
            },
            null,
            2
          ),
        ],
        { type: format === 'PDF' ? 'application/pdf' : 'image/png' }
      );
      element.href = URL.createObjectURL(file);
      element.download = `bengaluru-floodguard-gis-${format.toLowerCase()}-${Date.now()}.${
        format === 'PDF' ? 'json' : 'png'
      }`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  };

  return (
    <div className="w-[560px] max-w-[95vw] rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-5 text-xs text-slate-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm">Cartographic Map Export</div>
            <div className="text-[10px] text-slate-400">High-Resolution Geospatial Publishing</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Map Title Input */}
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-semibold text-slate-400">Map Title:</label>
        <input
          type="text"
          value={mapTitle}
          onChange={(e) => setMapTitle(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Page Format & Resolution */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-slate-400">Page Format:</label>
          <div className="flex gap-1.5">
            {(['A4', 'A3', 'Letter'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setPaperFormat(fmt)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition ${
                  paperFormat === fmt
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-semibold text-slate-400">Resolution:</label>
          <div className="flex gap-1.5">
            {[150, 300, 600].map((d) => (
              <button
                key={d}
                onClick={() => setDpi(d)}
                className={`flex-1 py-1 rounded-lg text-xs font-mono transition ${
                  dpi === d
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d} DPI
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartographic Elements Checklist */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
        <div className="text-[10px] uppercase font-bold text-slate-400">
          Cartographic Layout Elements:
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNorthArrow}
              onChange={(e) => setIncludeNorthArrow(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>North Arrow (N)</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeScaleBar}
              onChange={(e) => setIncludeScaleBar(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Metric Scale Bar</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLegend}
              onChange={(e) => setIncludeLegend(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>Elevation Legend</span>
          </label>
        </div>
      </div>

      {/* Cartographic Metadata Preview */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-400">
        <div className="flex items-center justify-between">
          <span>Coordinate Reference:</span>
          <span className="text-white font-bold">EPSG:4326 (WGS84)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Elevation Datum:</span>
          <span className="text-white">Copernicus DEM (GLO-30)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Date of Analysis:</span>
          <span className="text-white">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Success Notification */}
      {exportSuccess && (
        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2.5 pt-1">
        <button
          onClick={() => handleExport('PNG')}
          disabled={isExporting}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export High-Res PNG
        </button>

        <button
          onClick={() => handleExport('PDF')}
          disabled={isExporting}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          Generate GeoPDF Report
        </button>
      </div>
    </div>
  );
}
