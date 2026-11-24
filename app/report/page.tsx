'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Info,
  ShieldCheck,
  Video,
  LocateFixed,
} from 'lucide-react';
import { HazardType, SeverityLevel } from '@/lib/types/hazard';
import { AIDetectionItem } from '@/lib/ai/ai-provider';
import { calculateRiskScore } from '@/lib/risk/risk-engine';
import { getHazardIcon } from '@/components/map/hazard-icons';
import { DemoBadge } from '@/components/ui/demo-badge';

const HAZARD_OPTIONS: { type: HazardType; label: string; desc: string }[] = [
  { type: 'POTHOLE', label: 'Pothole', desc: 'Asphalt crater or road surface depression' },
  { type: 'LARGE_POTHOLE', label: 'Large Pothole / Crater', desc: 'Severe crater spanning travel lanes' },
  { type: 'OPEN_MANHOLE', label: 'Open Manhole', desc: 'Uncovered sewer chamber or missing lid' },
  { type: 'DAMAGED_MANHOLE', label: 'Damaged Manhole', desc: 'Broken or cracked chamber frame' },
  { type: 'WATERLOGGING', label: 'Waterlogging', desc: 'Standing water covering road surface' },
  { type: 'FLOODED_ROAD', label: 'Flooded Road', desc: 'Submerged carriage way impassable for cars' },
  { type: 'BROKEN_DRAIN', label: 'Broken Drain', desc: 'Fractured stormwater culvert or slab' },
  { type: 'BLOCKED_DRAIN', label: 'Blocked Drain', desc: 'Silt or plastic debris preventing outflow' },
  { type: 'OVERFLOWING_DRAIN', label: 'Overflowing Drain', desc: 'Drain backflow discharging on road' },
  { type: 'ROAD_CRACK', label: 'Road Crack', desc: 'Alligator cracking or structural fissure' },
  { type: 'ROAD_DAMAGE', label: 'Road Shoulder Collapse', desc: 'Embankment erosion or cave-in' },
  { type: 'ACCIDENT_REPORTED', label: 'Reported Accident', desc: 'Vehicle collision or rider fall' },
  { type: 'ROAD_BLOCKED', label: 'Road Blockage', desc: 'Fallen tree or construction obstacle' },
  { type: 'VEHICLE_STRANDED', label: 'Vehicle Stranded', desc: 'Stalled car/bus in water or ditch' },
  { type: 'OTHER', label: 'Other Hazard', desc: 'General road and safety hazard' },
];

