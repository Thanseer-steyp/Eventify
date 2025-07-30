"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const carouselImages = [
  {
    src: "/Al1.jpg",
    alt: "Sundown Party",
    heading: "Discover and Book Events Near You",
    buttonText: "Browse Events",
    buttonLink: "/events",
  },
  {
    src: "/Al2.jpg",
    alt: "Music Festival",
    heading: "Create Your Own Unforgettable Events",
    buttonText: "Host an Event",
    buttonLink: "events/create",
  },
  {
    src: "/Al3.jpg",
    alt: "Art Night",
    heading: "Explore Unique Events Curated Just for You",
    buttonText: "Start Exploring",
    buttonLink: "/events",
  },
];

function LoopCarousel() {
  const [index, setIndex] = useState(0);
  const total = carouselImages.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(interval);
  }, [total]);

  const getPosition = (i) => {
    if (i === index) return "z-20 scale-100";
    if (i === (index - 1 + total) % total)
      return "-translate-x-[110%] scale-75 z-10 opacity-80";
    if (i === (index + 1) % total)
      return "translate-x-[110%] scale-75 z-10 opacity-80";
    return "opacity-0 scale-50 z-0 pointer-events-none";
  };

  return (
    <div className="bg-[#0b1c2d]">
      <div className="wrapper "></div>
      <div className="relative h-[calc(100vh-87px)] overflow-hidden bg-[#0b1c2d] flex items-center justify-center">
        {/* 🔁 All Slides Positioned Absolutely */}
        {carouselImages.map((image, i) => (
          <div
            key={i}
            className={`absolute transition-all duration-700 ease-in-out transform ${
              i === index ? "w-full md:w-[70vw]" : "w-[50vw]"
            } h-[80vh] rounded-xl overflow-hidden ${getPosition(i)}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover rounded-xl opacity-75"
            />

            {/* 🔻 Slide Content */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-start px-10">
              <div className="wrapper text-white flex flex-col gap-6 items-start py-52">
                <h1 className="text-7xl font-semibold text-white w-[730px]">
                  {image.heading}
                </h1>
                <Link
                  href={image.buttonLink}
                  className="bg-yellow-400 px-5 py-3 rounded-lg font-bold tracking-wider text-[#131d30] w-max"
                >
                  {image.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoopCarousel;
