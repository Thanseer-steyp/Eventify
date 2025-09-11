import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CustomDatePicker from "../../utils/CustomDatePicker";
import CustomTimePicker from "../../utils/CustomTimePicker";

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
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

              <div className="grid sm:grid-cols-2 gap-4 w-full">
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
          <div className="md:grid md:grid-cols-5 gap-4 mb-4">
            <div className="bg-white rounded-xl p-8 shadow-xl md:col-span-3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-1 text-black">
                📅 Date, Time, Duration, Location & Ticket
              </h2>
              <p className="text-sm text-black mb-6">
                When and where will your event take place?
              </p>

              <div className="md:grid md:grid-cols-2 gap-4 space-y-4 md:space-y-0">
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
                  {showCustomDatePicker && (
                    <CustomDatePicker
                      formData={formData}
                      setFormData={setFormData}
                      setDisplayDate={setDisplayDate}
                      setShowCustomDatePicker={setShowCustomDatePicker}
                    />
                  )}
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
                  {showCustomTimePicker && (
                    <CustomTimePicker
                      formData={formData}
                      setFormData={setFormData}
                      setDisplayTime={setDisplayTime}
                      setShowCustomTimePicker={setShowCustomTimePicker}
                    />
                  )}
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
                  className="p-3 w-full rounded-lg bg-gray-200 text-black placeholder-gray-500 focus:outline-none"
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
            <div className="bg-white rounded-xl p-8 shadow-xl md:col-span-2">
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
                      <span className="text-black text-xs break-words">
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
                      <span className="text-black text-md break-words">
                        {formData.guest_image.name}
                      </span>
                    </p>
                  )}
                  {!formData.guest_image && event?.guest_image && (
                    <p className="mt-3 text-sm text-gray-500">
                      Current guest image:{" "}
                      <span className="text-black text-md break-words">
                        {event.guest_image}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="md:grid md:grid-cols-4 gap-4 space-y-4 md:space-y-0">
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

export default EditEventModal;