export default function ReportPage() {
  const router = useRouter();

  const [type, setType] = useState<HazardType>('POTHOLE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('MODERATE');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [locating, setLocating] = useState(false);

  // Photo & AI Analysis
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiResult, setAiResult] = useState<{
    detections: AIDetectionItem[];
    confidence: number;
    recommended_severity: SeverityLevel;
    disclaimer: string;
  } | null>(null);
  const [aiAccepted, setAiAccepted] = useState(false);

  // Video
  const [videoUrl, setVideoUrl] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Precalculated risk estimation
  const estimatedRisk = calculateRiskScore({
    hazardType: type,
    severity,
    rainfall_mm: 15, // estimated average
    waterlogging_detected: type === 'WATERLOGGING' || type === 'FLOODED_ROAD',
    historical_reports_count: 2,
    is_major_arterial_road: true,
  });

  // Current GPS Location
  const handleUseCurrentLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAddress(`Near ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setLocating(false);
        },
        () => {
          // Default to Bengaluru Whitefield if GPS blocked
          setLatitude(12.9698);
          setLongitude(77.7499);
          setAddress('Whitefield Main Road, Bengaluru');
          setLocating(false);
        }
      );
    } else {
      setLatitude(12.9698);
      setLongitude(77.7499);
      setAddress('Whitefield Main Road, Bengaluru');
      setLocating(false);
    }
  };

  // Image Upload & AI analysis trigger
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);

      // Trigger server-side AI Vision Analysis
      setAnalyzingAI(true);
      setAiResult(null);
      setAiAccepted(false);

      try {
        const res = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            fileName: file.name,
            fileSize: file.size,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setAiResult(json.data);
          }
        }
      } catch {
        // demo fallback
      } finally {
        setAnalyzingAI(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAcceptAI = () => {
    if (!aiResult) return;
    const primary = aiResult.detections[0];
    if (primary) {
      setType(primary.hazard_type);
      setSeverity(primary.severity);
      if (!title) {
        setTitle(`AI Detected ${primary.type.replace(/_/g, ' ')} on road`);
      }
    }
    setAiAccepted(true);
  };

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive hazard title.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        type,
        title,
        description,
        latitude,
        longitude,
        address: address || `Bengaluru (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        severity,
        file_url: imagePreview || undefined,
        file_type: 'IMAGE' as const,
        ai_confidence: aiResult?.confidence,
        waterlogging_detected: type === 'WATERLOGGING' || type === 'FLOODED_ROAD',
      };

      const res = await fetch('/api/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to submit report');
      }

      setSuccessId(json.data.id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="min-h-[calc(100vh-64px)] max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white">Hazard Report Submitted</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Thank you for reporting this road condition. Your report has been tagged with GPS coordinates
          and an initial risk score of{' '}
          <strong className="text-amber-400">{estimatedRisk.final_score}/100</strong>. It is now visible
          on the live map.
        </p>

        <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>Status: Reported — Pending municipal review and field crew verification.</span>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push(`/hazard/${successId}`)}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition"
          >
            View Hazard Page
          </button>
          <button
            onClick={() => router.push('/map')}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            Explore Live Map
          </button>
          <button
            onClick={() => {
              setSuccessId(null);
              setTitle('');
              setDescription('');
              setImagePreview(null);
              setAiResult(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs transition"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-3xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <DemoBadge />
          <span className="text-xs text-slate-400">• Citizen Reporting Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Report Road Hazard or Waterlogging
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload photo evidence and coordinates. Our server-side AI model will assist with hazard
          classification and risk prioritization.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Photo & Server-side AI Analysis */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h2 className="font-bold text-sm text-white">Hazard Photo Evidence & AI Vision</h2>
            </div>
            <span className="text-[11px] text-slate-400">JPG, PNG up to 10MB</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Hazard Image
              </label>
              <label className="relative flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-500/60 bg-slate-950/60 cursor-pointer transition p-4 text-center">
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  {imageName ? imageName : 'Tap to take photo or choose file'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Automatic AI vision detection runs immediately on upload
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview & AI Result */}
            <div className="flex flex-col justify-center">
              {analyzingAI && (
                <div className="h-44 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                  <Loader2 className="w-6 h-6 text-sky-400 animate-spin mb-2" />
                  <span className="text-xs font-bold text-slate-200">Running AI Vision Analysis...</span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Detecting potholes, open manholes, waterlogging and cracks
                  </span>
                </div>
              )}

              {!analyzingAI && aiResult && (
                <div className="h-full rounded-xl bg-sky-950/30 border border-sky-500/40 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-sky-500/20">
                      <span className="font-bold text-sky-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" /> AI Detection
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                        {Math.round(aiResult.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Detected: </span>
                        <strong className="text-white capitalize">
                          {aiResult.detections[0]?.type.replace(/_/g, ' ')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px]">Severity: </span>
                        <strong className="text-amber-300">{aiResult.recommended_severity}</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 italic mt-1">
                        &ldquo;{aiResult.detections[0]?.description}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-sky-500/20 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAcceptAI}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                        aiAccepted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {aiAccepted ? 'Accepted' : 'Accept Suggestion'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiAccepted(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                    >
                      Correct
                    </button>
                  </div>
                </div>
              )}

              {!analyzingAI && !aiResult && (
                <div className="h-44 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center p-4 text-center">
                  <ShieldCheck className="w-6 h-6 text-slate-600 mb-1" />
                  <span className="text-xs text-slate-500">Image preview and AI results appear here.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Location & GPS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h2 className="font-bold text-sm text-white">Geospatial Coordinates</h2>
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="px-3 py-1.5 rounded-xl bg-sky-600/20 border border-sky-500/40 text-sky-300 hover:bg-sky-600/30 text-xs font-bold flex items-center gap-1.5 transition"
            >
              {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
              Use My Current Location
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Road / Landmark Name
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 100 Feet Rd near 12th Main, Indiranagar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Hazard Categorization & Details */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h2 className="font-bold text-sm text-white">Hazard Details & Severity</h2>
            </div>
            <div className="text-[11px] font-bold text-amber-400">
              Est. Risk Score: {estimatedRisk.final_score}/100
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Hazard Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HAZARD_OPTIONS.map((opt) => {
                const isSelected = type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setType(opt.type)}
                    className={`p-2.5 rounded-xl text-left border transition flex items-start gap-2 ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">{getHazardIcon(opt.type, 'w-4 h-4')}</div>
                    <div>
                      <div className="text-xs leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole right before Sony World signal"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context on depth, vehicle flow impact, or water buildup..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`py-2 rounded-xl text-center text-xs font-bold border transition ${
                    severity === lvl
                      ? lvl === 'CRITICAL'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : lvl === 'HIGH'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : lvl === 'MODERATE'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer & Submit */}
        <div className="pt-2">
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <strong className="text-slate-300">Disclaimer:</strong> Submitting a report alerts other
            citizens and municipal maintenance crews. Reports are initially marked as{' '}
            <em>Pending Verification</em> until validated by an authorized administrator.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-black text-sm tracking-wide shadow-xl shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Geo-tagged Report...
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                Submit Hazard Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
