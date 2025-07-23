"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Image from "next/image";
import eventImg from "../../components/assets/event.jpeg";
import rightArrow from "../../components/assets/right-arrow-bold.svg";
import Wallet from "../../components/assets/wallet.svg";
import Location from "../../components/assets/location.svg";
import Calender from "../../components/assets/calendar.svg";

const EventPage = () => {
  const [location, setLocation] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [price, setPrice] = useState(1000);
  const [search, setSearch] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [dateSelected, setDateSelected] = useState(false);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const today = new Date();

  // First day of the current month
  const startDate = new Date();

  // Last day of the current month
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [dateRange, setDateRange] = useState([
    {
      startDate: startDate,
      endDate: endOfMonth,
      key: "selection",
    },
  ]);

  const handleFilter = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;

    const filtered = events.filter((event) => {
      const matchesLocation = location
        ? event.location.toLowerCase().includes(location.toLowerCase())
        : true;
      const matchesPrice = event.price <= price;

      const [day, monthName, year] = event.date.split(" ");
      const eventDate = new Date(`${monthName} ${day}, ${year}`);

      const matchesDate = eventDate >= start && eventDate <= end;

      return matchesLocation && matchesPrice && matchesDate;
    });

    setFilteredEvents(filtered);
    setFiltersApplied(true);
  };

  const handleClearFilters = () => {
    setLocation("");
    setPrice(1000);
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setFilteredEvents(events);
    setDateSelected(false);
    setFiltersApplied(false); // 👈 update here
  };

  useEffect(() => {
    if (events.length === 0) return;

    const parseTime = (t) => {
      const hour = parseInt(t);
      const isPM = t.toLowerCase().includes("pm");
      return (hour % 12) + (isPM ? 12 : 0);
    };

    const sorted = [...events].sort((a, b) => {
      const [aDay, aMonthName, aYear] = a.date.split(" ");
      const [bDay, bMonthName, bYear] = b.date.split(" ");

      const aHour = parseTime(a.time);
      const bHour = parseTime(b.time);

      const aDateTime = new Date(`${aMonthName} ${aDay}, ${aYear}`);
      aDateTime.setHours(aHour);

      const bDateTime = new Date(`${bMonthName} ${bDay}, ${bYear}`);
      bDateTime.setHours(bHour);

      return aDateTime - bDateTime;
    });

    setFilteredEvents(sorted);
  }, [events]);

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
        const res = await fetch("http://localhost:8000/events/");
        if (!res.ok) throw new Error("Failed to fetch events");

        const data = await res.json();

        const backendEvents = data.map((event) => ({
          ...event,
          image:
            typeof event.image === "string" && event.image.startsWith("/media")
              ? `http://localhost:8000${event.image}`
              : event.image,
        }));

        setEvents(backendEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <div className="bg-[#0B1C2D] text-white min-h-screen">
        <div className="wrapper flex pb-5">
          <div className="w-full lg:w-[20%] p-4 border border-gray-700 rounded-md h-max mt-4 space-y-6">
            <h2 className="text-xl font-bold mb-2">Filter Events</h2>
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
                <div className="absolute mt-2 z-20">
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
                onChange={async (e) => {
                  const val = e.target.value;
                  setLocation(val);
                }}
                className="px-4 py-2 w-full rounded-md bg-[#131d30] text-white border border-gray-600"
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
              </label>
              <input
                type="range"
                min={0}
                max={1000}
                step={50}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full accent-yellow-400"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={handleFilter}
              className="bg-yellow-400 text-black px-6 py-2 rounded-md font-semibold hover:bg-yellow-500 transition w-full "
            >
              {filtersApplied ? "Filters Applied" : "Apply Filters"}
            </button>

            <button
              onClick={handleClearFilters}
              className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-700 transition mx-auto w-full "
            >
              Remove Filters
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
                  const [aDay, aMonthName, aYear] = a.date.split(" ");
                  const [bDay, bMonthName, bYear] = b.date.split(" ");

                  const aDateTime = new Date(`${aMonthName} ${aDay}, ${aYear}`);
                  const bDateTime = new Date(`${bMonthName} ${bDay}, ${bYear}`);

                  return aDateTime - bDateTime;
                })

                .map((event, index) => (
                  <div
                    key={index}
                    className="bg-[#1a2a3a] flex p-4 flex-col gap-4 rounded-lg hover:bg-[#24344e] transition-transform duration-300 transform hover:-translate-y-1 "
                  >
                    <Image
                      src={
                        typeof event.image === "string" &&
                        event.image.startsWith("/media")
                          ? `http://localhost:8000${event.image}`
                          : event.image
                      }
                      alt={event.title}
                      className="w-full rounded-md block h-[150px]"
                      width={200}
                      height={200}
                    />

                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl font-semibold">
                        {event.title}
                      </h3>
                      <p className="text-md text-gray-300 flex items-center w-max">
                        <Image
                          src={Location}
                          alt="Wallet-Icon"
                          className="w-3 block mr-2"
                        />
                        {event.location}
                      </p>
                      <p className="text-md text-gray-300 flex items-center w-max">
                        {" "}
                        <Image
                          src={Calender}
                          alt="Calender-Icon"
                          className="w-3 block mr-2"
                        />
                        {(() => {
                          const [yyyy, mm, dd] = event.date.split("-");
                          const monthNames = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ];
                          const monthName = monthNames[parseInt(mm, 10) - 1];
                          return `${dd} ${monthName.slice(0, 3)} ${yyyy}`;
                        })()}
                      </p>

                      <p className="text-md text-gray-300 flex items-center w-max">
                        {" "}
                        <Image
                          src={Wallet}
                          alt="Wallet-Icon"
                          className="w-3 block mr-2"
                        />
                        ₹{Math.floor(event.price)}
                      </p>
                    </div>
                    <div className="text-lg flex flex-col justify-between h-full">
                      {/* <p className="flex items-center justify-end text-2xl">
                        {(() => {
                          if (!event.date) return "Date";
                          const [yyyy, mm, dd] = event.date.split("-");
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
                          const monthName = monthNames[parseInt(mm, 10) - 1];
                          return `${dd} ${monthName}`;
                        })()}

                        <Image
                          src={rightArrow}
                          alt="arrow"
                          className="w-2 block ml-3"
                        />
                      </p> */}

                      <Link
                        href={`/events/${event.id}`}
                        className="bg-yellow-400 w-full text-black px-6 py-2 rounded-md text-center font-semibold hover:bg-yellow-500 transition"
                      >
                        Buy Tickets
                      </Link>

                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventPage;
