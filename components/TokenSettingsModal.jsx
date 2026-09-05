"use client";

import { useState, useEffect } from "react";
import { KeyRound, X, ExternalLink, Check, ShieldCheck } from "lucide-react";

export default function TokenSettingsModal({
  isOpen,
  onClose,
  onSaveToken,
  currentToken,
}) {
  const [tokenInput, setTokenInput] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentToken) {
      setTokenInput(currentToken);
    }
  }, [currentToken]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveToken(tokenInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <KeyRound size={22} style={{ color: "var(--accent-gold)" }} />
            Cesium Ion API Key
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            marginBottom: 16,
          }}
        >
          Namma Bengaluru 3D Explorer works out of the box with high-resolution satellite basemaps. To enable custom Cesium World Terrain and photorealistic 3D buildings, you can optionally provide your free Cesium Ion Access Token.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Access Token
          </label>
          <input
            type="text"
            className="search-input"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="eyJhbGciOi..."
            style={{
              width: "100%",
              marginTop: 6,
              padding: "12px 14px",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid var(--border-glass)",
              borderRadius: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            fontSize: 12,
            color: "var(--accent-gold)",
          }}
        >
          <ShieldCheck size={16} />
          <span>Token is saved locally in your browser storage.</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <a
            href="https://ion.cesium.com/tokens"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--text-secondary)",
              fontSize: 12,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Get a free Cesium token <ExternalLink size={13} />
          </a>

          <button
            className="action-btn-primary"
            onClick={handleSave}
            style={{ width: "auto", padding: "10px 20px" }}
          >
            {savedSuccess ? (
              <>
                <Check size={16} /> Saved
              </>
            ) : (
              "Save Token"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
