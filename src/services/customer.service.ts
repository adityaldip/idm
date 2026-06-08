import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paginationMeta } from "@/lib/validators/common";
import type { PaginationInput } from "@/lib/validators/common";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/lib/validators/customer";
import { logActivity } from "./activity.service";

async function generateCustomerCode() {
  const count = await prisma.customer.count();
  return `CUS-${String(count + 1).padStart(5, "0")}`;
}

export async function listCustomers(filters: PaginationInput) {
  const { page, limit, search, sortOrder } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { company: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
      include: { _count: { select: { shipments: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      shipments: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          trackingNumber: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function createCustomer(
  input: CreateCustomerInput,
  userId: string,
) {
  const code = await generateCustomerCode();
  const customer = await prisma.customer.create({
    data: {
      code,
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      company: input.company,
      address: input.address,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode,
      taxId: input.taxId,
      notes: input.notes,
    },
  });

  await logActivity({
    type: "CUSTOMER_CREATED",
    message: `Customer ${customer.code} (${customer.name}) created`,
    userId,
    entityType: "Customer",
    entityId: customer.id,
  });

  return customer;
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  return prisma.customer.update({
    where: { id },
    data: {
      ...input,
      email: input.email === "" ? null : input.email,
    },
  });
}

export async function deleteCustomer(id: string) {
  const shipmentCount = await prisma.shipment.count({ where: { customerId: id } });
  if (shipmentCount > 0) {
    throw new Error("Cannot delete customer with existing shipments");
  }
  await prisma.customer.delete({ where: { id } });
  return true;
}
