import { useEffect, useState, useRef } from "react";

/**
 * Opening Splash Animation
 * -------------------------
 * Plays the official "intro 1" transit video animation on initial load.
 * 
 * Features:
 * - Autoplays the animated bus & "මගියා" logo video.
 * - Watermark Removal: Masks and clips the top-left generator watermark cleanly.
 * - Automatically fades out when video ends or after 3.8s timeout.
 * - Click anywhere to immediately skip into the application.
 */
export default function OpeningAnimation() {
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem("magiya_intro_played");
  });
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!visible) return;

    // Attempt playback immediately
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: muted autoplay is generally allowed
      });
    }

    // Safety timeout in case video ends or browser delays
    const timer = setTimeout(() => {
      dismissAnimation();
    }, 3800);

    return () => clearTimeout(timer);
  }, [visible]);

  function dismissAnimation() {
    sessionStorage.setItem("magiya_intro_played", "true");
    setFading(true);
    setTimeout(() => setVisible(false), 500);
  }

  if (!visible) return null;

  return (
    <div
      onClick={dismissAnimation}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-all duration-500 cursor-pointer select-none ${
        fading ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      title="Click to skip"
    >
      {/* Video Display Container */}
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center p-4 overflow-hidden">
        {/* WATERMARK MASK: Pure white patch that completely conceals the top-left DomoAI logo */}
        <div
          className="absolute top-2 left-2 w-36 h-20 bg-white z-20 pointer-events-none"
          aria-hidden="true"
        />

        {/* The Animated Intro Video */}
        <video
          ref={videoRef}
          src="/intro-1.mp4"
          autoPlay
          muted
          playsInline
          onEnded={dismissAnimation}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Subtle bottom skip hint */}
      <div className="absolute bottom-6 flex flex-col items-center gap-2 text-center pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-500 text-[11px] font-semibold tracking-wider uppercase">
          <span>Click anywhere to skip</span>
        </div>
      </div>
    </div>
  );
}
