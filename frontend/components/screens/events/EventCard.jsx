import Link from "next/link";
import Image from "next/image";
import Clock from "../../assets/clock.svg";
import Location from "../../assets/location.svg";
import Calender from "../../assets/calendar.svg";

import {
  parseEventDate,
  formatDisplayDate,
} from "@/components/utils/EventDateUtils";

const EventCard = ({ event, index, isEventPast }) => {
  const isPast = isEventPast ? isEventPast(event) : false;

  return (
    <Link
      href={isPast ? "#" : `/events/${event.id}`}
      onClick={(e) => {
        if (isPast) {
          e.preventDefault(); // stops the navigation
        }
      }}
      key={event.id || index}
      className={`bg-white border border-[#d2d2d2] overflow-hidden rounded-lg transition-transform duration-300 transform hover:scale-101 hover:shadow-2xl ${
        isPast ? "cursor-not-allowed opacity-80" : "cursor-pointer"
      }`}
    >
      <div className="w-full block h-[150px] relative">
        {isPast && (
          <div className="absolute top-2 left-2 bg-red-600 px-3 py-1 rounded-full text-xs font-medium z-10">
            Ended
          </div>
        )}
        <Image
          src={event.image}
          alt={event.title}
          className="w-full h-full"
          width={150}
          height={150}
        />
      </div>

      <div className="p-3 space-y-1.5">
        <h3
          className={`text-lg font-semibold mb-3 min-h-[56px] ${
            isPast ? "text-gray-400" : "text-black"
          }`}
        >
          {event.title}
        </h3>

        <p
          className={`text-md flex items-center w-max text-md ${
            isPast ? "text-gray-500" : "text-black"
          }`}
        >
          <Image
            src={Calender}
            alt="Calendar-Icon"
            className="w-4 block mr-2"
          />
          {formatDisplayDate(event.date)}
        </p>
        <p
          className={`text-md flex items-center w-max text-md ${
            isPast ? "text-gray-500" : "text-black"
          }`}
        >
          <Image src={Clock} alt="Wallet-Icon" className="w-4 block mr-2" />
          {new Date(`1970-01-01T${event.time}`).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
        <p
          className={`text-md flex items-center w-max text-md ${
            isPast ? "text-gray-500" : "text-black"
          }`}
        >
          <Image
            src={Location}
            alt="Location-Icon"
            className="w-4 block mr-2"
          />
          {event.location}
        </p>
        <div
          className={`rounded-md flex justify-between px-2 py-1 mt-3 font-semibold ${
            isPast
              ? "bg-red-600 text-white justify-center"
              : "bg-[#e5e5e5] text-black"
          }`}
        >
          <span className="text-md">{isPast ? "" : event.price}</span>
          <span>{isPast ? "Event Ended" : "| Book Now"}</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
