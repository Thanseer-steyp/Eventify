"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CreateEventForm() {
  const initialFormData = {
    title: "",
    description: "",
    category: "",
    maxAttendees: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    price: "",
    guest: "",
    tags: "",
    image: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [displayTime, setDisplayTime] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Get today's date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  // Convert 24-hour to 12-hour format
  const convertTo12Hour = (time24) => {
    if (!time24) return "";

    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
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
      const formattedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD format
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
          {/* Year and Month selectors */}
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) =>
                handleMonthYearChange(parseInt(e.target.value), selectedMonth)
              }
              className="flex-1 bg-[#0f1b2a] text-white p-2 rounded border border-gray-600 focus:border-yellow-400"
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
              className="flex-1 bg-[#0f1b2a] text-white p-2 rounded border border-gray-600 focus:border-yellow-400"
            >
              {months.map((month, index) => {
                // Disable past months for current year
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

          {/* Date selector */}
          <div className="max-h-32 overflow-y-auto">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(parseInt(e.target.value))}
              className="w-full bg-[#0f1b2a] text-white p-2 rounded border border-gray-600 focus:border-yellow-400"
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
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded font-semibold hover:bg-gray-700"
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
      <div className="absolute top-full left-0 mt-1 bg-[#1a2a3a] border border-gray-600 rounded-lg p-4 shadow-lg z-20 w-full">
        <div className="flex gap-2 items-center justify-center">
          {/* Hour selector */}
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="bg-[#0f1b2a] text-white p-2 rounded border border-gray-600 focus:border-yellow-400"
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
            className="bg-[#0f1b2a] text-white p-2 rounded border border-gray-600 focus:border-yellow-400"
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
            className="bg-[#0f1b2a] text-white p-2 rounded border border-gray-600 focus:border-yellow-400"
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
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded font-semibold hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required`);
        return;
      }
    }

    if (!formData.image) {
      toast.error("Image is required");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      toast.error("You must be logged in to create an event");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("max_attendees", formData.maxAttendees);
    data.append("date", formData.date);
    data.append("time", formData.time); // This will be in 24-hour format for backend
    data.append("duration", formData.duration);
    data.append("location", formData.location);
    data.append("price", formData.price);
    data.append("guest", formData.guest);
    if (formData.image) data.append("image", formData.image);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/events/create/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Event created successfully!");
      console.log("Event created:", res.data);
      setFormData(initialFormData);
      setDisplayTime(""); // Reset display time
      setDisplayDate(""); // Reset display date
      setShowCustomTimePicker(false); // Close time picker
      setShowCustomDatePicker(false); // Close date picker
    } catch (err) {
      console.error("Error creating event:", err.response?.data || err.message);
      toast.error("Failed to create event. Check all fields and try again.");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="min-h-screen bg-[#0b1c2d] py-10 px-4 md:px-20 text-white space-y-10"
      >
        <div className="wrapper">
          {/* Basic Information */}
          <div className="bg-[#1a2a3a] rounded-xl p-8 shadow-lg mb-4">
            <h2 className="text-2xl font-bold mb-1 text-white">
              📌 Basic Information
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              Let's start with the essential details about your event
            </p>

            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your event title..."
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
              />
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 resize-none focus:border-yellow-400 focus:outline-none"
              />
              <div className="flex gap-4">
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter Category"
                  className="w-1/2 p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white focus:border-yellow-400 focus:outline-none"
                />
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  placeholder="Maximum number of attendees"
                  className="w-1/2 p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date, Time & Location */}
          <div className="bg-[#1a2a3a] rounded-xl p-8 shadow-lg mb-4">
            <h2 className="text-2xl font-bold mb-1 text-white">
              📅 Date, Time & Location
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              When and where will your event take place?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Custom Date Input */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomDatePicker(!showCustomDatePicker);
                    setShowCustomTimePicker(false); // Close time picker if open
                  }}
                  className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-left text-gray-400 focus:border-yellow-400 focus:outline-none hover:border-gray-500"
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
                    setShowCustomDatePicker(false); // Close date picker if open
                  }}
                  className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-left text-gray-400 focus:border-yellow-400 focus:outline-none hover:border-gray-500"
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
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter venue address or online platform..."
              className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 mt-4 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          {/* Media & Details */}
          <div className="bg-[#1a2a3a] rounded-xl p-8 shadow-lg mb-4">
            <h2 className="text-2xl font-bold mb-1 text-white">
              🖼️ Media & Details
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              Add visual appeal and additional information
            </p>

            <div className="bg-[#0f1b2a] border-2 border-dashed border-gray-500 rounded-lg p-6 text-center relative">
              <input
                type="file"
                name="image"
                accept="image/png, image/jpeg"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <p className="text-gray-400 pointer-events-none">
                Click to upload an event image or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1 pointer-events-none">
                PNG, JPG up to 10MB
              </p>
              {formData.image && (
                <p className="mt-3 text-sm text-gray-300">
                  Selected image:{" "}
                  <span className="text-yellow-300">{formData.image.name}</span>
                </p>
              )}
            </div>

            <div className="flex md:grid-cols-2 gap-4 mt-6">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Ticket price"
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
              />
              <input
                type="text"
                name="guest"
                value={formData.guest}
                onChange={handleChange}
                placeholder="Special guest? (optional)"
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-yellow-400 text-[#131d30] font-bold py-3 px-8 rounded-md w-full hover:bg-yellow-500 transition-colors"
            >
              Create Event
            </button>
          </div>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default CreateEventForm;
