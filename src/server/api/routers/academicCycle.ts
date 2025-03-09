// Update the list endpoint to return all academic cycles
list: protectedProcedure
  .input(
    z.object({
      institutionId: z.string().optional(),
      campusId: z.string().optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
      sortBy: z.string().optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    }).optional()
  )
  .query(async ({ ctx, input = {} }) => {
    const { 
      institutionId, 
      campusId, 
      search, 
      status, 
      page = 1, 
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = input;

    // Get the user's institution if not specified
    const queryInstitutionId = institutionId || ctx.user?.institutionId;

    if (!queryInstitutionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Institution ID is required",
      });
    }

    // Build the where clause
    const where: Prisma.AcademicCycleWhereInput = {
      institutionId: queryInstitutionId,
    };

    // Add optional filters
    if (campusId) {
      where.campuses = {
        some: {
          campusId,
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status as SystemStatus;
    }

    // Get total count for pagination
    const total = await ctx.prisma.academicCycle.count({ where });

    // Get the academic cycles
    const academicCycles = await ctx.prisma.academicCycle.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        campuses: {
          include: {
            campus: true,
          },
        },
        terms: true,
      },
    });

    return {
      items: academicCycles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }), 