import type { StatusOption } from "@/lib/status-option";

export type PublicTrackingData = {
  trackingNumber: string;
  poNumber: string | null;
  statusId: string;
  status: StatusOption;
  serviceOffering: { name: string } | null;
  senderCity: string;
  recipientCity: string;
  currentLocation: string | null;
  estimatedDelivery: Date | null;
  actualDelivery: Date | null;
  createdAt: Date;
  driver: { name: string } | null;
  vehicle: { plateNumber: string } | null;
  trackingHistory: {
    id: string;
    status: StatusOption;
    location: string;
    description: string | null;
    timestamp: Date;
    branch: { name: string; city: string } | null;
    photos: { id: string; url: string; width: number; height: number }[];
  }[];
};
