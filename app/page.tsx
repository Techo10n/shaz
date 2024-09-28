import Image from "next/image";

export default function Home() {
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

export default HomePage;
