"use client";
import { useState, useRef, useEffect } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import EventCard from "@/components/screens/events/EventCard";
import EventFilter from "@/components/screens/events/EventFilter";
import {
  parseEventDate,
  isEventPast,
  formatDisplayDate,
  sortEventsByDateTime,
} from "@/components/utils/EventDateUtils";

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

  const handleFilter = () => {
    if (!search.trim() && !location.trim() && !priceSelected && !dateSelected) {
      toast.warning("Enter at least one criteria to search");
      return;
    }

    const filtered = events.filter((event) => {
      if (isEventPast(event)) {
        return false;
      }

      const matchesLocation =
        location.trim() === "" ||
        event.location.toLowerCase().includes(location.toLowerCase().trim());

      let matchesPrice = true;
      if (priceSelected) {
        const eventPrice = event.numericPrice || 0;
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
    setShowCalendar(false);
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

  //const fetchEvents = async () => {
    //try {
      //const res = await axios.get(
        //"http://localhost:8000/api/v1/public/events/"
      //);
      //const data = res.data;

      //return data.map((event) => {
        //const numericPrice = Math.floor(Number(event.price));
        //return {
          //...event,
          //numericPrice,
          //price: numericPrice === 0 ? "Free" : `₹${numericPrice}`,
        //};
      //});
    //} catch (error) {
      //console.error("Error fetching events:", error);
      //return [];
    //}
  //};

  const fetchEvents = async () => {
  try {
    // Use environment variable, fallback to localhost for dev
    const baseURL =
      process.env.REACT_APP_API_URL || "http://localhost:8000";

    const res = await axios.get(`${baseURL}/api/v1/public/events/`);
    const data = res.data;

    return data.map((event) => {
      const numericPrice = Math.floor(Number(event.price));
      return {
        ...event,
        numericPrice,
        price: numericPrice === 0 ? "Free" : `₹${numericPrice}`,
      };
    });
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showPastEvents) {
        const upcomingEvents = events.filter((event) => !isEventPast(event));
        const upcomingFilteredEvents = filteredEvents.filter(
          (event) => !isEventPast(event)
        );

        if (upcomingEvents.length !== events.length) {
          setEvents(upcomingEvents);
        }
        if (upcomingFilteredEvents.length !== filteredEvents.length) {
          setFilteredEvents(upcomingFilteredEvents);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [events, filteredEvents, showPastEvents]);

  return (
    <>
      <div className="text-white min-h-screen">
        <div className="w-full h-max space-y-6 bg-[url('/bg.png')] bg-contain bg-center bg-[#01517f] bg-no-repeat">
          <EventFilter
            search={search}
            setSearch={setSearch}
            location={location}
            setLocation={setLocation}
            price={price}
            setPrice={setPrice}
            priceSelected={priceSelected}
            setPriceSelected={setPriceSelected}
            dateRange={dateRange}
            setDateRange={setDateRange}
            dateSelected={dateSelected}
            setDateSelected={setDateSelected}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            showPastEvents={showPastEvents}
            setShowPastEvents={setShowPastEvents}
            handleFilter={handleFilter}
            handleClearFilters={handleClearFilters}
            calendarRef={calendarRef}
            filtersApplied={filtersApplied}
          />
          <div className="w-full hidden lg:block">
            <img src="bg-extend.png" alt="" className="block w-full" />
          </div>
        </div>

        <div className="w-full bg-white">
          {filtersApplied && (
            <div className="wrapper py-10 border-b border-[#bebebe]">
              <h2 className="text-4xl text-center font-semibold text-[#01517f] mb-8">
                SEARCH RESULTS
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                {sortEventsByDateTime(filteredEvents).map((event, index) => (
                  <EventCard
                    event={event}
                    index={index}
                    isEventPast={isEventPast}
                  />
                ))}
              </div>

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

          <div className="wrapper py-10">
            <h2 className="text-4xl text-center font-semibold text-[#01517f] mb-8">
              UPCOMING EVENTS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {sortEventsByDateTime(
                events.filter((event) => !isEventPast(event))
              ).map((event, index) => (
                <EventCard
                  event={event}
                  index={index}
                  isEventPast={isEventPast}
                />
              ))}
            </div>

            {events.filter((event) => !isEventPast(event)).length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p className="text-xl">No upcoming events available.</p>
              </div>
            )}
          </div>
          {showPastEvents && (
            <div className="wrapper py-10 border-t border-[#bebebe]">
              <h2 className="text-4xl text-center font-semibold text-[#01517f] mb-8">
                PAST EVENTS
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                {sortEventsByDateTime(
                  events.filter((event) => isEventPast(event))
                ).map((event, index) => (
                  <EventCard
                    event={event}
                    index={index}
                    isEventPast={isEventPast}
                  />
                ))}
              </div>

              {events.filter((event) => isEventPast(event)).length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-xl">No past events available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default EventPage;
