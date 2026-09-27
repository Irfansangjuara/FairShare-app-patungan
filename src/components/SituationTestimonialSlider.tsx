"use client";

import React, { useEffect, useRef } from "react";
import Swiper from "swiper";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export interface TestimonialItem {
  id: number;
  quote: string;
  author: string;
  role?: string;
  avatar: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: 1,
    quote: "Checklist lunasnya bikin tenang. Gak perlu tanya satu-satu siapa yang sudah transfer.",
    author: "Aditya Permana",
    role: "Panitia Event",
    avatar: "/assets/img/fair-share-p5.jpg",
  },
  {
    id: 2,
    quote: "Cocok buat trip rame-rame. Bahkan sisa Rp 1 tetap dibagi dengan jelas dan konsisten.",
    author: "Kevin Sanjaya",
    role: "Perjalanan Grup",
    avatar: "/assets/img/fair-share-p6.jpg",
  },
  {
    id: 3,
    quote: "Semua pengeluaran trip langsung kelihatan. Gak ada lagi yang bingung harus transfer ke siapa.",
    author: "Rizky Ramadhan",
    role: "Trip Kantor",
    avatar: "/assets/img/fair-share-p1.jpg",
  },
  {
    id: 4,
    quote: "Rekapnya rapi banget buat dibagikan ke grup. Tinggal salin, kirim, lalu semua langsung paham.",
    author: "Nadia Safitri",
    role: "Grup Teman",
    avatar: "/assets/img/fair-share-p2.jpg",
  },
  {
    id: 5,
    quote: "Biasanya aku hitung ulang berkali-kali. Sekarang jatah dan saldo tiap orang langsung jelas.",
    author: "Bayu Pratama",
    role: "Liburan Keluarga",
    avatar: "/assets/img/fair-share-p3.jpg",
  },
  {
    id: 6,
    quote: "Tambah anggota dan pengeluaran gampang banget. Hasil pelunasannya langsung siap dicek.",
    author: "Clarissa Putri",
    role: "Acara Komunitas",
    avatar: "/assets/img/fair-share-p4.jpg",
  },
];

export default function SituationTestimonialSlider() {
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const swiperInstanceRef = useRef<Swiper | null>(null);

  useEffect(() => {
    if (!swiperContainerRef.current) return;

    swiperInstanceRef.current = new Swiper(swiperContainerRef.current, {
      modules: [Pagination, Autoplay],
      slidesPerView: 1,
      loop: true,
      spaceBetween: 30,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination-situation",
        clickable: true,
        bulletClass: "situation-bullet",
        bulletActiveClass: "situation-bullet-active",
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
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
    <div className="w-full relative">
      <style jsx global>{`
        .situation-bullet {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background-color: #d1d5db;
          margin: 0 4px;
          cursor: pointer;
          transition: all 0.25s ease-in-out;
        }
        .situation-bullet-active {
          background-color: #007aff !important;
          transform: scale(1.1);
        }
      `}</style>

      <div ref={swiperContainerRef} className="swiper swiper2 overflow-hidden">
        <div className="swiper-wrapper flex pb-4">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="swiper-slide h-auto grid grid-cols-1 gap-4 p-8 bg-white rounded-3xl shadow-sm select-none"
            >
              {/* Star Rating: 5 stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-yellow-400 size-6 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>

              {/* Quote Content */}
              <p className="text-gray-900 text-base leading-relaxed min-h-[52px]">
                {item.quote}
              </p>

              {/* Author & Avatar */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  <div className="font-semibold text-gray-900 text-base">
                    {item.author}
                  </div>
                  {item.role && (
                    <div className="text-xs text-gray-500 font-normal mt-0.5">
                      {item.role}
                    </div>
                  )}
                </div>
                <img
                  className="rounded-full w-[50px] h-[50px] object-cover shrink-0 border border-slate-100 shadow-2xs"
                  src={item.avatar}
                  width={50}
                  height={50}
                  alt={item.author}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="swiper-pagination-situation flex justify-center items-center mt-8 mb-2" />
      </div>
    </div>
  );
}
