import { TRPCError } from "@trpc/server";
import { type PrismaClient, SystemStatus as PrismaSystemStatus, Prisma } from "@prisma/client";
import { SystemStatus, UserType } from "../constants";
import type { PaginationInput, BaseFilters } from "../types";

interface CampusServiceConfig {
  prisma: PrismaClient;
}

interface CreateCampusInput {
  code: string;
  name: string;
  institutionId: string;
  status?: SystemStatus;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
}

interface UpdateCampusInput {
  name?: string;
  status?: SystemStatus;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

export class CampusService {
  private prisma: PrismaClient;

  constructor(config: CampusServiceConfig) {
    this.prisma = config.prisma;
  }

  /**
   * Create a new campus
   */
  async createCampus(input: CreateCampusInput) {
    // Check if institution exists
    const institution = await this.prisma.institution.findUnique({
      where: { id: input.institutionId },
    });

    if (!institution) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Institution not found",
      });
    }

    // Check for existing campus with same code
    const existing = await this.prisma.campus.findUnique({
      where: { code: input.code },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Campus with this code already exists",
      });
    }

    // Create campus
    const campus = await this.prisma.campus.create({
      data: {
        code: input.code,
        name: input.name,
        institutionId: input.institutionId,
        status: input.status || "ACTIVE",
        address: input.address,
        contact: input.contact,
      },
    });

    return campus;
  }

  /**
   * Get campus by ID with related counts
   */
  async getCampus(id: string) {
    const campus = await this.prisma.campus.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userAccess: true,
            programs: true,
            facilities: true,
            features: true,
          },
        },
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!campus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Campus not found",
      });
    }

    return campus;
  }

  /**
   * Get paginated list of campuses
   */
  async listCampuses(
    pagination: PaginationInput,
    filters?: BaseFilters & { institutionId?: string },
  ) {
    const { page = 1, pageSize = 10, sortBy, sortOrder } = pagination;
    const { search, status, institutionId } = filters || {};

    const where = {
      status: status as PrismaSystemStatus,
      institutionId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          { code: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      this.prisma.campus.count({ where }),
      this.prisma.campus.findMany({
        where,
        include: {
          _count: {
            select: {
              userAccess: true,
              programs: true,
              facilities: true,
            },
          },
          institution: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: sortBy ? { [sortBy]: sortOrder || "asc" } : { createdAt: "desc" },
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize,
    };
  }

  /**
   * Update campus
   */
  async updateCampus(id: string, input: UpdateCampusInput) {
    const campus = await this.prisma.campus.findUnique({
      where: { id },
    });

    if (!campus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Campus not found",
      });
    }

    const updated = await this.prisma.campus.update({
      where: { id },
      data: {
        name: input.name,
        status: input.status,
        address: input.address,
        contact: input.contact,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Delete campus
   */
  async deleteCampus(id: string) {
    const campus = await this.prisma.campus.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userAccess: true,
            programs: true,
            facilities: true,
            features: true,
          },
        },
      },
    });

    if (!campus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Campus not found",
      });
    }

    // Check if campus has any dependencies
    if (
      campus._count.userAccess > 0 ||
      campus._count.programs > 0 ||
      campus._count.facilities > 0 ||
      campus._count.features > 0
    ) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Cannot delete campus with existing dependencies",
      });
    }

    await this.prisma.campus.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Get campus statistics
   */
  async getCampusStats(id: string) {
    const campus = await this.prisma.campus.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userAccess: true,
            programs: true,
            facilities: true,
            features: true,
          },
        },
        userAccess: {
          select: {
            roleType: true,
          },
        },
      },
    });

    if (!campus) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Campus not found",
      });
    }

    // Calculate role type distribution
    const roleTypeDistribution = campus.userAccess.reduce<Record<string, number>>(
      (acc, access) => {
        const roleType = access.roleType.toString();
        acc[roleType] = (acc[roleType] || 0) + 1;
        return acc;
      },
      {},
    );

    return {
      counts: campus._count,
      roleTypeDistribution,
    };
  }
} 