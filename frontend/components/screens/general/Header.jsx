"use client";

import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadUser = () => {
    const firstName = localStorage.getItem("first_name");
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("access");

    let initial = "";

    if (firstName && firstName.trim() !== "") {
      initial = firstName.charAt(0).toUpperCase();
    } else if (username && username.trim() !== "") {
      initial = username.charAt(0).toUpperCase();
    } else {
      initial = "🧑‍💻";
    }

    setUserInitial(initial);
    setIsAuthenticated(!!token);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      setShowSuggestions(false);
      setSearchQuery("");
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

  const fetchSuggestions = async (query) => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/public/events/",
        {
          params: { q: query },
        }
      );

      // Filter out past events on the frontend
      const upcomingEvents = res.data.filter((event) => {
        const eventDate = parseEventDate(event.date || event.event_date);
        const timeField = event.time || event.event_time;
        const now = new Date();

        if (timeField) {
          const [rawTime, modifier] = timeField.toString().split(" ");
          let [hours, minutes] = rawTime.split(":").map(Number);
          if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
          if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;
          eventDate.setHours(hours, minutes, 0, 0);
        } else {
          eventDate.setHours(23, 59, 59, 999);
        }

        // Only include upcoming events
        return now <= eventDate;
      });

      setSuggestions(upcomingEvents.slice(0, 5));
      setShowSuggestions(upcomingEvents.length > 0);
    } catch (err) {
      setSuggestions([]);
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.clear();
    setUserInitial("");
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("login-status-changed"));
    window.location.reload();
  };

  useEffect(() => {
    loadUser();
    const handleUserChange = () => loadUser();

    window.addEventListener("login-status-changed", handleUserChange);
    return () => {
      window.removeEventListener("login-status-changed", handleUserChange);
    };
  }, []);

  return (
    <header className="bg-[#f2f6f9] w-full py-4 sticky top-0 z-50 border-b-2 border-[#f2f2f2]">
      <div className="px-6">
        <div className="flex items-center md:justify-between">
          {/* Logo */}
          <h1 className="flex-1 md:flex-none">
            <Link href="/">
              <div className="flex items-center">
                <div className="bg-[url('/bg.png')] bg-contain bg-center bg-[#01517f] bg-no-repeat logo mr-4 text-3xl text-white p-2">
                  Eventify
                </div>
              </div>
            </Link>
          </h1>

          {/* Navigation */}
          <ul className="lg:flex lg:justify-center items-center gap-4 hidden">
            <li>
              <Link
                href="/"
                className={`px-3 py-2 rounded-4xl border border-transparent text-sm ${
                  pathname === "/"
                    ? "text-white  bg-black"
                    : "text-black  hover:border-black"
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className={`px-3 py-2 rounded-4xl border border-transparent text-sm ${
                  pathname === "/events"
                    ? "text-white  bg-black"
                    : "text-black  hover:border-black"
                }`}
              >
                Explore Events
              </Link>
            </li>
            <li>
              <Link
                href="/events/create"
                className={`px-3 py-2  rounded-4xl border border-transparent text-sm ${
                  pathname === "/events/create"
                    ? "text-white  bg-black"
                    : "text-black  hover:border-black"
                }`}
              >
                Create Events
              </Link>
            </li>
          </ul>

          {/* Search & Avatar */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-[400px] hidden md:block">
              <div className="flex items-center gap-2 border border-gray-400 p-3 rounded-lg bg-white">
                <img src="/glass.svg" alt="Search" className="w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for events, shows and programmes"
                  className="focus:outline-none w-full text-black"
                />
              </div>

              {/* Dropdown suggestions */}
              {showSuggestions && (
                <div className="absolute w-full bg-white border border-gray-300 shadow-lg mt-1 rounded-lg z-50">
                  {suggestions.length > 0 ? (
                    suggestions.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {event.image && (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium  text-[14px] text-black">
                            {event.title}
                          </p>
                          <p className="text-[12px] text-black">
                            {event.location} •{" "}
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500 text-center">
                      No matching events found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="mr-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <div className="w-10 h-10 bg-gray-600 text-xl text-white font-bold rounded-full flex items-center justify-center cursor-pointer">
                    {userInitial}
                  </div>
                </Link>
              ) : (
                <Link href="/authentication" className="">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center cursor-pointer">
                    <img
                      src="/user-solid.svg"
                      alt="Login"
                      className="w-5 h-5"
                    />
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Nav (hidden on lg) */}
          <div
            className="lg:hidden flex flex-col justify-between h-[30px] w-[30px] cursor-pointer relative"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {/* Top bar */}
            <span
              className={`block h-[5px] bg-gray-950 transition-transform duration-300 ${
                menuOpen ? "rotate-45 translate-y-[12.5px]" : ""
              }`}
            ></span>

            {/* Middle bar */}
            <span
              className={`block h-[5px] bg-gray-950 transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>

            {/* Bottom bar */}
            <span
              className={`block h-[5px] bg-gray-950 transition-transform duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[12.5px]" : ""
              }`}
            ></span>
          </div>
        </div>
        <div className="relative w-full mt-3 block md:hidden">
          <div className="flex items-center gap-2 border border-gray-400 p-3 rounded-lg bg-white">
            <img src="/glass.svg" alt="Search" className="w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for events, shows and programmes"
              className="focus:outline-none w-full text-black"
            />
          </div>

          {/* Dropdown suggestions */}
          {showSuggestions && (
            <div className="absolute w-full bg-white border border-gray-300 shadow-lg mt-1 rounded-lg z-50">
              {suggestions.length > 0 ? (
                suggestions.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium  text-[14px] text-black">
                        {event.title}
                      </p>
                      <p className="text-[12px] text-black">
                        {event.location} •{" "}
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No matching events found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ul
        className={`overflow-hidden bg-white shadow-lg text-center flex flex-col gap-4 transition-all duration-300 lg:hidden ${
          menuOpen ? "max-h-[500px] mt-3" : "max-h-0"
        }`}
      >
        <li>
          <Link
            href="/"
            className={`block px-3 py-2 border border-transparent text-sm ${
              pathname === "/"
                ? "text-white bg-black"
                : "text-black hover:border-black"
            }`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/events"
            className={`block px-3 py-2 border border-transparent text-sm ${
              pathname === "/events"
                ? "text-white bg-black"
                : "text-black hover:border-black"
            }`}
          >
            Explore Events
          </Link>
        </li>
        <li>
          <Link
            href="/events/create"
            className={`block px-3 py-2 border border-transparent text-sm ${
              pathname === "/events/create"
                ? "text-white bg-black"
                : "text-black hover:border-black"
            }`}
          >
            Create Events
          </Link>
        </li>
      </ul>
    </header>
  );
}

export default Header;
