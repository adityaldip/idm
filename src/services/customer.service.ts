import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paginationMeta } from "@/lib/validators/common";
import type { PaginationInput } from "@/lib/validators/common";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/lib/validators/customer";
import { logActivity } from "./activity.service";

// Based on the highest existing number, not count(): count() repeats codes
// once any customer has been deleted.
async function generateCustomerCode() {
  const [row] = await prisma.$queryRaw<{ max: number | null }[]>`
    SELECT MAX(CAST(SUBSTRING(code FROM 5) AS INTEGER)) AS max
    FROM customers
    WHERE code ~ '^CUS-[0-9]+$'
  `;
  const next = (row?.max ?? 0) + 1;
  return `CUS-${String(next).padStart(5, "0")}`;
}

function isUniqueCodeError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
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
  // Retry in case two customers are created at the same time and get the same code.
  let customer;
  for (let attempt = 1; ; attempt++) {
    const code = await generateCustomerCode();
    try {
      customer = await prisma.customer.create({
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
      break;
    } catch (error) {
      if (!isUniqueCodeError(error) || attempt >= 5) throw error;
    }
  }

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
