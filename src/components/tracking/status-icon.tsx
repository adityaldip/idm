import {
  Anchor,
  Building2,
  CircleCheckBig,
  Container,
  CircleDot,
  ClipboardList,
  MapPinned,
  PackageCheck,
  Plane,
  Ship,
  Truck,
  Undo2,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

// Status codes are admin-configurable; known codes get a matching icon and
// anything new falls back to a neutral dot.
const STATUS_ICONS: Record<string, LucideIcon> = {
  CREATED: ClipboardList,
  PICKED_UP: PackageCheck,
  IN_WAREHOUSE: Warehouse,
  IN_TRANSIT: Truck,
  OUT_FOR_DELIVERY: MapPinned,
  DELIVERED: CircleCheckBig,
  RETURNED: Undo2,
  // Common sea-freight statuses admins add in settings.
  LOKASI_MUAT: Container,
  PELABUHAN_AWAL: Anchor,
  SAMPAI_DI_PELABUHAN_TUJUAN: Ship,
  MENUJU_KOTA: Building2,
};

// Vehicle drawn on the route line, keyed by the service offering's icon.
const VEHICLE_ICONS: Record<string, LucideIcon> = {
  Plane,
  Ship,
};

export function StatusIcon({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const Icon = STATUS_ICONS[code] ?? CircleDot;
  return <Icon className={className} />;
}

export function VehicleIcon({
  icon,
  className,
}: {
  icon: string | null | undefined;
  className?: string;
}) {
  const Icon = (icon && VEHICLE_ICONS[icon]) || Truck;
  return <Icon className={className} />;
}
