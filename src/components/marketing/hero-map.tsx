"use client";

import { Plane, Ship, Truck } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { IndonesiaMapData, RouteMode } from "@/lib/indonesia-map-data";

const MODE_ICON: Record<RouteMode, typeof Plane> = {
  plane: Plane,
  ship: Ship,
  truck: Truck,
};

// Quadratic arc from the hub that bows upward (north) on the map.
function routePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  return `M${from.x},${from.y} Q${mx},${my - dist * 0.35} ${to.x},${to.y}`;
}

/** Tilted 2.5D Indonesia map with animated routes out of the Jakarta hub. */
export function HeroMap({ map }: { map: IndonesiaMapData }) {
  const reduceMotion = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [44, 34]), {
    stiffness: 80,
    damping: 20,
  });
  const rotateZ = useSpring(useTransform(px, [-0.5, 0.5], [-3, -9]), {
    stiffness: 80,
    damping: 20,
  });

  const { width, height, hub } = map;

  return (
    <div
      aria-hidden
      className="relative flex aspect-[5/4] w-full items-center justify-center"
      style={{ perspective: 1400 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <motion.div
        className="w-[118%] shrink-0 translate-x-[6%]"
        style={{
          rotateX: reduceMotion ? 40 : rotateX,
          rotateZ: reduceMotion ? -6 : rotateZ,
          transformStyle: "preserve-3d",
        }}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            <pattern id="hero-map-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.1" fill="oklch(1 0 0 / 10%)" />
            </pattern>
            <filter id="hero-map-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Sea plate */}
          <rect
            x={-60}
            y={-40}
            width={width + 120}
            height={height + 80}
            rx={28}
            fill="oklch(0.3 0.07 250 / 55%)"
            stroke="oklch(1 0 0 / 12%)"
          />
          <rect x={-60} y={-40} width={width + 120} height={height + 80} rx={28} fill="url(#hero-map-dots)" />

          {/* Land (with neighbours and the extrusion) is a static, cached file
              in the same coordinate space — see src/lib/indonesia-map-data.ts. */}
          <image href={map.landUrl} x={0} y={0} width={width} height={height} />

          {map.cities.map((city, i) => {
            const d = routePath(hub, city);
            const Icon = MODE_ICON[city.mode];
            const dur = 3.2 + (i % 3) * 0.9;
            return (
              <g key={city.id}>
                <path d={d} fill="none" stroke="oklch(0.78 0.14 75 / 35%)" strokeWidth={5} filter="url(#hero-map-glow)" />
                <path
                  d={d}
                  fill="none"
                  stroke="oklch(0.8 0.14 75)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray="6 8"
                >
                  {!reduceMotion && (
                    <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.2s" repeatCount="indefinite" />
                  )}
                </path>

                {/* City pin */}
                <circle cx={city.x} cy={city.y} r={5} fill="white" />
                {!reduceMotion && (
                  <circle cx={city.x} cy={city.y} r={5} fill="none" stroke="white" strokeWidth={1.5}>
                    <animate attributeName="r" from="5" to="16" dur="2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="2s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
                  </circle>
                )}
                <text
                  x={city.x}
                  y={city.y + 22}
                  textAnchor="middle"
                  className="fill-white text-[15px] font-semibold"
                  style={{ paintOrder: "stroke", stroke: "oklch(0.25 0.06 255)", strokeWidth: 4 }}
                >
                  {city.name}
                </text>

                {/* Vehicle travelling the route */}
                <g>
                  {!reduceMotion && (
                    <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} begin={`${i * 0.4}s`} />
                  )}
                  <circle r={14} fill="oklch(0.27 0.07 255)" stroke="oklch(0.8 0.14 75)" strokeWidth={2} />
                  <Icon x={-8} y={-8} width={16} height={16} color="oklch(0.85 0.14 75)" strokeWidth={2.25} />
                </g>
              </g>
            );
          })}

          {/* Jakarta hub */}
          <circle cx={hub.x} cy={hub.y} r={20} fill="oklch(0.8 0.14 75 / 25%)">
            {!reduceMotion && (
              <animate attributeName="r" values="14;24;14" dur="2.4s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx={hub.x} cy={hub.y} r={9} fill="oklch(0.8 0.14 75)" stroke="white" strokeWidth={2.5} />
          <text
            x={hub.x}
            y={hub.y + 32}
            textAnchor="middle"
            className="fill-[oklch(0.85_0.14_75)] text-[17px] font-bold"
            style={{ paintOrder: "stroke", stroke: "oklch(0.25 0.06 255)", strokeWidth: 4 }}
          >
            {hub.name}
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
