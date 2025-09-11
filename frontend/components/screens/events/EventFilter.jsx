import { DateRange } from "react-date-range";

const EventFilter = ({
  search,
  setSearch,
  location,
  setLocation,
  price,
  setPrice,
  priceSelected,
  setPriceSelected,
  dateRange,
  setDateRange,
  dateSelected,
  setDateSelected,
  showCalendar,
  setShowCalendar,
  showPastEvents,
  setShowPastEvents,
  handleFilter,
  handleClearFilters,
  calendarRef,
  filtersApplied,
}) => {
  return (
    <div className="wrapper py-[150px]">
      <h2 className="text-4xl md:text-5xl text-center font-semibold mb-5 leading-tight">
        FIND AN EVENT & BUY TICKETS
      </h2>

      {/* Search */}
      <div className="mb-4">
        <label className="block font-medium text-sm mb-1 text-center">
          FIND EVENT BY NAME
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded-md bg-white text-black focus:outline-none w-full"
        />
      </div>

      {/* Date / Location / Price */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Date filter */}
        <div className="relative" ref={calendarRef}>
          <label className="block font-medium text-sm mb-1 text-center">
            FIND BY DATE
          </label>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex flex-col text-left bg-white text-black px-4 py-2 rounded-md w-full"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-black">
                {dateSelected
                  ? [dateRange[0].startDate, dateRange[0].endDate]
                      .map(
                        (d) =>
                          `${d.getDate().toString().padStart(2, "0")}-${(
                            d.getMonth() + 1
                          )
                            .toString()
                            .padStart(2, "0")}-${d.getFullYear()}`
                      )
                      .join(" - ")
                  : ""}
              </span>
              <span className="text-yellow-400 ml-2">
                {showCalendar ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {showCalendar && (
            <div className="absolute mt-2 z-20 bg-white rounded-md shadow-lg">
              <DateRange
                editableDateInputs={true}
                onChange={(item) => {
                  setDateRange([item.selection]);
                  setDateSelected(true);
                }}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                minDate={new Date()}
                className="rounded-md"
              />
            </div>
          )}
        </div>

        {/* Location */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-center">
            FIND BY LOCATION
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="p-2 rounded-md bg-white text-black focus:outline-none w-full"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-center mb-1">
            FIND BY BUDGET
          </label>
          <div className="p-2 rounded-md bg-white flex items-center">
            <input
              type="number"
              min={0}
              max={10000}
              step={50}
              value={priceSelected ? price : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setPrice(0);
                  setPriceSelected(false);
                } else {
                  const numValue = Number(value);
                  if (numValue >= 0) {
                    setPrice(numValue);
                    setPriceSelected(true);
                  }
                }
              }}
              className="w-full border-none outline-none text-black bg-transparent
              [&::-webkit-outer-spin-button]:appearance-none 
              [&::-webkit-inner-spin-button]:appearance-none 
              [-moz-appearance:textfield]"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-4 mt-5">
        <button
          onClick={filtersApplied ? handleClearFilters : handleFilter}
          className={`px-5 py-2 rounded-md font-semibold cursor-pointer transition 
    ${
      filtersApplied
        ? "border border-white text-white hover:bg-white hover:text-black"
        : "bg-yellow-400 text-white hover:bg-yellow-500"
    }`}
        >
          {filtersApplied ? "Clear" : "Find events"}
        </button>

        <button
          onClick={() => setShowPastEvents(!showPastEvents)}
          className={`px-5 py-2 rounded-md font-semibold transition ${
            showPastEvents
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showPastEvents ? "Hide Past Events" : "Show Past Events"}
        </button>
      </div>
    </div>
  );
};

export default EventFilter;
