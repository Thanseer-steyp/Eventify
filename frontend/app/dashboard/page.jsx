"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserDashboard() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("")
  const [bookings, setBookings] = useState([]);
  const [eventsCreated, setEventsCreated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) {
      setShowLoginModal(true);
      setName("Guest");
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:8000/api/v1/user/user-profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUsername(res.data.username);
          setName(res.data.first_name);
          setBookings(res.data.bookings);
          setEventsCreated(res.data.created_events);
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  const LoginWarningModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-[2px]">
      <div className="bg-gray-100 p-6 max-w-sm w-full shadow-2xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-black">
          🔒 Authentication Required
        </h2>
        <p className="text-gray-700 mb-6">
          You need to be logged in to view you dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
          <a
            href="/authentication"
            className="bg-sky-700 hover:bg-sky-900 text-white px-4 py-2 rounded"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6 capitalize">
        Welcome, {name ? name : username}!
      </h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2 rounded ${
            activeTab === "bookings"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Your Bookings
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded ${
            activeTab === "events"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Your Events
        </button>
      </div>

      {activeTab === "bookings" ? (
        bookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((ticket) => (
              <li
                key={ticket.id}
                className="bg-white rounded-lg shadow p-4 border text-black"
              >
                <p className="text-lg font-bold">{ticket.event_title}</p>
                <p>Date: {ticket.event_date}</p>
                <p>Quantity: {ticket.quantity}</p>
                <p>Booking Id: {ticket.quantity}</p>
                <p>Ticket no: {ticket.quantity}</p>
                <p className="text-sm">
                  Booked at: {new Date(ticket.booked_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )
      ) : eventsCreated.length === 0 ? (
        <p className="text-gray-500">No events created yet.</p>
      ) : (
        <ul className="space-y-4">
          {eventsCreated.map((event) => (
            <li
              key={event.id}
              className="bg-white rounded-lg shadow p-4 border text-black"
            >
              <p className="text-lg font-bold">{event.title}</p>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
              <p>Price: ₹{event.price}</p>
              <p>Current Status: ₹{event.price}</p>
              <p>Attendance: ₹{event.price}</p>
              <p className="text-sm">
                Created at: {new Date(event.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
      {showLoginModal && (
        <LoginWarningModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
