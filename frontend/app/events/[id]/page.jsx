"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import PulseLoader from "react-spinners/PulseLoader";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import axios from "axios";
import Skeleton1 from "../../../components/includes/Skeleton1";

import Location from "../../../components/assets/location.svg";
import Calender from "../../../components/assets/calendar.svg";
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
  const [quantity, setQuantity] = useState(1);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingInfo, setBookingInfo] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error("No tickets available");
      return;
    }

    // Check if default quantity is greater than available tickets
    if (quantity > event.tickets_left) {
      toast.warning(`Only ${event.tickets_left} tickets are available`);
      return;
    }

    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (pin.some((digit) => digit === "")) {
      toast.error("PIN not valid. Please enter all 4 digits.");
      return;
    }

    if (quantity > event.tickets_left) {
      toast.error(`Only ${event.tickets_left} tickets available`);
      return;
    }

    try {
      setIsLoading(true);
      const minLoadingTime = new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/book-tickets/",
        { event: id, quantity },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      await minLoadingTime;

      const eventData = res.data;
      setBookingInfo(eventData);
      closeModal();
      toast.success("Booking Confirmed.");
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
    } finally {
      setIsLoading(false);
    }
  };

  const parseEventDate = (dateString) => {
    // Handle ISO format dates like "2025-08-19T00:00:00Z" or regular dates
    if (dateString.includes("T")) {
      return new Date(dateString);
    }

    // Handle DD/MM/YYYY format
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return new Date(year, month - 1, day);
    }

    // Handle YYYY-MM-DD format
    if (dateString.includes("-")) {
      return new Date(dateString);
    }

    // Default fallback
    return new Date(dateString);
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const closeModal = () => {
    setTimeout(() => {
      setShowBookingModal(false);
      setQuantity(1); // reset quantity
      setPin(["", "", "", ""]); // reset PIN
      setPaymentMethod("upi"); // reset payment method
    });
  };

  const fetchEventById = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/public/events/${id}/`
      );
      const eventData = res.data;

      // Parse numeric price and display time
      const numericPrice = Math.floor(Number(eventData.price));
      const price = numericPrice === 0 ? "Free" : `₹${numericPrice}`;
      const displayTime = convertTo12Hour(eventData.time);

      // Determine if event is past
      const eventDate = parseEventDate(eventData.date);
      const now = new Date();

      const isPast = now > eventDate;

      return {
        ...eventData,
        numericPrice,
        price,
        displayTime,
        isPast, // <--- Added
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
                  className="bg-[#131316] text-white px-5 py-2 rounded-md font-semibold cursor-pointer"
                >
                  View Ticket
                </button>
              ) : !event.isPast ? (
                <button
                  onClick={handleBooking}
                  className="bg-[#131316] text-white px-5 py-2 rounded-md font-semibold cursor-pointer"
                >
                  Buy Tickets
                </button>
              ) : (
                <button
                  disabled
                  className="bg-red-600 text-white px-5 py-2 rounded-md font-semibold"
                >
                  Event Ended
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
                        event.tickets_left <= event.max_attendees * 0.2
                          ? "text-red-500"
                          : event.tickets_left <= event.max_attendees * 0.5
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
                      event.tickets_left <= event.max_attendees * 0.2
                        ? "#ef4444"
                        : event.tickets_left <= event.max_attendees * 0.5
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
                (event.tickets_left <= event.max_attendees * 0.2
                  ? "bg-red-100 text-red-700"
                  : event.tickets_left <= event.max_attendees * 0.5
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700")
              }
            >
              {event.tickets_left == 0
                ? "❌ Sold Out"
                : event.tickets_left <= event.max_attendees * 0.2
                ? "🔥 Almost Sold Out"
                : event.tickets_left <= event.max_attendees * 0.5
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
              className="bg-white rounded-2xl p-8 w-[25%] shadow-2xl border border-gray-100 overflow-y-auto relative"
            >
              {/* Loading Overlay */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="mb-3">
                      <PulseLoader margin={4} size={10} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Processing Payment
                      </h3>
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-sm text-gray-500"
                      >
                        Please wait while we confirm your booking...
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Add blur effect to content when loading */}
              <div
                className={`transition-all duration-300 ${
                  isLoading ? "invisible" : ""
                }`}
              >
                {/* Your existing modal content here */}
                <div className="mb-3">
                  <button
                    onClick={closeModal}
                    className="absolute  right-1.5 top-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-x-icon lucide-x"
                      className="bg-gray-300 rounded-full hover:bg-red-600 p-1 transition duration-200"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                  <h2 className="text-xl font-bold text-black mb-1 text-center">
                    Book Your Tickets
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

                {/* Update the confirm button */}
                <button
                  onClick={handleConfirmBooking}
                  className="w-full p-3 bg-black text-white rounded-xl font-semibold shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Ticket Display Modal */}
        {showTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0, opacity: 0, rotateY: 90 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden relative flex flex-col"
            >
              {/* Close button */}

              {/* Movie poster/header image */}
              <div className="h-32 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Movie details header */}
              <div className="p-4">
                <div className="bg-white border-b border-dashed border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {event.title}
                  </h2>
                  <div className="flex gap-2 items-center mb-2 w-max">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#99a1af"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-calendar-clock-icon lucide-calendar-clock"
                    >
                      <path d="M16 14v2.2l1.6 1" />
                      <path d="M16 2v4" />
                      <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                      <path d="M3 10h5" />
                      <path d="M8 2v4" />
                      <circle cx="16" cy="16" r="6" />
                    </svg>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      })}{" "}
                      | {event.displayTime}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center w-max">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#99a1af"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-map-pin-icon lucide-map-pin"
                    >
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <p className="text-sm text-gray-500">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="p-4">
                {/* Ticket info and QR code */}
                <div className="flex items-center gap-3 mb-3">
                  {/* QR Code */}
                  <div className="w-[30%] flex-shrink-0">
                    <img src={bookingInfo.qr_code} alt="QR Code" className="w-full" />
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm text-gray-800 font-medium">
                      Booking ID: #{bookingInfo.custom_id}
                    </p>
                    <p className="text-sm text-gray-800">
                      No of Tickets: {bookingInfo.quantity}
                    </p>
                    <p className="text-sm text-gray-800">
                      Tickets No: {bookingInfo.tickets_id}
                    </p>
                    <p className="text-sm text-gray-800">Status: Confirmed</p>
                  </div>
                </div>

                {/* Confirmation message */}
                <div className="text-center mb-6 px-2">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    A confirmation is sent on e-mail/SMS/WhatsApp within 15
                    minutes of booking.
                  </p>
                </div>

                {/* Total amount */}
                <div className="border-t border-gray-200 border-dashed pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-800 font-medium">
                      Amount Paid
                    </span>
                    <div>
                      <span className="text-base font-semibold text-gray-800">
                        ₹{bookingInfo.total_payement}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="w-full p-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Close Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EventDetailPage;
