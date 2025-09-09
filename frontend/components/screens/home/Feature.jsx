export default function Feature() {
    return (
      <section className="py-16 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0b1c2d] mb-12">
          Why to host your next event with us?
        </h2>
  
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 px-4">
          {/* Card 1 */}
          <div>
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-[#f3425f] mb-4">
              {/* Icon: You can use HeroIcons / SVG / image */}
              <img src="/1.png" alt="Analytics" className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Enhance User Experience Engagement
            </h3>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              Hosting your event with us will not only bring you a great footfall but we promise your
              attendees a great experience on our platform which has features that compliment each other.
            </p>
          </div>
  
          {/* Card 2 */}
          <div>
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-[#00b6b8] mb-4">
              <img src="/2.png" alt="Payment" className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Seamless payment process
            </h3>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              Our payment model is innovative. We opted for direct payment to organizer and popular
              payment gateway as digital payment options for your attendees to book their event with us.
            </p>
          </div>
  
          {/* Card 3 */}
          <div>
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-[#ffc107] mb-4">
              <img src="/3.png" alt="Register" className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Making complex registration Simple
            </h3>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              With our seamless registration, easily adaptable and understandable user experience and
              best attendees onboarding, event organizers spend nearly no time answering attendee questions.
            </p>
          </div>
        </div>

      </section>
    );
  }
  