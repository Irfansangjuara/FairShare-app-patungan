"use client";

import React, { useEffect, useRef } from "react";
import Swiper from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export interface FeatureCard {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  bg: string;
}

const featureCards: FeatureCard[] = [
  {
    id: 1,
    title: "Catat Pengeluaran",
    subtitle: "Satu Tempat",
    tag: "Lebih Rapi",
    bg: "bg-pink-400",
  },
  {
    id: 2,
    title: "Hitung Otomatis",
    subtitle: "Jatah Masing-masing",
    tag: "Presisi Rupiah",
    bg: "bg-purple-400",
  },
  {
    id: 3,
    title: "Saldo Anggota",
    subtitle: "Siapa Bayar Siapa",
    tag: "Langsung Jelas",
    bg: "bg-blue-400",
  },
  {
    id: 4,
    title: "Minim Transfer",
    subtitle: "Pelunasan Ringkas",
    tag: "Hemat Waktu",
    bg: "bg-orange-400",
  },
  {
    id: 5,
    title: "Checklist Lunas",
    subtitle: "Status Tersimpan",
    tag: "Mudah Dipantau",
    bg: "bg-teal-400",
  },
  {
    id: 6,
    title: "Rekap WhatsApp",
    subtitle: "Siap Dibagikan",
    tag: "Sekali Salin",
    bg: "bg-red-400",
  },
  {
    id: 7,
    title: "Trip & Acara",
    subtitle: "Semua Kebutuhan",
    tag: "Fleksibel",
    bg: "bg-yellow-400",
  },
  {
    id: 8,
    title: "Daftar Gratis",
    subtitle: "Mulai Sekarang",
    tag: "Tanpa Ribet",
    bg: "bg-emerald-400",
  },
];

export default function FeatureBadgesSlider() {
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const swiperInstanceRef = useRef<Swiper | null>(null);

  useEffect(() => {
    if (!swiperContainerRef.current) return;

    swiperInstanceRef.current = new Swiper(swiperContainerRef.current, {
      modules: [Autoplay],
      direction: "horizontal",
      loop: true,
      centeredSlides: true,
      slidesPerView: 1,
      spaceBetween: 30,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 3,
        },
        1300: {
          slidesPerView: 5,
        },
        1600: {
          slidesPerView: 6,
        },
      },
    });

    return () => {
      if (swiperInstanceRef.current) {
        swiperInstanceRef.current.destroy(true, true);
        swiperInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section className="px-4 swiper swiper1 overflow-hidden select-none py-4">
      <div ref={swiperContainerRef} className="swiper-container w-full overflow-hidden">
        <div className="flex items-center pb-8 w-full md:pb-16 swiper-wrapper">
          {featureCards.map((card) => (
            <div key={card.id} className="overflow-hidden p-1 swiper-slide">
              <div
                className={`flex relative flex-col gap-4 justify-center items-center px-4 py-8 text-white ${card.bg} rounded-3xl before:w-20 before:h-20 before:rounded-full before:bg-white before:-left-12 before:absolute after:w-20 after:h-20 after:rounded-full after:bg-white after:-right-12 after:absolute shadow-sm`}
              >
                <div className="text-base font-normal">{card.title}</div>
                <div className="px-4 text-2xl font-medium text-center max-md:text-xl leading-snug">
                  {card.subtitle}
                </div>
                <div className="px-4 py-2 rounded-full bg-black/10 text-sm font-medium">
                  {card.tag}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
