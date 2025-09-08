"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function Slider() {
  const slides = [
    {
      title: "For Doctors",
      desc: "Manage appointments, prescriptions, and patient history effortlessly.",
    },
    {
      title: "For Patients",
      desc: "Book appointments, order medicines, and track your health easily.",
    },
    {
      title: "For Pharmacies",
      desc: "Seamlessly manage stock, prescriptions, and deliveries in real-time.",
    },
    {
      title: "For Hospitals",
      desc: "Centralized system for clinics, hospitals, and telemedicine services.",
    },
    {
      title: "For Pharma Companies",
      desc: "Analytics, campaigns, and structured insights in one place.",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">
        Explore UGS Healthcare
      </h2>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md p-6 max-w-xl mx-auto text-center">
              <h3 className="text-2xl font-semibold text-blue-600 mb-4">
                {slide.title}
              </h3>
              <p className="text-gray-600">{slide.desc}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
