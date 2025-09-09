"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Skeleton1 from "@/components/includes/Skeleton1";
import NoBookingFound from "@/components/includes/No-booking";

function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async (id) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/api/v1/user/booking/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setBooking(response.data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchBooking(id);
  }, [id]);

  if (loading) return <Skeleton1 />;
  if (!booking) return <NoBookingFound />;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-10 min-h-[100vh] flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden relative flex flex-col">
        <div className="h-32 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 relative overflow-hidden">
          <img
            src={booking.event_image}
            alt={booking.event_title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <div className="bg-white border-b border-dashed border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {booking.event_title}
            </h2>
            <div className="flex gap-2 items-center mb-2 w-max">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#99a1af"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-calendar-clock-icon lucide-calendar-clock"
              >
                <path d="M16 14v2.2l1.6 1" />
                <path d="M16 2v4" />
                <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                <path d="M3 10h5" />
                <path d="M8 2v4" />
                <circle cx="16" cy="16" r="6" />
              </svg>
              <p className="text-sm text-gray-500">
                {new Date(booking.event_date).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })}{" "}
                |{" "}
                {booking.event_time &&
                  `${parseInt(booking.event_time.split(":")[0]) % 12 || 12}:${
                    booking.event_time.split(":")[1]
                  } ${
                    parseInt(booking.event_time.split(":")[0]) >= 12
                      ? "PM"
                      : "AM"
                  }`}
              </p>
            </div>
            <div className="flex gap-2 items-center w-max">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#99a1af"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-map-pin-icon lucide-map-pin"
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-sm text-gray-500">{booking.event_location}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-[30%] flex-shrink-0">
              <img src={booking.qr_code} alt="QR Code" className="w-full" />
            </div>

            <div className="flex-1 space-y-1.5">
              <p className="text-sm text-gray-800 font-medium">
                Booking ID: #{booking.custom_id}
              </p>
              <p className="text-sm text-gray-800">
                No of Tickets: {booking.quantity}
              </p>
              <p className="text-sm text-gray-800">
                Tickets No: {booking.tickets_id}
              </p>
              <p className="text-sm text-gray-800">Status: Confirmed</p>
            </div>
          </div>

          <div className="text-center mb-6 px-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              A confirmation is sent on e-mail/SMS/WhatsApp within 15 minutes of
              booking.
            </p>
          </div>

          <div className="border-t  border-b border-gray-200 border-dashed py-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-800 font-medium">
                Amount Paid
              </span>
              <div>
                <span className="text-base font-semibold text-gray-800">
                  ₹{booking.total_payement}
                </span>
              </div>
            </div>
          </div>
          <div className="text-xs my-3 text-center text-gray-500 border border-gray-300 p-1.75 border-dashed">
            Booked at:{" "}
            {new Date(booking.booked_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingDetail;
