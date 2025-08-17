"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import axios from "axios";
import Skeleton1 from "../../../components/includes/Skeleton1";

import Location from "../../../components/assets/location.svg";
import Calender from "../../../components/assets/calendar.svg";
import eventImg from "../../../components/assets/event.jpeg";
import bookMark from "../../../components/assets/bookmark.svg";
import duration from "../../../components/assets/duration.png";
import info from "../../../components/assets/info.png";
import kid from "../../../components/assets/kid.png";
import pet from "../../../components/assets/pet.png";
import ticket from "../../../components/assets/ticket.png";
import seat from "../../../components/assets/seat.png";
import language from "../../../components/assets/language.png";
import crowd from "../../../components/assets/crowd.svg";

const EventDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [animateModal, setAnimateModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingInfo, setBookingInfo] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const handlePinChange = (value, index) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isAuthenticated =
    typeof window !== "undefined" && !!localStorage.getItem("access");

  const handleBooking = () => {
    if (!isAuthenticated) {
      router.push("/authentication");
      return;
    }

    if (event.tickets_left === 0) {
      toast.warning("🚫 No tickets available");
      return;
    }

    // Check if default quantity is greater than available tickets
    if (quantity > event.tickets_left) {
      toast.warning(`Only ${event.tickets_left} tickets are available`);
      return;
    }

    setShowBookingModal(true);
    setTimeout(() => setAnimateModal(true), 20);
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const closeModal = () => {
    setAnimateModal(false);
    setTimeout(() => {
      setShowBookingModal(false);
      setQuantity(1); // reset quantity
      setPin(["", "", "", ""]); // reset PIN
      setPaymentMethod("upi"); // reset payment method
    }, 200);
  };

  const fetchEventById = async (eventId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/public/events/${eventId}/`
      );
      const eventData = res.data;

      return {
        ...eventData,
        numericPrice: Math.floor(Number(eventData.price)),
        price:
          Math.floor(Number(eventData.price)) === 0
            ? "Free"
            : `₹${Math.floor(Number(eventData.price))}`,
        displayTime: convertTo12Hour(eventData.time),
      };
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  };

  useEffect(() => {
    const getEvent = async () => {
      const eventData = await fetchEventById(id);
      if (eventData) setEvent(eventData);
    };
    getEvent();
  }, [id]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    const shouldDisableScroll = showBookingModal || showTicketModal;

    document.body.style.overflow = shouldDisableScroll ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showBookingModal, showTicketModal]);

  if (!event) {
    return <Skeleton1 />;
  }

  return (
    <div className="bg-custom-gradient p-8 relative w-full">
      <div className="wrapper flex justify-between">
        <div className="w-[66%] rounded-xl">
          <Image
            src={event.image}
            alt={event.title}
            width={800}
            height={450}
            className="rounded-xl mb-6 w-full h-[450px] block"
          />
          {/* <h1 className="text-4xl font-bold mb-4">{event.title}</h1> */}
          {event.description && (
            <div className="text-black">
              <h2 className="text-xl font-bold mb-3">About This Event</h2>
              <p className="leading-relaxed text-l">{event.description}</p>
            </div>
          )}
          <hr className="border border-gray-200 my-4" />
          {(event.guest || event.guest_image) && (
            <div>
              <div className="text-black">
                <div className="my-3 flex gap-2 items-center">
                  <div className="rounded-full overflow-hidden">
                    <Image
                      src={event.guest_image || "/np2.png"}
                      alt={event.title}
                      width={60}
                      height={60}
                    />
                  </div>
                  <div>
                    <p className="text-[#9ea2ac] text-sm">Special Guest</p>
                    <h6 className="font-bold  text-xl">
                      {event.guest || "Special Guest"}
                    </h6>
                  </div>
                </div>
              </div>
              <hr className="border border-[#f0f1f2] my-4" />
            </div>
          )}
          <div className="text-black">
            <h2 className="text-xl font-bold mb-3">Event Guide</h2>
            <ul className="grid grid-cols-3 gap-5">
              <li className="flex items-center">
                <Image
                  src={language}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Language</p>
                  <h6>Malayalam</h6>
                </div>
              </li>
              <li className="flex items-center">
                <Image
                  src={duration}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Duration</p>
                  <h6>{event.duration} Hour</h6>
                </div>
              </li>
              <li className="flex items-center">
                <Image
                  src={crowd}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Max attendance</p>
                  <h6>{event.max_attendees}</h6>
                </div>
              </li>
              <li className="flex items-center">
                <Image
                  src={ticket}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Tickets needed for</p>
                  <h6>All ages</h6>
                </div>
              </li>
              <li className="flex items-center">
                <Image
                  src={info}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Entry allowed for</p>
                  <h6>All ages</h6>
                </div>
              </li>
              <li className="flex items-center">
                <Image
                  src={info}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Layout</p>
                  <h6>Indoor</h6>
                </div>
              </li>
              <li className="flex items-center">
                <Image
                  src={seat}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Seating</p>
                  <h6>Seated</h6>
                </div>
              </li>
              <li className="flex items-center">
                <Image
                  src={kid}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Kids friendly?</p>
                  <h6>Yes</h6>
                </div>
              </li>
              <li className="flex items-center">
                <Image
                  src={pet}
                  alt="icon"
                  className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg"
                />
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Pet friendly?</p>
                  <h6>No</h6>
                </div>
              </li>
            </ul>
          </div>
          <hr className="border border-[#f0f1f2] my-4" />
          <div>
            <h2 className="text-xl font-bold text-black mb-3">Gallery</h2>
            {event.gallery && event.gallery.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {/* First image large */}
                <div className="col-span-2 row-span-2">
                  <img
                    src={event.gallery[0]}
                    alt="Event"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Render the rest */}
                {event.gallery.slice(1).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Gallery ${index + 2}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center my-6 italic">
                Gallery images not provided.
              </p>
            )}
          </div>
          <hr className="border border-[#f0f1f2] my-4" />
          <div className="text-black">
            <h2 className="text-xl font-bold mb-3">Contact</h2>
            <ul className="grid grid-cols-1 gap-4">
              <li className="flex items-center">
                <div className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-600"
                  >
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Organizer</p>
                  <h6 className="font-medium capitalize">{event.organizer}</h6>
                </div>
              </li>
              <li className="flex items-center">
                <div className="w-[50px] h-[50px] bg-[#f3f3f5] p-3 rounded-lg flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-600"
                  >
                    <path
                      d="m4 4 16 0c1.1 0 2 .9 2 2l0 12c0 1.1-.9 2-2 2l-16 0c-1.1 0-2-.9-2-2l0-12c0-1.1 .9-2 2-2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="22,6 12,13 2,6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-[#9ea2ac] text-xs">Email</p>
                  <h6 className="font-medium">
                    {event.organizer_email || `${event.organizer}@gmail.com`}
                  </h6>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className=" w-[31%]">
          <div className="h-max p-[18px] bg-white rounded-xl border border-[#e1e3e6]">
            <h1 className="text-xl font-bold tracking-wide mb-4 text-black uppercase">
              {event.title}
            </h1>
            <div className="space-y-2">
              <p className="flex items-center text-gray-300">
                <Image src={bookMark} alt="category" className="w-6 h-6 mr-2" />
                <span className="ml-2 text-black font-semibold text-sm capitalize">
                  {event.category}
                </span>
              </p>
              <p className="flex items-center text-gray-300">
                <Image src={Calender} alt="calender" className="w-6 h-6 mr-2" />
                <span className="ml-2 text-black font-semibold text-sm capitalize">
                  {(() => {
                    const date = new Date(event.date);
                    const day = date.toLocaleDateString("en-GB", {
                      weekday: "short",
                    }); // e.g. Sun
                    const dd = date.toLocaleDateString("en-GB", {
                      day: "2-digit",
                    }); // e.g. 03

                    const month = months[date.getMonth()]; // always 3 letters
                    return `${day} ${dd} ${month}`;
                  })()}{" "}
                  | {event.displayTime} onwards
                </span>
              </p>
              <p className="flex items-center text-gray-300">
                <Image src={Location} alt="location" className="w-6 h-6 mr-2" />
                <span className="ml-2 text-black font-semibold text-sm capitalize">
                  {event.location}
                </span>
              </p>
            </div>
            <hr className="w-full border border-[#e2e2e2] my-3" />
            <div className="flex gap-10 justify-between">
              <div>
                <p className="text-[#555d6d] text-xs">Entry</p>
                <span className="text-black font-bold text-xl">
                  {event.price}
                </span>
              </div>

              {bookingInfo ? (
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="bg-[#131316] cursor-pointer text-white px-5 py-2 rounded-md font-semibold"
                >
                  View Ticket
                </button>
              ) : (
                <button
                  className="bg-[#131316] cursor-pointer text-white px-5 py-2 rounded-md font-semibold"
                  onClick={handleBooking}
                >
                  Buy Tickets
                </button>
              )}
            </div>
          </div>
          <div className="h-max p-[18px] bg-white rounded-xl border border-[#e1e3e6] mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-[40px] h-[40px] bg-[#f3f3f5] p-2 rounded-lg flex items-center justify-center mr-3">
                  {event.tickets_left === 0 ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-red-500"
                    >
                      <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    // Check icon for available tickets
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={
                        event.tickets_left < 10
                          ? "text-red-500"
                          : event.tickets_left < 25
                          ? "text-orange-500"
                          : "text-green-500"
                      }
                    >
                      <path
                        d="M9 12l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[#9ea2ac] text-xs">Availability</p>
                  <span className="text-black font-semibold">
                    {event.tickets_left} tickets left
                  </span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="w-16 h-16 relative">
                <svg
                  className="w-16 h-16 transform -rotate-90"
                  viewBox="0 0 64 64"
                >
                  {/* Background circle */}
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#f3f3f5"
                    strokeWidth="4"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={
                      event.tickets_left < 10
                        ? "#ef4444"
                        : event.tickets_left < 25
                        ? "#f97316"
                        : "#22c55e"
                    }
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={
                      (event.tickets_left / event.max_attendees) * 175.93 +
                      " 175.93"
                    }
                    className="transition-all duration-300 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-black">
                    {Math.round(
                      (event.tickets_left / event.max_attendees) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div
              className={
                "mt-2 w-max px-2 py-1 rounded-full text-xs font-medium " +
                (event.tickets_left < 10
                  ? "bg-red-100 text-red-700"
                  : event.tickets_left < 25
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700")
              }
            >
              {event.tickets_left == 0
                ? "❌ Sold Out"
                : event.tickets_left < 10
                ? "🔥 Almost Sold Out"
                : event.tickets_left < 25
                ? "⚡ Limited Seats"
                : "✅ Available"}
            </div>
          </div>
        </div>

        {/* Payment/Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-8 w-[35%] shadow-2xl border border-gray-100 overflow-y-auto"
            >
              {/* Header */}

              <div className="mb-3">
                <h2 className="text-xl font-bold text-black mb-1 text-center">
                  Book Tickets
                </h2>
                <p className="text-gray-500 text-sm text-center">
                  {event.title}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <div className="flex items-center justify-center bg-gray-100 p-3 rounded-xl border border-gray-300">
                  <button
                    onClick={decrement}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12h14"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <div className="mx-8 text-center">
                    <span className="text-3xl font-bold text-black">
                      {quantity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Tickets</p>
                  </div>
                  <button
                    onClick={increment}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-100 p-4 rounded-xl mb-6 border border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    Subtotal ({quantity} tickets)
                  </span>
                  <span className="font-semibold text-black">
                    ₹{(+event?.numericPrice || 0) * (+quantity || 0)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="text-black font-semibold text-sm mb-3 block">
                  Payment Method
                </label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="appearance-none w-full p-2 rounded-md bg-gray-100 border border-gray-300 text-black focus:outline-none"
                  >
                    <option value="upi">UPI</option>
                    <option value="card">Credit Card</option>
                    <option value="card">Debit Card</option>
                    <option value="wallet">Wallet</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* PIN Entry */}
              <div className="mb-8">
                <label className="text-black font-semibold text-sm mb-3 block">
                  Enter Security PIN
                </label>
                <div className="grid grid-cols-4 gap-8">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d?$/.test(val)) {
                          handlePinChange(val, index);
                        }
                      }}
                      className="text-xl h-14 text-center rounded-md border border-gray-300 bg-gray-100 text-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 p-3 text-white bg-red-600 border border-gray-300 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (pin.some((digit) => digit === "")) {
                      toast.error("PIN not valid. Please enter all 4 digits.");
                      return;
                    }

                    if (quantity > event.tickets_left) {
                      toast.error(
                        `Only ${event.tickets_left} tickets are available`
                      );
                      return;
                    }

                    try {
                      const res = await axios.post(
                        "http://localhost:8000/api/v1/user/tickets/book/",
                        {
                          event: id,
                          quantity: quantity,
                        },
                        {
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(
                              "access"
                            )}`,
                          },
                        }
                      );

                      const eventData = res.data;
                      setBookingInfo(eventData);
                      closeModal();
                      toast.success("Payment completed successfully!");
                      setEvent((prevEvent) => ({
                        ...prevEvent,
                        tickets_left: prevEvent.tickets_left - quantity,
                      }));
                    } catch (error) {
                      console.error(
                        "Booking Error:",
                        error.response?.eventData || error.message
                      );
                      toast.error("Failed to book tickets. Please try again.");
                    }
                  }}
                  className="flex-1 p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  Complete Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Ticket Display Modal */}
        {showTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0, opacity: 0, rotateY: 90 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl w-[35%] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Event Ticket</h2>
                    <p className="text-blue-100 text-sm">Digital Pass</p>
                  </div>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                        stroke="green"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Perforated line effect */}

              {/* Ticket Content */}
              <div className="p-3 space-y-3 flex-1">
                {/* Event Title */}
                <div className="text-center border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {event.title}
                  </h3>
                  <p className="text-gray-500">{event.location}</p>
                </div>

                {/* Ticket Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-rows-3 gap-4">
                    {bookingInfo.id && (
                      <div className="bg-gray-100 p-3 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                        <p className="font-bold text-gray-800">
                          #{bookingInfo.id}
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="font-bold text-gray-800">
                        {new Date(event.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Time</p>
                      <p className="font-bold text-gray-800">
                        {event.displayTime}
                      </p>
                    </div>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="grid grid-rows-3 gap-4">
                    <div className="bg-gray-100 p-3 rounded-xl row-span-1">
                      <p className="text-xs text-gray-500 mb-1">Quantity</p>
                      <p className="font-bold text-gray-800">
                        {bookingInfo.quantity} Tickets
                      </p>
                    </div>
                    <div className="bg-gray-100 p-6 rounded-xl text-center row-span-2">
                      <div className="w-24 h-24 bg-gray-300 rounded-lg mx-auto flex items-center justify-center">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="8"
                            height="8"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <rect
                            x="13"
                            y="3"
                            width="8"
                            height="8"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <rect
                            x="3"
                            y="13"
                            width="8"
                            height="8"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <rect
                            x="13"
                            y="13"
                            width="2"
                            height="2"
                            fill="currentColor"
                          />
                          <rect
                            x="16"
                            y="13"
                            width="2"
                            height="2"
                            fill="currentColor"
                          />
                          <rect
                            x="19"
                            y="13"
                            width="2"
                            height="2"
                            fill="currentColor"
                          />
                          <rect
                            x="13"
                            y="16"
                            width="2"
                            height="2"
                            fill="currentColor"
                          />
                          <rect
                            x="19"
                            y="16"
                            width="2"
                            height="2"
                            fill="currentColor"
                          />
                          <rect
                            x="13"
                            y="19"
                            width="2"
                            height="2"
                            fill="currentColor"
                          />
                          <rect
                            x="16"
                            y="19"
                            width="2"
                            height="2"
                            fill="currentColor"
                          />
                          <rect
                            x="19"
                            y="19"
                            width="2"
                            height="2"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">
                      Total Paid
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{event.numericPrice * bookingInfo.quantity}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="w-full p-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Close Ticket
                </button>
              </div>

              {/* Close Button */}
            </motion.div>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EventDetailPage;
