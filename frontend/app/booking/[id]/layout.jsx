export const metadata = {
    title: "Eventify | Booking",
  };
  
  export default function EventsLayout({ children }) {
    return <>{children}</>;
  }
  



//   import axios from "axios";

// export async function generateMetadata({ id }) {
//   const res = await axios.get(
//     `http://localhost:8000/api/v1/user/booking/${id}`,
//     {
//       headers: {
//         "Cache-Control": "no-store",
//       },
//     }
//   );

//   const booking = res.data;
//   return {
//     title: `Eventify | ${booking.custom_id}`,
//   };
// }

// export default function BookingDetailLayout({ children }) {
//   return <>{children}</>;
// }
