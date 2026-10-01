// Projects Indonesia + neighbours from world-atlas. The land shapes are baked
// into a static, browser-cacheable file (public/indonesia-map.svg, written by
// scripts/generate-hero-map.ts); the page only receives the small city layer.
// Both use the same projection below, so routes line up with the land.
import {
  geoMercator,
  geoPath,
  type ExtendedFeature,
  type ExtendedFeatureCollection,
  type GeoProjection,
} from "d3-geo";
import { feature } from "topojson-client";
import countries50m from "world-atlas/countries-50m.json";

type Topology = Parameters<typeof feature>[0];
type TopoObject = Parameters<typeof feature>[1];

export type RouteMode = "truck" | "ship" | "plane";

export interface MapCity {
  id: string;
  name: string;
  x: number;
  y: number;
  mode: RouteMode;
}

export interface IndonesiaMapData {
  width: number;
  height: number;
  /** URL of the pre-rendered land layer, in the same coordinate space. */
  landUrl: string;
  hub: { name: string; x: number; y: number };
  cities: MapCity[];
}

const INDONESIA = "360";
const NEIGHBOURS = ["458", "598", "626", "096", "608", "702"];

const CITIES: { id: string; name: string; lng: number; lat: number; mode: RouteMode }[] = [
  { id: "medan", name: "Medan", lng: 98.67, lat: 3.59, mode: "plane" },
  { id: "pontianak", name: "Pontianak", lng: 109.33, lat: -0.03, mode: "ship" },
  { id: "surabaya", name: "Surabaya", lng: 112.75, lat: -7.25, mode: "truck" },
  { id: "denpasar", name: "Denpasar", lng: 115.22, lat: -8.65, mode: "truck" },
  { id: "balikpapan", name: "Balikpapan", lng: 116.83, lat: -1.27, mode: "ship" },
  { id: "makassar", name: "Makassar", lng: 119.43, lat: -5.14, mode: "ship" },
  { id: "manado", name: "Manado", lng: 124.84, lat: 1.47, mode: "plane" },
  { id: "jayapura", name: "Jayapura", lng: 140.72, lat: -2.53, mode: "plane" },
];

const WIDTH = 1000;
const HEIGHT = 440;
export const INDONESIA_MAP_URL = "/indonesia-map.svg";

function projectIndonesia(): {
  projection: GeoProjection;
  indonesia: ExtendedFeature;
  neighbours: ExtendedFeature[];
} {
  const topology = countries50m as unknown as Topology;
  const countries = (topology.objects as Record<string, TopoObject>).countries;
  const all = feature(topology, countries) as unknown as ExtendedFeatureCollection;
  const byId = (id: string) => all.features.find((f) => String(f.id) === id);

  const indonesia = byId(INDONESIA)!;
  const projection = geoMercator().fitExtent(
    [
      [20, 20],
      [WIDTH - 20, HEIGHT - 20],
    ],
    indonesia,
  );
  const neighbours = NEIGHBOURS.map(byId).filter(
    (f): f is ExtendedFeature => Boolean(f),
  );
  return { projection, indonesia, neighbours };
}

let cached: IndonesiaMapData | undefined;

/** City/hub positions for the hero; computed once per process. */
export function getIndonesiaMapData(): IndonesiaMapData {
  if (cached) return cached;
  const { projection } = projectIndonesia();
  const project = (lng: number, lat: number) => {
    const [x, y] = projection([lng, lat])!;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };
  cached = {
    width: WIDTH,
    height: HEIGHT,
    landUrl: INDONESIA_MAP_URL,
    hub: { name: "Jakarta", ...project(106.85, -6.2) },
    cities: CITIES.map(({ lng, lat, ...city }) => ({
      ...city,
      ...project(lng, lat),
    })),
  };
  return cached;
}

// Islands smaller than this (in pxÂ² of the 1000Ã—440 canvas) are sub-pixel
// specks at hero size â€” dropping them roughly halves the file.
const MIN_ISLAND_AREA = 4;

/** Splits a (Multi)Polygon into its islands and keeps the visible ones. */
function withoutSpecks(
  f: ExtendedFeature,
  path: ReturnType<typeof geoPath>,
): ExtendedFeature {
  const geometry = f.geometry;
  if (!geometry || geometry.type !== "MultiPolygon") return f;
  const kept = geometry.coordinates.filter(
    (polygon) =>
      path.area({ type: "Polygon", coordinates: polygon }) >= MIN_ISLAND_AREA,
  );
  return { ...f, geometry: { type: "MultiPolygon", coordinates: kept } };
}

/** The static land layer, written to public/ by scripts/generate-hero-map.ts. */
export function renderIndonesiaMapSvg(): string {
  const { projection, indonesia, neighbours } = projectIndonesia();
  // Whole units are ~0.8px at hero size, invisible for these shapes.
  const path = geoPath(projection).digits(0);
  const land = path(withoutSpecks(indonesia, path)) ?? "";
  const others = neighbours
    .map((f) => path(withoutSpecks(f, path)) ?? "")
    .map((d) => `<path d="${d}"/>`)
    .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    `<defs><linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a8cc4"/><stop offset="1" stop-color="#2a5a8f"/></linearGradient>`,
    `<path id="idn" d="${land}"/></defs>`,
    `<g fill="#5a708c" fill-opacity=".35">${others}</g>`,
    // A darker copy offset downward reads as thickness (2.5D extrusion).
    `<use href="#idn" xlink:href="#idn" fill="#0f2340" transform="translate(0 9)"/>`,
    `<use href="#idn" xlink:href="#idn" fill="#1b3a5f" transform="translate(0 5)"/>`,
    `<use href="#idn" xlink:href="#idn" fill="url(#land)" stroke="#b0d7f0" stroke-opacity=".7" stroke-width=".8"/>`,
    `</svg>`,
  ].join("");
}
