"use client";

import { useState } from "react";
import { Share2, Check, Copy, X } from "lucide-react";

interface WhatsAppRecapButtonProps {
  recapText: string;
}

export function WhatsAppRecapButton({ recapText }: WhatsAppRecapButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(recapText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        // Fallback for non-secure contexts or older mobile browsers
        setShowFallbackModal(true);
      }
    } catch (err) {
      console.warn("Clipboard API failed, opening fallback modal:", err);
      setShowFallbackModal(true);
    }
  };

  const handleShareToWhatsApp = () => {
    const encoded = encodeURIComponent(recapText);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleCopy}
          className="btn-pill-lime text-xs sm:text-sm py-2 px-4 shadow-sm"
          title="Salin rekap siap kirim ke WhatsApp"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-800" />
              <span className="text-emerald-950 font-bold">Tersalin ke Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Salin Rekap WhatsApp</span>
            </>
          )}
        </button>

        <button
          onClick={handleShareToWhatsApp}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          title="Buka WhatsApp langsung"
        >
          <Share2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Buka WA</span>
        </button>
      </div>

      {/* Fallback Modal */}
      {showFallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="card-diskon w-full max-w-lg p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Salin Rekap WhatsApp Manual</h3>
              <button
                onClick={() => setShowFallbackModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Peramban tidak mengizinkan akses clipboard otomatis. Silakan pilih dan salin teks di bawah ini secara manual:
            </p>

            <textarea
              readOnly
              value={recapText}
              rows={12}
              className="w-full rounded-2xl border border-slate-300 p-3 font-mono text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFallbackModal(false)}
                className="btn-pill-primary text-xs py-2 px-5"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
