import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FairShare — Aplikasi Patungan & Pelunasan Cerdas",
    short_name: "FairShare",
    description: "Hitung jatah patungan, saldo anggota, dan rekomendasi transfer pelunasan.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#b7e913",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
