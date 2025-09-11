"use client";
import { motion } from "framer-motion";

const TicketModal = ({ 
  event, 
  bookingInfo, 
  showTicketModal, 
  setShowTicketModal 
}) => {
  if (!showTicketModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0, opacity: 0, rotateY: 90 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden relative flex flex-col"
      >
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-calendar-clock-icon lucide-calendar-clock"
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-map-pin-icon lucide-map-pin"
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
  );
};

export default TicketModal;