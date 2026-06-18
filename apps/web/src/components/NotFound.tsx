import { Link } from "@tanstack/react-router";
import { Button, Card } from "antd";

export default function NotFound() {
  return (
    <main className="flex items-center justify-center w-dvw h-dvh">
      <Card>
        <div className="flex flex-col gap-4 items-center">
          <p>Page not found.</p>
          <Link to="/">
            <Button size="small">Go Home</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
