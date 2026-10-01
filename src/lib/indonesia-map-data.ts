// Projects Indonesia + neighbours from world-atlas on the server so the
// 50m TopoJSON never ships to the browser; only SVG path strings do.
import {
  geoMercator,
  geoPath,
  type ExtendedFeature,
  type ExtendedFeatureCollection,
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
  indonesia: string;
  neighbours: string[];
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

let cached: IndonesiaMapData | undefined;

/** Projected map paths are static, so they are computed once per process. */
export function getIndonesiaMapData(): IndonesiaMapData {
  cached ??= projectIndonesiaMap();
  return cached;
}

function projectIndonesiaMap(): IndonesiaMapData {
  const topology = countries50m as unknown as Topology;
  const countries = (topology.objects as Record<string, TopoObject>).countries;
  const all = feature(topology, countries) as unknown as ExtendedFeatureCollection;
  const byId = (id: string): ExtendedFeature | undefined =>
    all.features.find((f) => String(f.id) === id);

  const indonesia = byId(INDONESIA)!;
  const projection = geoMercator().fitExtent(
    [
      [20, 20],
      [WIDTH - 20, HEIGHT - 20],
    ],
    indonesia,
  );
  const path = geoPath(projection);
  const project = (lng: number, lat: number) => {
    const [x, y] = projection([lng, lat])!;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  return {
    width: WIDTH,
    height: HEIGHT,
    indonesia: path(indonesia) ?? "",
    neighbours: NEIGHBOURS.map(byId)
      .filter((f): f is ExtendedFeature => Boolean(f))
      .map((f) => path(f) ?? ""),
    hub: { name: "Jakarta", ...project(106.85, -6.2) },
    cities: CITIES.map(({ lng, lat, ...city }) => ({
      ...city,
      ...project(lng, lat),
    })),
  };
}
