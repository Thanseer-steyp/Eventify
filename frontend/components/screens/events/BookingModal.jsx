"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import PulseLoader from "react-spinners/PulseLoader";
import axios from "axios";

const BookingModal = ({ 
  event, 
  showBookingModal, 
  setShowBookingModal, 
  setBookingInfo, 
  setEvent 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
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
        { event: event.id, quantity },
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
      toast.success("Booking Confirmed!");
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

  if (!showBookingModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl p-8 w-[85%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%] shadow-2xl border border-gray-100 overflow-y-auto relative"
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
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
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
            <div className="grid grid-cols-4 gap-6">
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
  );
};

export default BookingModal;