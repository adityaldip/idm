import type { ShipmentStatus } from "@prisma/client";

export type PublicTrackingData = {
  trackingNumber: string;
  status: ShipmentStatus;
  serviceOffering: { name: string } | null;
  senderCity: string;
  recipientCity: string;
  currentLocation: string | null;
  estimatedDelivery: Date | null;
  actualDelivery: Date | null;
  createdAt: Date;
  trackingHistory: {
    id: string;
    status: ShipmentStatus;
    location: string;
    description: string | null;
    timestamp: Date;
    branch: { name: string; city: string } | null;
  }[];
};
