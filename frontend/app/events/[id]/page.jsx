"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Skeleton1 from "../../../components/includes/Skeleton1";
import BookingModal from "../../../components/screens/events/BookingModal";
import TicketModal from "../../../components/screens/events/TicketModal";
import EventContent from "../../../components/screens/events/EventContent";
import EventSidebar from "../../../components/screens/events/EventSidebar";

const EventDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

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
    if (1 > event.tickets_left) {
      toast.warning(`Only ${event.tickets_left} tickets are available`);
      return;
    }

    setShowBookingModal(true);
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
      <div className="wrapper flex xl:justify-between flex-wrap xl:flex-nowrap">
        <EventContent event={event} />

        <EventSidebar
          event={event}
          bookingInfo={bookingInfo}
          handleBooking={handleBooking}
          setShowTicketModal={setShowTicketModal}
          months={months}
        />

        {/* Modal Components */}
        <BookingModal
          event={event}
          showBookingModal={showBookingModal}
          setShowBookingModal={setShowBookingModal}
          setBookingInfo={setBookingInfo}
          setEvent={setEvent}
        />

        <TicketModal
          event={event}
          bookingInfo={bookingInfo}
          showTicketModal={showTicketModal}
          setShowTicketModal={setShowTicketModal}
        />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EventDetailPage;
