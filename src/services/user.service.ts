import type { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { paginationMeta } from "@/lib/validators/common";
import type { PaginationInput } from "@/lib/validators/common";

export async function listUsers(filters: PaginationInput) {
  const { page, limit, search, sortOrder } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: Role;
  branchId?: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      phone: input.phone,
      role: input.role,
      branchId: input.branchId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}

export async function updateUser(
  id: string,
  input: Partial<{
    name: string;
    phone: string;
    role: Role;
    branchId: string | null;
    isActive: boolean;
    password: string;
  }>,
) {
  const { password, ...rest } = input;
  return prisma.user.update({
    where: { id },
    data: {
      ...rest,
      ...(password && { passwordHash: await bcrypt.hash(password, 12) }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}
