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
        const res = await fetch(`http://localhost:8000/events/${id}/`);
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
    <div className="bg-[#0B1C2D] text-white min-h-screen p-8 relative">
      <div className="max-w-4xl mx-auto bg-[#1a2942] rounded-xl overflow-hidden shadow-lg p-6">
        <div className="h-[350px] mb-4">
          <Image
            src={event.image}
            alt={event.title}
            width={350}
            height={350}
            className="rounded-lg mb-6 w-full h-full block"
          />
        </div>

        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

        <div className="space-y-3 mb-6">
          <p className="flex items-center text-gray-300">
            <Image src={Location} alt="Location" className="w-4 h-4 mr-2" />
            <span className="font-medium">Location:</span>
            <span className="ml-2 text-yellow-400 font-semibold">
              {event.location}
            </span>
          </p>

          <p className="flex items-center text-gray-300">
            <Image src={Calender} alt="Calendar" className="w-4 h-4 mr-2" />
            <span className="font-medium">Date & Time:</span>
            <span className="ml-2 text-yellow-400 font-semibold">
              {new Date(event.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
              at {event.displayTime}
            </span>
          </p>

          <p className="flex items-center text-gray-300">
            <Image src={Wallet} alt="Price" className="w-4 h-4 mr-2" />
            <span className="font-medium">Ticket Price:</span>
            <span className="ml-2 text-yellow-400 font-bold">
              ₹{event.price}
            </span>
          </p>
        </div>

        {event.description && (
          <div className="mb-6 bg-[#0f1b2a] p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-3">About This Event</h2>
            <p className="text-gray-300 leading-relaxed">{event.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#0f1b2a] p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-yellow-400">
              Event Details
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <span className="font-medium">Category:</span> {event.category}
              </p>
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
        </div>

        <div className="flex gap-4 flex-wrap">
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

                  try {
                    const res = await axios.post(
                      "http://localhost:8000/tickets/book/",
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

                    const data = res.data; // Axios auto-parses JSON
                    setTicketInfo(data);
                    toast.success(`Payment Successful for ${quantity} tickets`);
                    toast.success(`Tickets booked successfully`);
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
                <span className="font-medium text-yellow-400">Total Paid:</span>{" "}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EventDetailPage;
