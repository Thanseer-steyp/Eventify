"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import Skeleton from "../../components/includes/Skeleton";
import { Shield } from "lucide-react";

function EditEventModal({ event, onClose, onSave }) {
  // Add null check for event
  if (!event) {
    return null;
  }

  // Initialize form data with event values
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    category: event?.category || "",
    maxAttendees: event?.max_attendees || "",
    date: event?.date || "",
    time: event?.time || "",
    duration: event?.duration || "",
    location: event?.location || "",
    price: event?.price || "",
    guest: event?.guest || "",
    guest_image: null, // File inputs reset to null
    image: null, // File inputs reset to null
  });

  // Display states for custom pickers
  const [displayTime, setDisplayTime] = useState(() => {
    if (!event?.time) return "";
    const [hours, minutes] = event.time.split(":");
    let hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, "0")}:${minutes} ${period}`;
  });

  const [displayDate, setDisplayDate] = useState(() => {
    if (!event?.date) return "";
    const dateObj = new Date(event.date);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  });

  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showGuestFields, setShowGuestFields] = useState(
    Boolean(event?.guest || event?.guest_image)
  );

  // Get today's date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (time12) => {
    if (!time12) return "";
    const [time, period] = time12.split(" ");
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours, 10);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  };

  // Custom date picker component
  const CustomDatePicker = () => {
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedDate, setSelectedDate] = useState(currentDate);

    // Generate years (current year + next 5 years)
    const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

    // Month names
    const months = [
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

    // Get days in month
    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };

    // Get valid dates for selected month/year
    const getValidDates = () => {
      const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
      const dates = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(selectedYear, selectedMonth, i);
        // Only include dates from today onwards
        if (dateObj >= new Date(currentYear, currentMonth, currentDate)) {
          dates.push(i);
        }
      }
      return dates;
    };

    const validDates = getValidDates();

    // Update selected date when month/year changes
    const handleMonthYearChange = (newYear, newMonth) => {
      setSelectedYear(newYear);
      setSelectedMonth(newMonth);

      // Reset selected date to first valid date if current selection is invalid
      const validDatesForNewMonth = [];
      const daysInMonth = getDaysInMonth(newYear, newMonth);

      for (let i = 1; i <= daysInMonth; i++) {
        const dateObj = new Date(newYear, newMonth, i);
        if (dateObj >= new Date(currentYear, currentMonth, currentDate)) {
          validDatesForNewMonth.push(i);
        }
      }

      if (
        validDatesForNewMonth.length > 0 &&
        !validDatesForNewMonth.includes(selectedDate)
      ) {
        setSelectedDate(validDatesForNewMonth[0]);
      }
    };

    const handleDateSelect = () => {
      const dateObj = new Date(selectedYear, selectedMonth, selectedDate);
      const formattedDate = dateObj.toLocaleDateString("en-CA");
      const displayFormattedDate = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      setFormData({
        ...formData,
        date: formattedDate,
      });
      setDisplayDate(displayFormattedDate);
      setShowCustomDatePicker(false);
    };

    return (
      <div className="absolute top-full left-0 mt-1 bg-[#1a2a3a] border border-gray-600 rounded-lg p-4 shadow-lg z-20 w-full">
        <div className="space-y-3">
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) =>
                handleMonthYearChange(parseInt(e.target.value), selectedMonth)
              }
              className="flex-1 bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) =>
                handleMonthYearChange(selectedYear, parseInt(e.target.value))
              }
              className="flex-1 bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
            >
              {months.map((month, index) => {
                const isDisabled =
                  selectedYear === currentYear && index < currentMonth;
                return (
                  <option key={index} value={index} disabled={isDisabled}>
                    {month}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="max-h-32 overflow-y-auto">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(parseInt(e.target.value))}
              className="w-full bg-[#0f1b2a] text-white p-2 rounded border border-gray-600"
              size="6"
            >
              {validDates.map((date) => (
                <option key={date} value={date}>
                  {date} {months[selectedMonth]} {selectedYear}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleDateSelect}
            className="flex-1 bg-yellow-400 text-black py-2 px-4 rounded font-semibold hover:bg-yellow-500"
          >
            Select
          </button>
          <button
            type="button"
            onClick={() => setShowCustomDatePicker(false)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-semibold hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Custom 12-hour time picker component
  const CustomTimePicker = () => {
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [period, setPeriod] = useState("AM");

    const hours = Array.from({ length: 12 }, (_, i) =>
      (i + 1).toString().padStart(2, "0")
    );
    const minutes = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, "0")
    );

    const handleTimeSelect = () => {
      const time12 = `${hour}:${minute} ${period}`;
      const time24 = convertTo24Hour(time12);

      setFormData({
        ...formData,
        time: time24,
      });
      setDisplayTime(time12);
      setShowCustomTimePicker(false);
    };

    return (
      <div className="absolute top-full left-0 mt-1 bg-[#1a2a3a] border border-gray-600 rounded-lg p-3 shadow-lg z-20 w-full">
        <div className="flex gap-1 items-center justify-between">
          {/* Hour selector */}
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="bg-[#0f1b2a] text-white px-3 py-2 rounded border border-gray-600 appearance-none text-center"
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <span className="text-white text-xl">:</span>

          {/* Minute selector */}
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="bg-[#0f1b2a] text-white p-2 rounded border border-gray-600 appearance-none text-center"
          >
            {minutes
              .filter((_, i) => i % 5 === 0)
              .map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
          </select>

          {/* AM/PM selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#0f1b2a] text-white p-2 rounded border border-gray-600 appearance-none text-center"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleTimeSelect}
            className="flex-1 bg-yellow-400 text-black py-2 px-4 rounded font-semibold hover:bg-yellow-500"
          >
            Select
          </button>
          <button
            type="button"
            onClick={() => setShowCustomTimePicker(false)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-semibold hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (Number(formData.maxAttendees) < Number(event.tickets_sold)) {
      toast.warning(
        `You cannot set maximum attendees (${formData.maxAttendees}) less than the already booked tickets (${event.tickets_sold}).`
      );
      return; // Stop form submission
    }

    const requiredFields = [
      "title",
      "description",
      "category",
      "maxAttendees",
      "date",
      "time",
      "duration",
      "location",
      "price",
    ];

    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("You must be logged in to update an event");
      return;
    }

    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required`);
        return;
      }
    }

    // Prepare form data for submission
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("max_attendees", formData.maxAttendees);
    data.append("date", formData.date);
    data.append("time", formData.time);
    data.append("duration", formData.duration);
    data.append("location", formData.location);
    data.append("price", formData.price);
    data.append("guest", formData.guest);

    // Only append files if they were selected
    if (formData.image) data.append("image", formData.image);
    if (formData.guest_image) data.append("guest_image", formData.guest_image);

    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/user/edit-event/${event?.id}/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onSave(res.data);
      onClose();
      toast.success("Event edited successfully!");
    } catch (err) {
      console.error("Error updating event:", err.response?.data || err.message);
      toast.error(
        "Failed to edit event. Please check all fields and try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-[2px] overflow-y-auto">
      <div className="bg-gray-200 rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSave} className="text-white space-y-10">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-8 shadow-xl mb-4">
            <h2 className="text-2xl font-bold mb-1 text-black">
              📌 Basic Information
            </h2>
            <p className="text-sm text-black mb-6">
              Update the essential details about your event
            </p>

            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your event title..."
                className="w-full p-3 rounded-lg bg-gray-200 text-black placeholder-gray-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-4 w-full">
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  className="p-3 rounded-lg bg-gray-200 text-black placeholder-gray-500 resize-none focus:outline-none h-full"
                />
                <div className="grid grid-rows-2 gap-4 h-full">
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter Category"
                    className="p-3 rounded-lg bg-gray-200 text-black placeholder-gray-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    placeholder="Maximum number of attendees"
                    className="p-3 rounded-lg bg-gray-200 text-black placeholder-gray-500 focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date, Time & Location */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="bg-white rounded-xl p-8 shadow-xl col-span-3">
              <h2 className="text-2xl font-bold mb-1 text-black">
                📅 Date, Time, Duration, Location & Ticket
              </h2>
              <p className="text-sm text-black mb-6">
                When and where will your event take place?
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Custom Date Input */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomDatePicker(!showCustomDatePicker);
                      setShowCustomTimePicker(false);
                    }}
                    className={`w-full p-3 rounded-lg bg-gray-200 text-left focus:outline-none hover:border-gray-500 ${
                      displayDate ? "text-black" : "text-gray-500"
                    }`}
                  >
                    {displayDate || "Select date"}
                  </button>
                  {showCustomDatePicker && <CustomDatePicker />}
                </div>

                {/* Custom Time Input */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomTimePicker(!showCustomTimePicker);
                      setShowCustomDatePicker(false);
                    }}
                    className={`w-full p-3 rounded-lg bg-gray-200 text-left focus:outline-none hover:border-gray-500 ${
                      displayTime ? "text-black" : "text-gray-500"
                    }`}
                  >
                    {displayTime || "Select time"}
                  </button>
                  {showCustomTimePicker && <CustomTimePicker />}
                </div>

                <input
                  name="duration"
                  type="number"
                  placeholder="Duration in hours"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-200 text-black focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter venue address or online platform..."
                  className="p-3 rounded-lg bg-gray-200 text-black placeholder-gray-500 focus:outline-none"
                />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  step={50}
                  onChange={handleChange}
                  placeholder="Ticket price"
                  className="col-span-2 w-full p-3 rounded-lg bg-gray-200 text-black placeholder-gray-500 focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </div>
            </div>

            {/* Media & Details */}
            <div className="bg-white rounded-xl p-8 shadow-xl col-span-2">
              <h2 className="text-2xl font-bold mb-1 text-black">🖼️ Media</h2>
              <p className="text-sm text-black mb-6">Upload visual appeal</p>

              <div className="">
                <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg text-center relative">
                  <input
                    type="file"
                    name="image"
                    accept="image/png, image/jpeg"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <p className="text-gray-500 p-3 pointer-events-none">
                    Click to upload new event image (optional)
                  </p>
                  <p className="text-xs text-gray-500 mt-1 pointer-events-none">
                    PNG, JPG up to 10MB
                  </p>
                  {formData.image && (
                    <p className="text-gray-500 p-3">
                      New image:{" "}
                      <span className="text-black text-xs">
                        {formData.image.name}
                      </span>
                    </p>
                  )}
                  {!formData.image && event?.image && (
                    <p className="text-gray-500 p-3">
                      Current image:{" "}
                      <span className="text-black text-xs break-words">
                        {event.image}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="bg-white rounded-xl p-8 shadow-xl mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-black">
                  🧑‍💼 Guest Details
                </h2>
                <p className="text-sm text-black">Add guest name and image</p>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showGuestFields}
                      onChange={() => setShowGuestFields(!showGuestFields)}
                      className="sr-only"
                    />
                    <div
                      className={`w-14 h-8 rounded-full transition ${
                        showGuestFields ? "bg-black" : "bg-gray-400"
                      }`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 w-6 h-6 rounded-full bg-white transition ${
                        showGuestFields ? "translate-x-6" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
            </div>
            {showGuestFields && (
              <div className="mt-6">
                <input
                  type="text"
                  name="guest"
                  value={formData.guest}
                  onChange={handleChange}
                  placeholder="Special guest? (optional)"
                  className="w-full p-3 rounded-lg bg-gray-200 text-black placeholder-gray-500 focus:outline-none"
                />
                <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-6 text-center relative mt-6">
                  <input
                    type="file"
                    name="guest_image"
                    accept="image/png, image/jpeg"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <p className="text-gray-500 pointer-events-none">
                    Click to upload new guest image (optional)
                  </p>
                  <p className="text-xs text-gray-500 mt-1 pointer-events-none">
                    PNG, JPG up to 10MB
                  </p>
                  {formData.guest_image && (
                    <p className="mt-3 text-sm text-gray-500">
                      New guest image:{" "}
                      <span className="text-black text-md">
                        {formData.guest_image.name}
                      </span>
                    </p>
                  )}
                  {!formData.guest_image && event?.guest_image && (
                    <p className="mt-3 text-sm text-gray-500">
                      Current guest image:{" "}
                      <span className="text-black text-md">
                        {event.guest_image}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="grid grid-cols-4 gap-4">
            <button
              type="submit"
              className="bg-white cursor-pointer col-span-3 text-black font-bold py-3 px-8 rounded-md w-full shadow-xl hover:bg-gray-100"
            >
              Update Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 cursor-pointer col-span-1 text-white font-bold py-3 px-8 rounded-md w-full shadow-xl hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

  const parseEventDate = (dateString) => {
    // Handle ISO format dates like "2025-08-19T00:00:00Z" or regular dates
    if (dateString.includes("T")) {
      return new Date(dateString);
    }

    // Handle DD/MM/YYYY format
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return new Date(year, month - 1, day);
    }

    // Handle YYYY-MM-DD format
    if (dateString.includes("-")) {
      return new Date(dateString);
    }

    // Default fallback
    return new Date(dateString);
  };

  const isEventPast = (event) => {
    const now = new Date();
    const dateField = event.date || event.event_date;
    const timeField = event.time || event.event_time;

    if (!dateField) return false;

    const eventDate = parseEventDate(dateField);

    if (!timeField) {
      eventDate.setHours(23, 59, 59, 999);
      return now > eventDate;
    }

    const timePart = timeField.toString();
    const [rawTime, modifier] = timePart.split(" ");

    if (!rawTime || !rawTime.includes(":")) {
      eventDate.setHours(23, 59, 59, 999);
      return now > eventDate;
    }

    let [hours, minutes] = rawTime.split(":").map(Number);

    if (modifier?.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;

    eventDate.setHours(hours, minutes, 0, 0);
    return now > eventDate;
  };

  const months = [
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back,{" "}
                <span className="capitalize">
                  {name ? name : username || "Guest"}
                </span>
                ! 👋
              </h1>
              <p className="text-gray-600">
                {token
                  ? "Manage your events and bookings from your personal dashboard"
                  : "Log in to view you dashboard"}
              </p>
            </div>

            {token ? (
              // If logged in → Show logout
              <button
                className="bg-red-500 rounded-full p-3 cursor-pointer"
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
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-key-round-icon lucide-key-round"
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
                className="w-5 h-5"
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
                className="w-5 h-5"
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
            bookings.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {bookings.map((booking) => (
                  <div
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                    key={booking.id}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {booking.event_title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
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
                                  const [hours, minutes] =
                                    booking.event_time.split(":");
                                  const dateTime = new Date();
                                  dateTime.setHours(hours, minutes);
                                  timeString = dateTime.toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  );
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
                      <div className="ml-4 flex-shrink-0">
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
                        {new Date(booking.booked_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
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
                              setBookings(
                                bookings.filter((b) => b.id !== booking.id)
                              );
                              toast.success("Your booking has been cancelled.");
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
            )
          ) : eventsCreated.length === 0 ? (
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events created yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start creating amazing events for your audience!
              </p>
              <a
                href="events/create"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-300"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Event
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {eventsCreated.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 min-h-[56px]">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {(() => {
                              const date = new Date(event.date);
                              const dd = date.toLocaleDateString("en-GB", {
                                day: "2-digit",
                              });
                              const month = months[date.getMonth()];
                              const yyyy = date.getFullYear();

                              // Convert event.time (e.g., "17:00:00") into 12-hour format
                              let timeString = "";
                              if (event.time) {
                                const [hours, minutes] = event.time.split(":");
                                const dateTime = new Date();
                                dateTime.setHours(hours, minutes);
                                timeString = dateTime.toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                );
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
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            class="lucide lucide-indian-rupee-icon lucide-indian-rupee"
                          >
                            <path d="M6 3h12" />
                            <path d="M6 8h12" />
                            <path d="m6 13 8.5 8" />
                            <path d="M6 13h3" />
                            <path d="M9 13c6.667 0 6.667-10 0-10" />
                          </svg>
                          <span>
                            {Number(event.price) === 0
                              ? "Free"
                              : `₹${event.price}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            class="lucide lucide-square-check-big-icon lucide-square-check-big"
                          >
                            <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344" />
                            <path d="m9 11 3 3L22 4" />
                          </svg>
                          <span>
                            {event.total_bookings === 0
                              ? "No Bookings Confirmed"
                              : `${event.total_bookings} Bookings Confirmed`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            class="lucide lucide-ticket-check-icon lucide-ticket-check"
                          >
                            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                            <path d="m9 12 2 2 4-4" />
                          </svg>
                          <span>
                            {event.tickets_sold === 0
                              ? "No Tickets Sold"
                              : `${event.tickets_sold} Tickets Sold`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            class="lucide lucide-ticket-minus-icon lucide-ticket-minus"
                          >
                            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                            <path d="M9 12h6" />
                          </svg>
                          <span>
                            {event.tickets_left === 0
                              ? "Sold Out"
                              : `${event.tickets_left} Tickets Left`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isEventPast(event)
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isEventPast(event) ? "Ended" : "Active"}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Created at:{" "}
                      {new Date(event.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                      }}
                      className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors duration-300 text-sm font-medium flex items-center space-x-2"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
