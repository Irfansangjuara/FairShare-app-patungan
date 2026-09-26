"use client";

import { useState } from "react";
import { Share2, Check, Copy, Link as LinkIcon, RefreshCw, X } from "lucide-react";
import { regenerateShareTokenAction } from "../server/actions/event";

interface ShareLinkButtonProps {
  eventId: string;
  shareToken: string | null;
}

export function ShareLinkButton({ eventId, shareToken: initialToken }: ShareLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const shareUrl =
    typeof window !== "undefined" && token
      ? `${window.location.origin}/share/${token}`
      : "";

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy share link:", err);
    }
  };

  const handleRegenerate = async () => {
    if (
      confirm(
        "Tautan lama tidak akan dapat diakses lagi setelah diperbarui. Lanjutkan membuat tautan baru?"
      )
    ) {
      setIsRegenerating(true);
      try {
        const newToken = await regenerateShareTokenAction(eventId);
        setToken(newToken);
      } catch (err) {
        console.error(err);
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        title="Bagikan Tautan Baca-Saja"
      >
        <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
        <span>Tautan Berbagi</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="card-diskon w-full max-w-md p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Share2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Tautan Berbagi Baca-Saja</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Siapa pun yang memiliki tautan ini dapat melihat rincian patungan, status pelunasan,
              dan menyalin rekap WhatsApp tanpa perlu login. <strong>Mereka tidak dapat mengubah data.</strong>
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono bg-slate-50 text-slate-800 focus:outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className="btn-pill-primary text-xs py-2 px-3 shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Tersalin" : "Salin"}</span>
              </button>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="text-slate-500 hover:text-rose-600 inline-flex items-center gap-1 transition-colors"
                title="Batalkan tautan lama dan buat tautan baru"
              >
                <RefreshCw className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`} />
                <span>Perbarui / Cabut Tautan</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="btn-pill-primary text-xs py-1.5 px-4"
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
