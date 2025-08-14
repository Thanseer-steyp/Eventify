"use client";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    stars: 5,
    text: `Greenlands Farm Village have found Eventify to have excellent customer service...`,
    name: "Jane",
    company: "Greenlands Farm Village",
    logo: "/greenlands_mini.png",
  },
  {
    stars: 5,
    text: `We're delighted with the quality of customer service from Eventify...`,
    name: "Lizzie Beckford",
    company: "Pink Link Ladies",
    logo: "/pink-link-logo.png",
  },
  {
    stars: 5,
    text: `Absolutely great package, easy to use from all angles from creation of an event...`,
    name: "Paul Chambers",
    company: "via Google",
    logo: "/gcrn.webp",
  },
];

const TestimonialCard = ({ review }) => (
  <div className="bg-white p-6 rounded-xl flex flex-col justify-between">
    <div>
      <div className="text-yellow-500 mb-2">
        {"★".repeat(review.stars)}
      </div>
      <p className="text-gray-700 mb-4  h-[70px]">"{review.text}"</p>
    </div>
    <div className="flex items-center gap-3 mt-4">
      <img src={review.logo} alt={review.company} className="h-10 w-10 object-contain" />
      <div>
        <p className="font-semibold text-sky-700">{review.name}</p>
        <p className="text-gray-500 text-sm">{review.company}</p>
      </div>
    </div>
  </div>
);

const TestimonialCarousel = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  return (
    <div className="bg-[#f1f7fa] py-16">
      <div className="wrapper">
      <h2 className="text-3xl font-bold text-[#01517f] mb-4 text-center">Trusted by thousands of event organisers</h2>
      <p className="mb-6 text-gray-700 text-center">
        From small fundraisers to festivals, thousands of event organisers trust our event ticketing solution.
      </p>
      <Slider {...settings}>
        {testimonials.map((review, idx) => (
          <div key={idx} className="px-2">
            <TestimonialCard review={review} />
          </div>
        ))}
      </Slider>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
