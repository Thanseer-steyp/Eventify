function EventsSection({ eventsCreated, setEditingEvent }) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
  
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
  
    if (eventsCreated.length === 0) {
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
      );
    }
  
    return (
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-indian-rupee-icon lucide-indian-rupee"
                    >
                      <path d="M6 3h12" />
                      <path d="M6 8h12" />
                      <path d="m6 13 8.5 8" />
                      <path d="M6 13h3" />
                      <path d="M9 13c6.667 0 6.667-10 0-10" />
                    </svg>
                    <span>
                      {Number(event.price) === 0 ? "Free" : `₹${event.price}`}
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-square-check-big-icon lucide-square-check-big"
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-ticket-check-icon lucide-ticket-check"
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
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-ticket-minus-icon lucide-ticket-minus"
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
    );
  }
  
  export default EventsSection;