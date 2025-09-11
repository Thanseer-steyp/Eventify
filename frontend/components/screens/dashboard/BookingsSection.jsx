import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

function BookingsSection({ bookings, setBookings }) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
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
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No bookings yet
        </h3>
        <p className="text-gray-500 mb-6">
          Start exploring events and make your first booking!
        </p>
        <a
          href="/events"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Browse Events
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {bookings.map((booking) => (
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
          key={booking.id}
        >
          <div className="flex justify-between items-start mb-4 flex-wrap sm:flex-nowrap">
            <div className="md:flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center sm:text-left">
                {booking.event_title}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 w-max mx-auto sm:mx-0">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Booking ID: #{booking.custom_id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
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
                  <span>
                    {(() => {
                      const date = new Date(booking.event_date);
                      const dd = date.toLocaleDateString("en-GB", {
                        day: "2-digit",
                      });
                      const month = months[date.getMonth()];
                      const yyyy = date.getFullYear();

                      // Convert event.time (e.g., "17:00:00") into 12-hour format
                      let timeString = "";
                      if (booking.event_time) {
                        const [hours, minutes] = booking.event_time.split(":");
                        const dateTime = new Date();
                        dateTime.setHours(hours, minutes);
                        timeString = dateTime.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        });
                      }

                      return `${dd} ${month} ${yyyy} • ${timeString}`;
                    })()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="#99a1af"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{booking.event_location}</span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="sm:ml-5 flex-shrink-0 mt-4 sm:mt-0 w-max mx-auto sm:mx-0">
              <div className="bg-gray-50 rounded-xl p-1.5 border border-gray-200 text-center">
                <img
                  src={booking.qr_code}
                  alt="Booking QR Code"
                  className="w-30 h-30 object-contain mx-auto mb-2"
                />
                <p className="text-[11px] text-gray-500 font-medium">
                  Scan QR to get details
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Booked at:{" "}
              {new Date(booking.booked_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <button
              onClick={async (e) => {
                e.stopPropagation(); // Prevent triggering the card click
                const result = await Swal.fire({
                  title: "Cancel Booking?",
                  text: "NB: No refund will be provided",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#dc2626",
                  cancelButtonColor: "#6b7280",
                  confirmButtonText: "Yes, cancel it!",
                  cancelButtonText: "Close",
                  customClass: {
                    popup: "rounded-2xl",
                    confirmButton: "rounded-xl",
                    cancelButton: "rounded-xl",
                  },
                });

                if (result.isConfirmed) {
                  const token = localStorage.getItem("access");
                  try {
                    await axios.delete(
                      `http://localhost:8000/api/v1/user/cancel-booking/${booking.id}/`,
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    setBookings(bookings.filter((b) => b.id !== booking.id));
                    toast.success("Your booking has been cancelled!");
                  } catch (err) {
                    toast.error(
                      "Failed to cancel booking. Try again after some time."
                    );
                  }
                }
              }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-300 text-sm font-medium flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BookingsSection;