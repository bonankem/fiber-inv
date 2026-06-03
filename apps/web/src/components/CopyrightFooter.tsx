import { useState } from "react";

export default function CopyrightFooter() {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <p className="font-medium text-center text-xs">
      <a
        href="https://zoracom.com/services/serviceX"
        target="_blank"
        rel="noopener noreferrer"
      >
        ServiceX
      </a>{" "}
      &copy; {year} Zoracom
    </p>
  );
}
