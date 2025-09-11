"use client";
import Image from "next/image";

import duration from "../../../components/assets/duration.png";
import info from "../../../components/assets/info.png";
import kid from "../../../components/assets/kid.png";
import pet from "../../../components/assets/pet.png";
import ticket from "../../../components/assets/ticket.png";
import seat from "../../../components/assets/seat.png";
import language from "../../../components/assets/language.png";
import crowd from "../../../components/assets/crowd.svg";

const EventContent = ({ event }) => {
  if (!event) return null;

  return (
    <div className="xl:w-[66%] w-full rounded-xl">
      <img
        src={event.image}
        alt={event.title}
        className="rounded-xl mb-6 w-full h-[200px] md:h-[300px] lg:h-[400px] block"
      />
      {/* <h1 className="text-4xl font-bold mb-4">{event.title}</h1> */}
      {event.description && (
        <div className="text-black bg-gray-200 p-2 rounded-lg sm:bg-transparent sm:p-0">
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
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <li className="flex items-center">
            <Image
              src={language}
              alt="icon"
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
              className="w-[50px] h-[50px] bg-[#f3f3f5] p-2 sm:p-3 rounded-lg"
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
  );
};

export default EventContent;