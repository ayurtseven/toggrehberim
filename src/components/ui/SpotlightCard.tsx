"use client";
import { useRef, MouseEvent, ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  style?: CSSProperties;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(255,255,255,0.06)",
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--sx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--sy", `${e.clientY - rect.top}px`);
    card.style.setProperty("--so", "1");
  }

  function onLeave() {
    ref.current?.style.setProperty("--so", "0");
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative overflow-hidden ${className}`}
      style={
        {
          "--sx": "50%",
          "--sy": "50%",
          "--so": "0",
          "--sc": spotlightColor,
          ...style,
        } as CSSProperties
      }
    >
      {/* Spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(300px circle at var(--sx) var(--sy), var(--sc), transparent 70%)",
          opacity: "var(--so)",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
