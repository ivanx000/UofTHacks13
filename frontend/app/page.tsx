"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const [goal, setGoal] = useState("");
  const router = useRouter();
  const placeholders = [
    "to feel back in control of my days.",
    "to get back into creative habits.",
    "my carry-on to actually work for me.",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade out

      setTimeout(() => {
        // switch to next placeholder
        setCurrentIndex((prev) => (prev + 1) % placeholders.length);
        setFade(true); // fade back in
      }, 500); // fade-out duration
    }, 3000); // total time before next placeholder

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const goToLoadingPage = () => {
    if (goal.trim() === "") return; // extra safety
    router.push(`/loading_page?goal=${encodeURIComponent(goal)}`);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center mr-2 ml-2 relative">
        {/* Background Video (optional, add your <video> here) */}

        {/* Page Title */}
        <div className="text-7xl lg:text-8xl text-center">
          Shop for outcomes
        </div>

        {/* Search Bar */}
        <div className="flex mt-10 w-110 lg:w-200 relative">
          {/* Input wrapper */}
          <div className="relative flex-1">
            {/* Static prefix */}
            <span className="absolute left-4 mt-4 lg:mt-4.5 text-gray-400 pointer-events-none">
              I want…
            </span>

            {/* Input field */}
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="text-sm lg:text-lg w-full pl-20 px-4 py-4 rounded-lg border bg-gray-100 border-gray-300 focus:outline-none"
              placeholder="" // leave empty, we use span for animation
            />

            {/* Animated fading placeholder after static prefix */}
            {!goal && (
              <span
                className={`absolute left-20 mt-4 lg:mt-4.5 text-gray-400 pointer-events-none transition-opacity duration-500 ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
              >
                {placeholders[currentIndex]}
              </span>
            )}
          </div>

          {/* Go Button */}
          <button
            onClick={goToLoadingPage}
            disabled={goal.trim() === ""}
            className="ml-2 lg:ml-5 w-15 lg:w-20 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            Go
          </button>
        </div>
      </div>
    </>
  );
}
