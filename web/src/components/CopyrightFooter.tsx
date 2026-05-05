import { useState } from "react";

export default function CopyrightFooter() {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <p className="font-medium text-center">
      <a
        href="https://zoracom.com/services/serviceX"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400!"
      >
        Service<span className="text-orange-400">X</span>
      </a>{" "}
      &copy; {year} Zoracom
    </p>
  );
}
