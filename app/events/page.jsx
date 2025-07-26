"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Image from "next/image";
import axios from "axios";

import Wallet from "../../components/assets/wallet.svg";
import Location from "../../components/assets/location.svg";
import Calender from "../../components/assets/calendar.svg";

const EventPage = () => {
  const [location, setLocation] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [price, setPrice] = useState(1000);
  const [priceSelected, setPriceSelected] = useState(false);
  const [search, setSearch] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
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
        const res = await axios.get("http://localhost:8000/events/");
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

      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr;
    }
  };

  return (
    <>
      <div className="bg-[#0B1C2D] text-white min-h-screen">
        <div className="wrapper flex pb-5">
          <div className="w-full lg:w-[20%] p-4 border border-gray-700 rounded-md h-max mt-4 space-y-6">
            <h2 className="text-xl font-bold mb-2">Filter Events</h2>

            {/* Show Past Events Toggle Button */}

            {/* Date Filter */}
            <div className="relative" ref={calendarRef}>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex flex-col text-left bg-[#131d30] text-white px-4 py-2 rounded-md border border-gray-600 hover:border-yellow-400 transition w-full"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">📅 Date Range</span>
                  <span className="text-yellow-400">
                    {showCalendar ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {dateSelected && (
                <span className="text-sm block mt-2 mx-auto text-gray-300 w-max">
                  {[dateRange[0].startDate, dateRange[0].endDate]
                    .map(
                      (d) =>
                        `${d.getDate().toString().padStart(2, "0")}-${(
                          d.getMonth() + 1
                        )
                          .toString()
                          .padStart(2, "0")}-${d.getFullYear()}`
                    )
                    .join(" - ")}
                </span>
              )}

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
              <label className="block text-sm font-semibold mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Search location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-4 py-2 w-full rounded-md bg-[#131d30] text-white border border-gray-600 focus:outline-none focus:border-yellow-400"
              />
              {suggestions.length > 0 && (
                <div className="absolute bg-white text-black w-full rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setLocation(suggestion);
                        setSuggestions([]);
                      }}
                      className="px-4 py-2 hover:bg-yellow-100 cursor-pointer border-b border-gray-200"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Slider */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Max price: ₹{price}
                {!priceSelected && (
                  <span className="ml-2 text-gray-400">(not applied)</span>
                )}
              </label>
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
                className="w-full accent-yellow-400"
              />
            </div>

            {/* Filter Buttons */}
            <button
              onClick={handleFilter}
              className="bg-yellow-400 text-black px-6 py-2 rounded-md font-semibold hover:bg-yellow-500 transition w-full"
            >
              {filtersApplied ? "Update Filters" : "Apply Filters"}
            </button>

            <button
              onClick={handleClearFilters}
              className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-700 transition mx-auto w-full"
            >
              Clear Filters
            </button>

            {/* Filter Status */}
            {filtersApplied && (
              <div className="text-sm text-yellow-400 text-center">
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
              <div className="text-sm text-gray-400 text-center">
                No filters applied
              </div>
            )}

            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className={`w-full px-4 py-2 rounded-md font-semibold transition ${
                showPastEvents
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {showPastEvents ? "Hide Past Events" : "Show Past Events"}
            </button>
          </div>

          {/* Right: Event List */}
          <div className="w-full lg:w-[80%] pl-6 space-y-6">
            <div className="flex justify-between items-center mt-4">
              <h2 className="text-5xl font-bold">Events</h2>
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 rounded-md bg-[#131d30] text-white border border-gray-600 w-1/2 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-5">
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
                    <div
                      key={event.id || index}
                      className={`bg-[#1a2a3a] space-y-5 p-4 gap-4 rounded-lg transition-transform duration-300 transform hover:-translate-y-1 ${
                        isPast
                          ? "opacity-70 border-2 border-red-400"
                          : "hover:bg-[#24344e]"
                      }`}
                    >
                      <div className="w-full block h-[150px] relative">
                        {isPast && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
                            PAST
                          </div>
                        )}
                        <Image
                          src={
                            typeof event.image === "string" &&
                            event.image.startsWith("/media")
                              ? `http://localhost:8000${event.image}`
                              : event.image || "/placeholder-image.jpg"
                          }
                          alt={event.title}
                          className="w-full h-full overflow-hidden rounded-lg"
                          width={150}
                          height={150}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <h3
                          className={`text-2xl font-semibold ${
                            isPast ? "text-gray-400" : ""
                          }`}
                        >
                          {event.title}
                        </h3>
                        <p
                          className={`text-md flex items-center w-max ${
                            isPast ? "text-gray-500" : "text-gray-300"
                          }`}
                        >
                          <Image
                            src={Location}
                            alt="Location-Icon"
                            className="w-3 block mr-2"
                          />
                          {event.location}
                        </p>
                        <p
                          className={`text-md flex items-center w-max ${
                            isPast ? "text-gray-500" : "text-gray-300"
                          }`}
                        >
                          <Image
                            src={Calender}
                            alt="Calendar-Icon"
                            className="w-3 block mr-2"
                          />
                          {formatDisplayDate(event.date)}
                        </p>
                        <p
                          className={`text-md flex items-center w-max ${
                            isPast ? "text-gray-500" : "text-gray-300"
                          }`}
                        >
                          <Image
                            src={Wallet}
                            alt="Wallet-Icon"
                            className="w-3 block mr-2"
                          />
                          ₹
                          {event.price
                            ? Math.floor(parseFloat(event.price))
                            : 0}
                        </p>
                      </div>

                      <div className="text-lg flex flex-col justify-between h-full">
                        <Link
                          href={isPast ? "#" : `/events/${event.id}`}
                          className={`w-full text-center px-6 py-2 rounded-md font-semibold transition ${
                            isPast
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-yellow-400 text-black hover:bg-yellow-500"
                          }`}
                          onClick={
                            isPast ? (e) => e.preventDefault() : undefined
                          }
                        >
                          {isPast ? "Event Ended" : "Buy Tickets"}
                        </Link>
                      </div>
                    </div>
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
