/**
 * Regenerates public/indonesia-map.svg — the land layer of the homepage hero
 * map. Run after changing the projection or neighbours in
 * src/lib/indonesia-map-data.ts:
 *
 *   pnpm generate:hero-map
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { renderIndonesiaMapSvg } from "../src/lib/indonesia-map-data";

const svg = renderIndonesiaMapSvg();
const out = path.join(process.cwd(), "public", "indonesia-map.svg");
writeFileSync(out, svg);
console.log(`Wrote ${out} (${Math.round(svg.length / 1024)} KB)`);
