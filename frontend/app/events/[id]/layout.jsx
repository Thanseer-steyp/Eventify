import axios from "axios";

export async function generateMetadata({ params }) {
  const res = await axios.get(
    `http://localhost:8000/api/v1/public/events/${params.id}`,
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );

  const event = res.data;
  return {
    title: `Eventify | ${event.title}`,
  };
}

export default function EventDetailLayout({ children }) {
  return <>{children}</>;
}
