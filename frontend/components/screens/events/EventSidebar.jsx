"use client";
import Image from "next/image";

import Location from "../../../components/assets/location.svg";
import Calender from "../../../components/assets/calendar.svg";
import bookMark from "../../../components/assets/bookmark.svg";

const EventSidebar = ({ 
  event, 
  bookingInfo, 
  handleBooking, 
  setShowTicketModal,
  months 
}) => {
  if (!event) return null;

  return (
    <div className=" xl:w-[31%] w-full mt-5">
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
  );
};

export default EventSidebar;