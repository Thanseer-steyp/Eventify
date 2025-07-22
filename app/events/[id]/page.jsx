"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

import Wallet from "../../../components/assets/wallet.svg";
import Location from "../../../components/assets/location.svg";
import Calender from "../../../components/assets/calendar.svg";
import eventImg from "../../../components/assets/event.jpeg";

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:8000/events/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch event");

        const data = await res.json();

        setEvent({
          ...data,
          image: data.image ? `http://localhost:8000${data.image}` : eventImg,
          price: Math.floor(data.price), // Remove decimal
        });
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };

    fetchEvent();
  }, [id]);

  if (!event) {
    return <div className="text-white p-10">Event not found</div>;
  }

  return (
    <div className="bg-[#0B1C2D] text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-[#1a2942] rounded-xl overflow-hidden shadow-lg p-6">
        {/* <Image
          src={
            typeof event.image === "string" && event.image.startsWith("/media")
              ? `http://localhost:8000${event.image}`
              : event.image
          }
          alt={event.title}
          width={800}
          height={300}
          className="rounded-lg mb-6 w-full h-[300px] object-cover"
        /> */}

        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

        <div className="space-y-3 mb-6">
          <p className="flex items-center">
            <Image src={Location} alt="Location" className="w-4 h-4 mr-2" />
            {event.location}
          </p>
          <p className="flex items-center">
            <Image src={Calender} alt="Calendar" className="w-4 h-4 mr-2" />
            {new Date(event.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            at {event.time}
          </p>
          <p className="flex items-center">
            <Image src={Wallet} alt="Price" className="w-4 h-4 mr-2" />₹
            {event.price}
          </p>
        </div>

        <p className="text-gray-300 mb-6">{event.description}</p>

        <button className="bg-yellow-400 text-black px-6 py-2 rounded-md font-semibold hover:bg-yellow-500 transition">
          Buy Tickets
        </button>
      </div>
    </div>
  );
};

export default EventDetailPage;
