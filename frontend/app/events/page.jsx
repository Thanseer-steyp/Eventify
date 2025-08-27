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
    const filtered = events.filter((event) => {
      // Always exclude past events from search results
      if (isEventPast(event)) {
        return false;
      }

      const matchesLocation =
        location.trim() === "" ||
        event.location.toLowerCase().includes(location.toLowerCase().trim());

      let matchesPrice = true;
      if (priceSelected) {
        const eventPrice = event.price ? parseFloat(event.price) : 0;
        matchesPrice = eventPrice <= price;
      }

      let matchesDate = true;
      if (dateSelected) {
        const start = new Date(dateRange[0].startDate);
        const end = new Date(dateRange[0].endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        const eventDate = parseEventDate(event.date);
        matchesDate = eventDate >= start && eventDate <= end;
      }

      const matchesSearch =
        search.trim() === "" ||
        event.title.toLowerCase().includes(search.toLowerCase().trim());

      return matchesLocation && matchesPrice && matchesDate && matchesSearch;
    });

    setFilteredEvents(filtered);
    setFiltersApplied(true);
  };

  const handleClearFilters = () => {
    setLocation("");
    setPrice("");
    setSearch("");

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

    setDateSelected(false);
    setFiltersApplied(false);
    setFilteredEvents([]);
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

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/public/events/"
      );
      const data = res.data;

      return data.map((event) => ({
        ...event,
        price:
          Math.floor(Number(event.price)) === 0
            ? "Free"
            : `₹${Math.floor(Number(event.price))}`,
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      const eventsData = await fetchEvents();
      setEvents(eventsData);
    };
    loadEvents();
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

  // Helper function to sort events by date and time
  const sortEventsByDateTime = (eventsList) => {
    return eventsList.sort((a, b) => {
      const getDateTime = (event) => {
        const datePart = parseEventDate(event.date);
        const timePart = event.time || "12:00 AM"; // default to midnight if no time

        const [rawTime, modifier] = timePart.split(" ");
        let [hours, minutes] = rawTime.split(":").map(Number);

        if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
        if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;

        datePart.setHours(hours, minutes, 0, 0);
        return datePart;
      };

      return getDateTime(a) - getDateTime(b);
    });
  };

  // Helper function to render event cards
  const renderEventCard = (event, index) => {
    const isPast = isEventPast(event);
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
              isPast ? "bg-red-600 text-white justify-center" : "bg-[#e5e5e5] text-black"
            }`}
          >
            <span className="text-md">{isPast ? "" : event.price}</span>
            <span>
  {isPast ? "Event Ended" : "| Book Now"}
</span>


          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <div className="text-white min-h-screen">
        <div className="w-full h-max space-y-6 bg-[url('/bg.png')] bg-contain bg-center bg-[#01517f] bg-no-repeat">
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
              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium text-center mb-1 ">
                  FIND BY BUDGET
                </label>
                <div className="p-2 rounded-md bg-white flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    step={50}
                    value={priceSelected ? price : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setPrice(0);
                        setPriceSelected(false);
                      } else {
                        const numValue = Number(value);
                        if (numValue >= 0) {
                          setPrice(numValue);
                          setPriceSelected(true);
                        }
                      }
                    }}
                    className="w-full border-none outline-none text-black bg-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
                Showing {filteredEvents.length} of{" "}
                {events.filter((event) => !isEventPast(event)).length} events
                <div className="text-xs text-gray-400 mt-1">
                  Active filters:
                  {[
                    search.trim() && ` Name: ${search.trim()}`,
                    location.trim() && ` Location: ${location.trim()}`,
                    priceSelected && ` Budget: ₹${price}`,
                    dateSelected &&
                      ` Date Range: ${[
                        dateRange[0].startDate,
                        dateRange[0].endDate,
                      ]
                        .map(
                          (d) =>
                            `${d.getDate().toString().padStart(2, "0")}-${(
                              d.getMonth() + 1
                            )
                              .toString()
                              .padStart(2, "0")}-${d.getFullYear()}`
                        )
                        .join(" to ")}`,
                  ]
                    .filter(Boolean)
                    .join(" | ") || " None"}
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
          <div className="w-full bg-white bg-[url('/bg-extend.png')] h-16 bg-no-repeat bg-cover"></div>
        </div>

        {/* Event Sections */}
        <div className="w-full bg-white">
          {/* Past Events Section - Show only when showPastEvents is true */}

          {/* Search Results Section - Show when filters are applied */}
          {filtersApplied && (
            <div className="wrapper py-10 border-b border-[#bebebe]">
              <h2 className="text-[40px] text-center font-semibold text-[#01517f] mb-8">
                SEARCH RESULTS
              </h2>

              <div className="grid grid-cols-3 gap-15">
                {sortEventsByDateTime(filteredEvents).map((event, index) =>
                  renderEventCard(event, index)
                )}
              </div>

              {/* No search results message */}
              {filteredEvents.length === 0 && (
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
          )}

          {/* Upcoming Events Section */}
          <div className="wrapper py-10">
            <h2 className="text-[40px] text-center font-semibold text-[#01517f] mb-8">
              UPCOMING EVENTS
            </h2>

            <div className="grid grid-cols-4 gap-7">
              {sortEventsByDateTime(
                events.filter((event) => !isEventPast(event))
              ).map((event, index) => renderEventCard(event, index))}
            </div>

            {/* No upcoming events message */}
            {events.filter((event) => !isEventPast(event)).length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p className="text-xl">No upcoming events available.</p>
              </div>
            )}
          </div>
          {showPastEvents && (
            <div className="wrapper py-10 border-t border-[#bebebe]">
              <h2 className="text-[40px] text-center font-semibold text-[#01517f] mb-8">
                PAST EVENTS
              </h2>

              <div className="grid grid-cols-4 gap-7">
                {sortEventsByDateTime(
                  events.filter((event) => isEventPast(event))
                ).map((event, index) => renderEventCard(event, index))}
              </div>

              {/* No past events message */}
              {events.filter((event) => isEventPast(event)).length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-xl">No past events available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventPage;
