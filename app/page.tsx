'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [text, setText] = useState<string>(''); // State to store typed text
  const containerRef = useRef<HTMLDivElement>(null); // Ref to focus on page load

  // Focus the div so it can capture keydown events
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Keydown event handler
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Backspace') {
      // Remove last character if backspace is pressed
      setText((prev) => prev.slice(0, -1));
    } else if (event.key.length === 1) {
      // Append the character typed by the user
      setText((prev) => prev + event.key);
    }
  };

  return (
    <div
      className="flex pt-20 items-start justify-top min-h-screen bg-[#191919] outline-none"
      tabIndex={0} // Makes the div focusable to capture key events
      onKeyDown={handleKeyDown} // Listen for keydown events
      ref={containerRef} // Reference to auto-focus
    >
      <div className="font-mono text-2xl text-white">
      <span>{text}</span>
      <span className="blinking-cursor">_</span>
      </div>

      {/* Tailwind CSS for blinking effect */}
      <style jsx>{`
      .blinking-cursor {
        animation: blink 1s step-start infinite;
      }

      @keyframes blink {
        50% {
        opacity: 0;
        }
      }
      `}</style>
    </div>
  );
}
