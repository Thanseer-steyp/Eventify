"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Skeleton from "../../components/includes/Skeleton";
import { Shield } from "lucide-react";
import EditEventModal from "../../components/screens/dashboard/EditEventModal";
import BookingsSection from "../../components/screens/dashboard/BookingsSection";
import EventsSection from "../../components/screens/dashboard/EventsSection";

function UserDashboard() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bookings, setBookings] = useState([]);
  const [eventsCreated, setEventsCreated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("access");
      setToken(storedToken);
    }
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/user/user-profile/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsername(res.data.username);
      setName(res.data.first_name);
      setBookings(res.data.bookings);
      setEventsCreated(res.data.created_events);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // clear tokens, user info
    window.dispatchEvent(new Event("login-status-changed")); // tell Header to reload user
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setShowLoginModal(true);
      setName("Guest");
    }
  }, []);

  const LoginWarningModal = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[2px]">
      <div className="bg-white p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-black">
          Authentication Required
        </h2>
        <p className="text-gray-700 mb-6">
          You need to be logged in to view your dashboard
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/authentication"
            className="bg-blue-600 hover:bg-blue-700 w-full text-white px-4 py-2 rounded"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );

  if (loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="wrapper relative max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
                Welcome back,{" "}
                <span className="capitalize">
                  {name ? name : username || "Guest"}
                </span>
                ! 👋
              </h1>
              <p className="text-gray-600 text-sm sm:text-lg text-center sm:text-left">
                {token
                  ? "Manage your events and bookings from your personal dashboard"
                  : "Log in to view you dashboard"}
              </p>
            </div>

            {token ? (
              // If logged in → Show logout
              <button
                className="bg-red-500 rounded-full p-3 cursor-pointer w-max mx-auto lg:mx-0 mt-4 lg:mt-0"
                onClick={handleLogout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-log-out"
                >
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                </svg>
              </button>
            ) : (
              // If no token → Show login (example)
              <Link
                href="/authentication"
                className="bg-green-500 rounded-full p-3 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-key-round-icon lucide-key-round"
                >
                  <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
                  <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-6 mb-8">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 hidden sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <span>Your Bookings</span>
            </div>
            {bookings.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {bookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "events"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 hidden sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Your Events</span>
            </div>
            {eventsCreated.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {eventsCreated.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="min-h-[60vh]">
          {activeTab === "bookings" ? (
            <BookingsSection bookings={bookings} setBookings={setBookings} />
          ) : (
            <EventsSection 
              eventsCreated={eventsCreated} 
              setEditingEvent={setEditingEvent}
            />
          )}
        </div>

        {/* Modals */}
        {showLoginModal && (
          <LoginWarningModal onClose={() => setShowLoginModal(false)} />
        )}

        {editingEvent && (
          <EditEventModal
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onSave={(updatedEvent) => {
              setEventsCreated(
                eventsCreated.map((ev) =>
                  ev.id === updatedEvent.id ? updatedEvent : ev
                )
              );
            }}
          />
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default UserDashboard;