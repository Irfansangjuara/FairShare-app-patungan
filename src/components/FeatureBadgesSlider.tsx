"use client";

import React, { useEffect, useRef } from "react";
import Swiper from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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
  const swiperContainerRef = useRef<HTMLElement>(null);
  const swiperInstanceRef = useRef<Swiper | null>(null);

  useEffect(() => {
    if (!swiperContainerRef.current) return;

    swiperInstanceRef.current = new Swiper(swiperContainerRef.current, {
      modules: [Autoplay, Pagination],
      direction: "horizontal",
      loop: true,
      centeredSlides: true,
      slidesPerView: 1,
      spaceBetween: 30,
      observer: true,
      observeParents: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination-features",
        clickable: true,
        bulletClass: "feature-bullet",
        bulletActiveClass: "feature-bullet-active",
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

    const timer = setTimeout(() => {
      swiperInstanceRef.current?.update();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (swiperInstanceRef.current) {
        swiperInstanceRef.current.destroy(true, true);
        swiperInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section
      ref={swiperContainerRef}
      className="px-4 swiper swiper1 w-full min-w-0 overflow-hidden select-none py-4 relative"
    >
      <style jsx global>{`
        .feature-bullet {
          width: 8px;
          height: 8px;
          display: inline-block;
          border-radius: 9999px;
          background: #cbd5e1;
          opacity: 1;
          margin: 0 4px;
          transition: all 0.25s ease-in-out;
          cursor: pointer;
        }
        .feature-bullet-active {
          background: #007aff !important;
          width: 24px;
          border-radius: 9999px;
        }
      `}</style>

      <div className="flex items-center pb-8 w-full md:pb-16 swiper-wrapper">
        {featureCards.map((card) => (
          <div key={card.id} className="overflow-hidden p-1 swiper-slide">
            <div
              className={`flex relative flex-col gap-4 justify-center items-center px-4 py-8 text-white ${card.bg} rounded-3xl before:w-20 before:h-20 before:rounded-full before:bg-white before:-left-12 before:top-1/2 before:-translate-y-1/2 before:absolute after:w-20 after:h-20 after:rounded-full after:bg-white after:-right-12 after:top-1/2 after:-translate-y-1/2 after:absolute shadow-sm`}
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

      <div className="swiper-pagination-features flex justify-center items-center mt-2 mb-4" />
    </section>
  );
}
