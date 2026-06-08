"use client";

import { useState } from "react";

export type ShipmentDriverOption = {
  id: string;
  code: string;
  name: string;
  vehicleId: string | null;
  vehicle?: { plateNumber: string } | null;
};

export type ShipmentVehicleOption = {
  id: string;
  plateNumber: string;
  type: string;
};

const selectClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm";

interface ShipmentFleetFieldsProps {
  drivers: ShipmentDriverOption[];
  vehicles: ShipmentVehicleOption[];
  defaultDriverId?: string;
  defaultVehicleId?: string;
}

export function ShipmentFleetFields({
  drivers,
  vehicles,
  defaultDriverId = "",
  defaultVehicleId = "",
}: ShipmentFleetFieldsProps) {
  const [driverId, setDriverId] = useState(defaultDriverId);
  const [vehicleId, setVehicleId] = useState(defaultVehicleId);

  function handleDriverChange(nextDriverId: string) {
    setDriverId(nextDriverId);
    const driver = drivers.find((d) => d.id === nextDriverId);
    if (driver?.vehicleId) {
      setVehicleId(driver.vehicleId);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="driverId" className="text-sm font-medium">
          Driver
        </label>
        <select
          id="driverId"
          name="driverId"
          value={driverId}
          onChange={(e) => handleDriverChange(e.target.value)}
          className={selectClass}
        >
          <option value="">— Unassigned —</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.code} — {driver.name}
              {driver.vehicle ? ` (${driver.vehicle.plateNumber})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="vehicleId" className="text-sm font-medium">
          Vehicle
        </label>
        <select
          id="vehicleId"
          name="vehicleId"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className={selectClass}
        >
          <option value="">— Unassigned —</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plateNumber}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
