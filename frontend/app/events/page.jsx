"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Image from "next/image";
import axios from "axios";

import Clock from "../../components/assets/clock.svg";
import Location from "../../components/assets/location.svg";
import Calender from "../../components/assets/calendar.svg";

const EventPage = () => {
  const [location, setLocation] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [price, setPrice] = useState(1000);
  const [priceSelected, setPriceSelected] = useState(false);
  const [search, setSearch] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [dateSelected, setDateSelected] = useState(false);
  const [events, setEvents] = useState([]);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const calendarRef = useRef(null);

  const today = new Date();
  const startDate = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [dateRange, setDateRange] = useState([
    {
      startDate: startDate,
      endDate: endOfMonth,
      key: "selection",
    },
  ]);

  // Fixed date parsing function - backend sends dates in yyyy-mm-dd format
  const parseEventDate = (dateStr) => {
    if (!dateStr) return new Date();

    // Backend sends dates in yyyy-mm-dd format
    if (dateStr.includes("-")) {
      const [year, month, day] = dateStr.split("-");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Fallback for other formats
    return new Date(dateStr);
  };

  // Helper function to check if an event is in the past
  const isEventPast = (event) => {
    const now = new Date();
    const eventDate = parseEventDate(event.date);

    if (!event.time) {
      // If no time specified, consider the event past if the date has passed
      eventDate.setHours(23, 59, 59, 999); // Set to end of day
      return now > eventDate;
    }

    // Parse the event time
    const timePart = event.time;
    const [rawTime, modifier] = timePart.split(" ");
    let [hours, minutes] = rawTime.split(":").map(Number);

    // Convert to 24-hour format for comparison
    if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;

    // Set the exact event date and time
    eventDate.setHours(hours, minutes, 0, 0);

    return now > eventDate;
  };

  const handleFilter = () => {
    console.log("Applying filters:", {
      location,
      price,
      dateRange,
      dateSelected,
      priceSelected,
    });

    const filtered = events.filter((event) => {
      // First check if event is in the past - exclude it only if showPastEvents is false
      if (!showPastEvents && isEventPast(event)) {
        return false;
      }

      // Location filter - only apply if location is entered
      const matchesLocation =
        location.trim() === "" ||
        event.location.toLowerCase().includes(location.toLowerCase().trim());

      // Price filter - only apply if user has interacted with price slider
      let matchesPrice = true;
      if (priceSelected) {
        const eventPrice = event.price ? parseFloat(event.price) : 0;
        matchesPrice = eventPrice <= price;
      }

      // Date filter - only apply if user has explicitly selected a date
      let matchesDate = true;
      if (dateSelected) {
        const start = new Date(dateRange[0].startDate);
        const end = new Date(dateRange[0].endDate);

        // Set time to beginning and end of day for proper comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const eventDate = parseEventDate(event.date);
        matchesDate = eventDate >= start && eventDate <= end;
      }

      console.log(`Event: ${event.title}`, {
        matchesLocation,
        matchesPrice,
        matchesDate,
        dateSelected,
        priceSelected,
        isNotPast: !isEventPast(event),
      });

      return matchesLocation && matchesPrice && matchesDate;
    });

    console.log("Filtered events:", filtered);
    setFilteredEvents(filtered);
    setFiltersApplied(true);
  };

  const handleClearFilters = () => {
    setLocation("");
    setPrice(1000);
    setPriceSelected(false);

    // Reset date range to current month
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange([
      {
        startDate: today,
        endDate: endOfMonth,
        key: "selection",
      },
    ]);

    // Show events based on showPastEvents toggle
    if (showPastEvents) {
      setFilteredEvents(events); // Show all events
    } else {
      const upcomingEvents = events.filter((event) => !isEventPast(event));
      setFilteredEvents(upcomingEvents); // Show only upcoming events
    }

    setDateSelected(false);
    setFiltersApplied(false);
    setShowCalendar(false); // Close calendar
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/public/events/"
        );
        const data = res.data;
        console.log("Fetched Event Data:", data);

        const backendEvents = data.map((event) => ({
          ...event,
          image:
            typeof event.image === "string" && event.image.startsWith("/media")
              ? `http://localhost:8000${event.image}`
              : event.image,
        }));

        setEvents(backendEvents);

        // Show events based on showPastEvents toggle
        if (showPastEvents) {
          setFilteredEvents(backendEvents); // Show all events
        } else {
          const upcomingEvents = backendEvents.filter(
            (event) => !isEventPast(event)
          );
          setFilteredEvents(upcomingEvents); // Show only upcoming events
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Real-time check for past events - runs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showPastEvents) {
        // Only filter if we're not showing past events
        const upcomingEvents = events.filter((event) => !isEventPast(event));
        const upcomingFilteredEvents = filteredEvents.filter(
          (event) => !isEventPast(event)
        );

        // Only update if there are changes to avoid unnecessary re-renders
        if (upcomingEvents.length !== events.length) {
          setEvents(upcomingEvents);
        }
        if (upcomingFilteredEvents.length !== filteredEvents.length) {
          setFilteredEvents(upcomingFilteredEvents);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [events, filteredEvents, showPastEvents]);

  // Update filtered events when showPastEvents toggle changes
  useEffect(() => {
    if (showPastEvents) {
      setFilteredEvents(events); // Show all events
    } else {
      const upcomingEvents = events.filter((event) => !isEventPast(event));
      setFilteredEvents(upcomingEvents); // Show only upcoming events
    }

    // If filters were applied, clear them when toggling past events
    if (filtersApplied) {
      setFiltersApplied(false);
    }
  }, [showPastEvents, events]);

  // Format date for display (yyyy-mm-dd to dd MMM yyyy)
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Date";

    try {
      const date = parseEventDate(dateStr);
      const monthNames = [
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

      const day = date.getDate().toString().padStart(2, "0");
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      return `${month} ${day},  ${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr;
    }
  };

  return (
    <>
      <div className="text-white min-h-screen">
        <div className="w-full h-max space-y-6 bg-[url('/bg.png')] bg-contain bg-center bg-[#01517f]">
          <div className="wrapper py-[150px]">
            <h2 className="text-[55px] text-center font-semibold mb-5">
              FIND AN EVENT & BUY TICKETS
            </h2>

            {/* Show Past Events Toggle Button */}
            <div className="mb-4">
              <label className="block font-medium text-sm mb-1 text-center">
                FIND EVENT BY NAME
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 rounded-md bg-white text-black focus:outline-none w-full"
              />
            </div>
            <div className="grid grid-cols-3 gap-5">
              {/* Date Filter */}
              <div className="relative" ref={calendarRef}>
                <label className="block font-medium text-sm mb-1 text-center">
                  FIND BY DATE
                </label>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex flex-col text-left bg-white text-black px-4 py-2 rounded-md w-full"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-sm text-black">
                      {dateSelected
                        ? [dateRange[0].startDate, dateRange[0].endDate]
                            .map(
                              (d) =>
                                `${d.getDate().toString().padStart(2, "0")}-${(
                                  d.getMonth() + 1
                                )
                                  .toString()
                                  .padStart(2, "0")}-${d.getFullYear()}`
                            )
                            .join(" - ")
                        : ""}
                    </span>
                    <span className="text-yellow-400 ml-2">
                      {showCalendar ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {showCalendar && (
                  <div className="absolute mt-2 z-20 bg-white rounded-md shadow-lg">
                    <DateRange
                      editableDateInputs={true}
                      onChange={(item) => {
                        setDateRange([item.selection]);
                        setDateSelected(true);
                      }}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      minDate={new Date()}
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Location Input */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-center">
                  FIND BY LOCATION
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="p-2 rounded-md bg-white text-black focus:outline-none w-full"
                />
              </div>

              {/* Price Slider */}
              <div>
                <label className="block text-sm font-medium text-center mb-1 ">
                  MAX PRICE: {price}
                  {!priceSelected && (
                    <span className="ml-2 text-gray-400">(not applied)</span>
                  )}
                </label>
                <div className="p-3 rounded-md bg-white flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={50}
                    value={price}
                    onChange={(e) => {
                      setPrice(Number(e.target.value));
                      setPriceSelected(true);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={handleFilter}
                className="bg-yellow-400 text-white px-5 py-2 rounded-md font-semibold cursor-pointer hover:bg-yellow-500 transition"
              >
                Find events
              </button>

              <button
                onClick={handleClearFilters}
                className="border border-white text-white px-5 py-2 rounded-md font-semibold cursor-pointer"
              >
                Clear
              </button>

              <button
                onClick={() => setShowPastEvents(!showPastEvents)}
                className={`px-5 py-2 rounded-md font-semibold transition ${
                  showPastEvents
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {showPastEvents ? "Hide Past Events" : "Show Past Events"}
              </button>
            </div>

            {/* Filter Status */}
            {filtersApplied && (
              <div className="text-sm text-yellow-400 text-center mt-3">
                Showing {filteredEvents.length} of {events.length} events
                <div className="text-xs text-gray-400 mt-1">
                  Active filters:
                  {location.trim() && " Location"}
                  {priceSelected && " Price"}
                  {dateSelected && " Date"}
                  {!location.trim() &&
                    !priceSelected &&
                    !dateSelected &&
                    " None"}
                </div>
              </div>
            )}

            {/* Show when no filters are applied */}
            {!filtersApplied && (
              <div className="text-sm text-gray-400 text-center mt-3">
                No filters applied
              </div>
            )}
          </div>
          <div className="w-full bg-white bg-[url('/bg-extend.png')] h-15 bg-no-repeat bg-contain"></div>
        </div>

        {/* Right: Event List */}
        <div className="w-full bg-white">
          <div className="wrapper py-5">
            <h2 className="text-[40px] text-center font-semibold text-[#01517f] mb-8">
              UPCOMING EVENTS
            </h2>

            <div className="grid grid-cols-3 gap-8">
              {filteredEvents
                .filter((event) =>
                  event.title.toLowerCase().includes(search.toLowerCase())
                )
                .sort((a, b) => {
                  const getDateTime = (event) => {
                    const datePart = parseEventDate(event.date);
                    const timePart = event.time || "12:00 AM"; // default to midnight if no time

                    const [rawTime, modifier] = timePart.split(" ");
                    let [hours, minutes] = rawTime.split(":").map(Number);

                    if (modifier?.toLowerCase() === "pm" && hours < 12)
                      hours += 12;
                    if (modifier?.toLowerCase() === "am" && hours === 12)
                      hours = 0;

                    datePart.setHours(hours, minutes, 0, 0);
                    return datePart;
                  };

                  return getDateTime(a) - getDateTime(b);
                })
                .map((event, index) => {
                  const isPast = isEventPast(event);
                  return (
                    <Link
                      href={isPast ? "#" : `/events/${event.id}`}
                      key={event.id || index}
                      className={`bg-white border border-[#d2d2d2] overflow-hidden rounded-lg transition-transform duration-300 transform hover:scale-101 hover:shadow-2xl ${
                        isPast
                          ? "cursor-not-allowed opacity-80"
                          : "cursor-pointer"
                      }`}
                    >
                      <div className="w-full block h-[150px] relative">
                        {isPast && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
                            PAST
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

                      <div className="p-3 space-y-1">
                        <h3
                          className={`text-lg font-semibold ${
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
                          <Image
                            src={Clock}
                            alt="Wallet-Icon"
                            className="w-4 block mr-2"
                          />
                          {new Date(
                            `1970-01-01T${event.time}`
                          ).toLocaleTimeString([], {
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
                          className={`rounded-md flex justify-between px-2 py-1 font-semibold ${
                            isPast ? "bg-red-600 text-white" : "bg-[#e5e5e5] text-black"
                          }`}
                        >
                          <span className="text-md">₹ {event.price}</span>
                          <span>|{isPast ? " Event Ended" : "  Book Now"}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>

            {/* No events message */}
            {filteredEvents.length === 0 && events.length > 0 && (
              <div className="text-center text-gray-400 py-8">
                <p className="text-xl">
                  No events found matching your filters.
                </p>
                <p className="text-sm mt-2">
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventPage;
