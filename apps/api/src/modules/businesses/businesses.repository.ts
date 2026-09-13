import { prisma } from "../../config/database";
import type { Prisma } from "@prisma/client";

export interface BusinessFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

function buildWhere(filters: BusinessFilters): Prisma.BusinessWhereInput {
  const where: Prisma.BusinessWhereInput = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.services = {
      some: {
        active: true,
        price: {
          gte: filters.minPrice,
          lte: filters.maxPrice,
        },
      },
    };
  }

  return where;
}

export const businessesRepository = {
  create(data: {
    ownerId: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    category?: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
  }) {
    return prisma.business.create({ data, include: { reviews: { select: { rating: true } } } });
  },

  // Rating isn't stored (avoids duplicating what `reviews` already holds), so callers
  // needing a minimum-rating filter must compute it from `reviews` after this returns.
  findManyFiltered(filters: BusinessFilters) {
    return prisma.business.findMany({
      where: buildWhere(filters),
      include: { reviews: { select: { rating: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.business.findUnique({ where: { id }, include: { reviews: { select: { rating: true } } } });
  },

  update(
    id: string,
    data: {
      name?: string;
      description?: string;
      address?: string;
      phone?: string;
      category?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return prisma.business.update({ where: { id }, data, include: { reviews: { select: { rating: true } } } });
  },

  delete(id: string) {
    return prisma.business.delete({ where: { id } });
  },
};
