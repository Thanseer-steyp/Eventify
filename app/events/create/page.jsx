"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function CreateEventForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    maxAttendees: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    price: "",
    specialGuest: "",
    tags: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    if (!token) {
      toast.error("You must be logged in to create an event");
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('max_attendees', formData.maxAttendees);
    data.append('date', formData.date);
    data.append('time', formData.time);
    data.append('duration', formData.duration);
    data.append('location', formData.location);
    data.append('price', formData.price);
    data.append('special_guest', formData.specialGuest);
    if (formData.image) data.append('image', formData.image);

    try {
      const res = await axios.post("http://localhost:8000/events/create/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Event created successfully!");
      console.log("Event created:", res.data);
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
            <h2 className="text-2xl font-bold mb-1 text-purple-400">📌 Basic Information</h2>
            <p className="text-sm text-gray-300 mb-6">Let’s start with the essential details about your event</p>

            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your event title..."
                required
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
              />
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                required
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 resize-none focus:border-yellow-400 focus:outline-none"
              />
              <div className="flex gap-4">
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter Category"
                  required
                  className="w-1/2 p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white focus:border-yellow-400 focus:outline-none"
                />
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  placeholder="Maximum number of attendees"
                  required
                  className="w-1/2 p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date, Time & Location */}
          <div className="bg-[#1a2a3a] rounded-xl p-8 shadow-lg mb-4">
            <h2 className="text-2xl font-bold mb-1 text-purple-400">📅 Date, Time & Location</h2>
            <p className="text-sm text-gray-300 mb-6">When and where will your event take place?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-gray-400 focus:border-yellow-400 focus:outline-none"
              />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-gray-400 focus:border-yellow-400 focus:outline-none"
              />
              <input
                name="duration"
                type="number"
                placeholder="Duration in hour"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter venue address or online platform..."
              className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 mt-4 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          {/* Media & Details */}
          <div className="bg-[#1a2a3a] rounded-xl p-8 shadow-lg mb-4">
            <h2 className="text-2xl font-bold mb-1 text-purple-400">🖼️ Media & Details</h2>
            <p className="text-sm text-gray-300 mb-6">Add visual appeal and additional information</p>

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
            </div>

            <div className="flex md:grid-cols-2 gap-4 mt-6">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="0.00 (leave empty for free)"
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
              />
              <input
                type="text"
                name="specialGuest"
                value={formData.specialGuest}
                onChange={handleChange}
                required
                placeholder="Do you have any special guest?"
                className="w-full p-3 rounded-lg bg-[#0f1b2a] border border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-yellow-400 text-[#131d30] font-bold py-3 px-8 rounded-md w-full"
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
