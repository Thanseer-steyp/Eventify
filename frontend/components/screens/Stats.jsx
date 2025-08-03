import React from 'react'

function Stats() {
  return (
    <>
     <div className="bg-[#F1f7fa] py-20">
      <div className="wrappper">
        <div className="max-w-6xl mx-auto px-4 flex flex-col flex-row justify-between text-black text-center gap-12">
          <div className="flex-1 border-r-4 border-[#E2E8F0]">
            <h2 className="text-4xl font-bold">
              50<span className="text-3xl font-medium">+</span>
            </h2>
            <p className="mt-2 text-lg">Organizers</p>
          </div>

          <div className="flex-1 border-r-4 border-[#E2E8F0]">
            <h2 className="text-4xl font-bold">
              400<span className="text-3xl font-medium">+</span>
            </h2>
            <p className="mt-2 text-lg">Events</p>
          </div>

          <div className="flex-1">
            <h2 className="text-4xl font-bold">
              10000<span className="text-3xl font-medium">+</span>
            </h2>
            <p className="mt-2 text-lg">Attendees</p>
          </div>
        </div>
      </div>
    </div> 
    </>
  )
}

export default Stats
