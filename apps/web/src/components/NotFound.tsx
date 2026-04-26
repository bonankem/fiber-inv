import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <main className="flex flex-col gap-2 items-center justify-center w-screen h-screen">
      <p>Page not found.</p>
      <Link to="/">Go Home</Link>
    </main>
  );
}
