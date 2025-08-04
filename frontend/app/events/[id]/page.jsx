"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import axios from "axios";

import Wallet from "../../../components/assets/wallet.svg";
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
import management from "../../../components/assets/management.png";
import crowd from "../../../components/assets/crowd.svg";

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [animateModal, setAnimateModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [ticketInfo, setTicketInfo] = useState(null);
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

  const handleBuyTickets = () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to buy tickets");
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

    setShowModal(true);
    setTimeout(() => setAnimateModal(true), 20);
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const closeModal = () => {
    setAnimateModal(false);
    setTimeout(() => {
      setShowModal(false);
      setQuantity(1); // reset quantity
      setPin(["", "", "", ""]); // reset PIN
      setPaymentMethod("upi"); // reset payment method
    }, 200);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/public/events/${id}/`
        );
        if (!res.ok) throw new Error("Failed to fetch event");

        const data = await res.json();
        setEvent({
          ...data,
          image: data.image?.startsWith("http")
            ? data.image
            : `http://localhost:8000${data.image}` || eventImg,
          price: Math.floor(data.price),
          displayTime: convertTo12Hour(data.time),
        });
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const shouldDisableScroll = showModal || showTicketModal;

    document.body.style.overflow = shouldDisableScroll ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, showTicketModal]);

  if (!event) {
    return (
      <div className="bg-[#0B1C2D] text-white min-h-screen flex items-center justify-center">
        <div className="text-center animate-pulse text-xl">
          Loading event details...
        </div>
      </div>
    );
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
          <hr className="border border-[#f0f1f2] my-4" />

          <div className="text-black">
            <h2 className="text-xl font-bold text-black">Special Guest</h2>
            <div className="my-3 flex gap-2 items-center">
              <div className="rounded-full overflow-hidden">
                <Image
                  src={event.guest_avatar || event.image}
                  alt={event.title}
                  width={50}
                  height={50}
                />
              </div>
              <p>{event.guest}</p>
            </div>
          </div>
          <hr className="border border-[#f0f1f2] my-4" />
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
            <h2 className="text-xl font-bold text-black">Gallery</h2>
            {event.gallery && event.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
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
            <h2 className="text-xl font-bold text-black">Contact</h2>
            <div className="my-3 space-y-2">
              <p>➤ Organizer : {event.organizer}</p>
              <p>➤ Email : {event.organizer_email}</p>
            </div>
          </div>

          {/* Tickets Progress Slider */}
          {/* <div className="flex gap-1 items-center bg-[#0f1b2a] rounded-lg p-2 my-4">
            <p className="whitespace-nowrap">Tickets: </p>
            <div className="w-full bg-white bg-opacity-20 rounded-sm h-5 overflow-hidden flex justify-between items-center relative">
              <div
                className="h-full bg-yellow-400 text-xs font-semibold text-black text-right p-1 transition-all duration-300 ease-in-out"
                style={{
                  width: `${(event.tickets_sold / event.max_attendees) * 100}%`,
                }}
              ></div>
              <span className="text-black mr-2 text-[12px] absolute right-0">
                {event.tickets_left} Left
              </span>
            </div>
          </div> */}

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#0f1b2a] p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-yellow-400">
                Event Details
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <span className="font-medium">Max Attendees:</span>{" "}
                  {event.max_attendees}
                </p>
                {event.duration && (
                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {event.duration} hours
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#0f1b2a] p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-yellow-400">Event Host</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {event.organizer && (
                  <p className="capitalize">
                    <span className="font-medium">Organizer:</span>{" "}
                    {event.organizer}
                  </p>
                )}
                {event.special_guest && (
                  <p className="capitalize">
                    <span className="font-medium">Special Guest:</span>{" "}
                    {event.special_guest}
                  </p>
                )}
              </div>
            </div>
          </div> */}

          {/* <div className="flex gap-4 flex-wrap">
            <button
              className="w-full bg-yellow-400 cursor-pointer text-black px-8 py-3 rounded-md font-semibold hover:bg-yellow-500 transition-colors duration-200 block w-full"
              onClick={handleBuyTickets}
            >
              Buy Tickets
            </button>
            {ticketInfo && (
              <button
                onClick={() => setShowTicketModal(true)}
                className="bg-blue-500 w-full cursor-pointer text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-600 transition-colors duration-200 block w-full mt-4"
              >
                View Ticket
              </button>
            )}
          </div> */}
        </div>
        <div className="h-max p-[18px] w-[31%] bg-white rounded-xl border border-[#e1e3e6]">
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
                {new Date(event.date).toLocaleDateString("en-GB", {
                  weekday: "short", // "Sun", "Mon", etc.
                  day: "2-digit", // "03"
                  month: "short", // "Aug"
                })}{" "}
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
          <div className="flex gap-10 items-center justify-between">
            <div>
              <p className="text-[#555d6d] text-xs">Starts from</p>
              <span className="text-black font-bold text-xl">
                ₹{event.price}
              </span>
            </div>

            {ticketInfo ? (
              <button
                onClick={() => setShowTicketModal(true)}
                className="bg-[#131316] cursor-pointer text-white px-5 py-2 rounded-md font-semibold"
              >
                View Ticket
              </button>
            ) : (
              <button
                className="bg-[#131316] cursor-pointer text-white px-5 py-2 rounded-md font-semibold"
                onClick={handleBuyTickets}
              >
                Buy Tickets
              </button>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#1a2942] border border-white p-6 rounded-xl w-[90%] max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">
                Select Quantity
              </h2>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between bg-[#0f1b2a] p-3 rounded-lg">
                <button
                  onClick={decrement}
                  className="text-white cursor-pointer text-xl font-bold px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                  −
                </button>
                <span className="text-white text-2xl font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={increment}
                  className="text-white text-xl font-bold px-3 py-1 bg-gray-700 cursor-pointer rounded hover:bg-gray-600"
                >
                  +
                </button>
              </div>

              <p className="text-yellow-400 mt-4 text-lg font-semibold">
                Total: ₹{event.price * quantity}
              </p>

              {/* Fake Payment Section */}
              <div className="mt-6">
                <label className="text-white font-medium block mb-2">
                  Choose Payment Method:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="appearance-none w-full p-2 rounded-md bg-[#0f1b2a] text-white border border-gray-600"
                >
                  <option value="upi">UPI</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>
              <div className="mt-6">
                <label className="text-white font-medium block mb-2">
                  Enter 4-Digit PIN:
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
                      className="text-xl h-14 text-center rounded-md bg-[#0f1b2a] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  ))}
                </div>
              </div>

              {/* Confirm/Cancel */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="text-gray-300 cursor-pointer hover:text-white border border-gray-500 px-4 py-2 rounded-md"
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

                      const data = res.data;
                      setTicketInfo(data);
                      toast.success(`Payment completed`);
                      closeModal();
                    } catch (error) {
                      console.error(
                        "Booking Error:",
                        error.response?.data || error.message
                      );
                      toast.error("Failed to book tickets. Please try again.");
                    }
                  }}
                  className="bg-yellow-400 cursor-pointer text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-500"
                >
                  Pay Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-[#1a2942] border border-white p-6 rounded-xl w-[90%] max-w-md shadow-2xl text-white"
            >
              <h2 className="text-2xl font-semibold mb-4">Your Ticket</h2>
              <div className="space-y-3">
                {ticketInfo.id && (
                  <p>
                    <span className="font-medium text-yellow-400">
                      Booking ID:
                    </span>{" "}
                    #{ticketInfo.id}
                  </p>
                )}
                <p>
                  <span className="font-medium text-yellow-400">Event:</span>{" "}
                  {event.title}
                </p>
                <p>
                  <span className="font-medium text-yellow-400">
                    Event Location:
                  </span>{" "}
                  {event.location}
                </p>
                <p>
                  <span className="font-medium text-yellow-400">
                    Booked Date:
                  </span>{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium text-yellow-400">
                    Booked Time:
                  </span>{" "}
                  {event.displayTime}
                </p>
                <p>
                  <span className="font-medium text-yellow-400">
                    Ticket Quantity:
                  </span>{" "}
                  {ticketInfo.quantity}
                </p>
                <p>
                  <span className="font-medium text-yellow-400">
                    Total Paid:
                  </span>{" "}
                  ₹{event.price * ticketInfo.quantity}
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="text-gray-300 hover:text-white border border-gray-500 px-4 py-2 rounded-md"
                >
                  Close
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
