import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paginationMeta } from "@/lib/validators/common";
import type { PaginationInput } from "@/lib/validators/common";
import type {
  CreateBranchInput,
  UpdateBranchInput,
} from "@/lib/validators/branch";

export async function listBranches(filters: PaginationInput) {
  const { page, limit, search, sortOrder } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.BranchWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.branch.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: sortOrder },
      include: { _count: { select: { users: true, vehicles: true } } },
    }),
    prisma.branch.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function getBranchById(id: string) {
  return prisma.branch.findUnique({
    where: { id },
    include: { _count: { select: { users: true, vehicles: true } } },
  });
}

export async function createBranch(input: CreateBranchInput) {
  if (input.isHeadquarters) {
    await prisma.branch.updateMany({
      where: { isHeadquarters: true },
      data: { isHeadquarters: false },
    });
  }

  return prisma.branch.create({
    data: {
      ...input,
      email: input.email || null,
    },
  });
}

export async function updateBranch(id: string, input: UpdateBranchInput) {
  if (input.isHeadquarters) {
    await prisma.branch.updateMany({
      where: { isHeadquarters: true, NOT: { id } },
      data: { isHeadquarters: false },
    });
  }

  return prisma.branch.update({
    where: { id },
    data: {
      ...input,
      email: input.email === "" ? null : input.email,
    },
  });
}

export async function deleteBranch(id: string) {
  const [users, shipments] = await Promise.all([
    prisma.user.count({ where: { branchId: id } }),
    prisma.shipment.count({
      where: {
        OR: [{ originBranchId: id }, { destinationBranchId: id }],
      },
    }),
  ]);

  if (users > 0 || shipments > 0) {
    throw new Error("Cannot delete branch with linked users or shipments");
  }

  await prisma.branch.delete({ where: { id } });
  return true;
}
