"use client";

import { useState } from "react";
import { Send, CheckCircle2, MessageSquare, Mail, Phone, Sparkles, ArrowRight } from "lucide-react";

export function PublicContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Pertanyaan Umum & Cara Pakai");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ ticketId: string; name: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    // Simulate instantaneous graceful submission
    setTimeout(() => {
      const ticketId = `FS-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedData({ ticketId, name: name.trim() });
      setIsSubmitting(false);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 700);
  };

  if (submittedData) {
    return (
      <div className="rounded-3xl border-2 border-lime-400 bg-slate-950 p-6 sm:p-10 text-white shadow-2xl animate-in zoom-in-95 space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-lime-400/20 px-3.5 py-1 text-xs font-bold text-lime-400 font-sans">
          <CheckCircle2 className="h-4 w-4" />
          <span>Pesan Berhasil Terkirim!</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Terima kasih, {submittedData.name}!
        </h3>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Pesan dan pertanyaan Anda telah kami terima dengan nomor tiket{" "}
          <strong className="text-[#b7e913] font-mono">#{submittedData.ticketId}</strong>.
          Tim Fair Share akan merespons melalui email Anda dalam waktu maksimal 1x24 jam kerja.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setSubmittedData(null)}
            className="btn-pill-lime text-xs sm:text-sm py-3 px-6 font-bold"
          >
            Kirim Pesan Lainnya
          </button>
          <a
            href="https://wa.me/6281234567890?text=Halo%20FairShare,%20saya%20butuh%20bantuan%20cepat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm py-3 px-6 font-semibold transition-colors"
          >
            <Phone className="h-4 w-4 text-lime-400" />
            <span>Chat Cepat via WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
          Formulir Kirim Pesan &amp; Dukungan
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Isi detail pertanyaan Anda di bawah ini. Tim kami siap memberikan panduan cepat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Rian Anggoro"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Alamat Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nomor WhatsApp (Opsional)
          </label>
          <input
            type="tel"
            placeholder="0812xxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Kategori Pertanyaan <span className="text-rose-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white font-sans"
          >
            <option value="Pertanyaan Umum & Cara Pakai">Pertanyaan Umum &amp; Cara Pakai</option>
            <option value="Bantuan Hitungan & Pelunasan">Bantuan Hitungan &amp; Pelunasan</option>
            <option value="Laporan Kendala / Bug">Laporan Kendala / Bug</option>
            <option value="Saran Fitur Baru">Saran Fitur Baru</option>
            <option value="Kerjasama & Kemitraan">Kerjasama &amp; Kemitraan</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Isi Pesan / Pertanyaan <span className="text-rose-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          placeholder="Tuliskan kendala, pertanyaan, atau saran Anda secara rinci..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 font-sans"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-[11px] text-slate-400">
          Data Anda aman dan hanya digunakan untuk merespons pertanyaan ini.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn primary btn-lg group w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? "Mengirim Pesan..." : "Kirim Pesan Sekarang"}</span>
          <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </form>
  );
}
