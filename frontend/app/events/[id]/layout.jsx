export async function generateMetadata({ params }) {
  const res = await fetch(
    `http://localhost:8000/api/v1/public/events/${params.id}`,
    {
      cache: "no-store",
    }
  );

  const event = await res.json();
  return {
    title: `Eventify | ${event.title}`,
  };
}

export default function EventDetailLayout({ children }) {
  return <>{children}</>;
}
