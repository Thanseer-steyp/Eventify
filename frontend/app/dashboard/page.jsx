"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserDashboard() {
  const [firstName, setFirstName] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (token) {
      axios
        .get("http://localhost:8000/user-profile/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setFirstName(res.data.first_name);
          setBookings(res.data.bookings);
        })
        .catch((err) => {
          console.error("Error fetching user profile and bookings:", err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Welcome, {firstName ? firstName : "Guest"}!
      </h1>

      <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((ticket) => (
            <li
              key={ticket.id}
              className="bg-white rounded-lg shadow p-4 border"
            >
              <p className="text-lg font-bold">{ticket.event_title}</p>
              <p>Date: {ticket.event_date}</p>
              <p>Quantity: {ticket.quantity}</p>
              <p className="text-sm text-gray-500">
                Booked at: {new Date(ticket.booked_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
