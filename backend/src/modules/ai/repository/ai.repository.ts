import { prisma } from "../../../config/prisma.js";

export class AIRepository {

  static async getDepartmentContext(deptName: string) {
    if (!deptName) return null;

    const department = await prisma.department.findFirst({
      where: {
        name: { contains: deptName, mode: "insensitive" },
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        departmentHead: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { employees: true, assets: true },
        },
      },
    });

    return department;
  }

  static async getEmployeeContext(fullName: string) {
    if (!fullName) return null;

    const employee = await prisma.user.findFirst({
      where: {
        fullName: { contains: fullName, mode: "insensitive" },
        isActive: true,
      },
      select: {
        fullName: true,
        email: true,
        phone: true,
        employeeCode: true,
        designation: true,
        isActive: true,
        joiningDate: true,
        department: {
          select: {
            name: true,
            code: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return employee;
  }

  static async getSystemOverview() {
    const [
      totalDepts,
      totalEmployees,
      activeEmployees,
      totalAssets,
      allocatedAssets,
      availableAssets,
      overdueAllocations,
      settings,
    ] = await Promise.all([
      prisma.department.count({ where: { isDeleted: false } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.asset.count({ where: { isDeleted: false } }),
      prisma.asset.count({ where: { status: "ALLOCATED", isDeleted: false } }),
      prisma.asset.count({ where: { status: "AVAILABLE", isDeleted: false } }),
      prisma.assetAllocation.count({
        where: {
          status: "ACTIVE",
          expectedReturnAt: { lt: new Date() },
        },
      }),
      prisma.systemSetting.findFirst(),
    ]);

    return {
      companyName: settings?.companyName || "AssetFlow",
      totalDepartments: totalDepts,
      totalEmployees,
      activeEmployees,
      totalAssets,
      allocatedAssets,
      availableAssets,
      overdueAllocations,
      timezone: settings?.timezone || "Asia/Kolkata",
      currency: settings?.currency || "INR",
    };
  }

  static async getAssetByCode(assetCode: string, assetName?: string) {
    if (!assetCode && !assetName) return null;

    const whereClause: any = { isDeleted: false };
    if (assetCode) {
      whereClause.code = assetCode;
    } else if (assetName) {
      whereClause.name = { contains: assetName, mode: "insensitive" };
    }

    const asset = await prisma.asset.findFirst({
      where: whereClause,
      select: {
        id: true,
        code: true,
        name: true,
        serialNumber: true,
        status: true,
        location: true,
        condition: true,
        acquisitionDate: true,
        category: { select: { name: true } },
        department: { select: { name: true } },
        allocations: {
          where: { status: "ACTIVE" },
          select: {
            employee: { select: { fullName: true, employeeCode: true } },
            allocatedAt: true,
            expectedReturnAt: true,
          },
          take: 1,
        },
      },
    });

    return asset;
  }

  static async getAvailableAssets() {
    const assets = await prisma.asset.findMany({
      where: { status: "AVAILABLE", isDeleted: false },
      select: {
        code: true,
        name: true,
        serialNumber: true,
        location: true,
        category: { select: { name: true } },
        department: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    return assets;
  }

  static async getOverdueAssets() {
    const overdueAllocations = await prisma.assetAllocation.findMany({
      where: {
        status: "ACTIVE",
        expectedReturnAt: { lt: new Date() },
      },
      select: {
        id: true,
        allocatedAt: true,
        expectedReturnAt: true,
        asset: {
          select: {
            code: true,
            name: true,
            serialNumber: true,
          },
        },
        employee: {
          select: { fullName: true, employeeCode: true, email: true },
        },
      },
      orderBy: { expectedReturnAt: "asc" },
    });

    return overdueAllocations.map((a) => ({
      assetCode: a.asset.code,
      assetName: a.asset.name,
      employeeName: a.employee.fullName,
      employeeEmail: a.employee.email,
      allocatedAt: a.allocatedAt,
      expectedReturnAt: a.expectedReturnAt,
      overdueDays: Math.floor(
        (Date.now() - new Date(a.expectedReturnAt!).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  }

  static async getEmployeeAssets(employeeName: string) {
    if (!employeeName) return null;

    const user = await prisma.user.findFirst({
      where: {
        fullName: { contains: employeeName, mode: "insensitive" },
        isActive: true,
      },
      select: {
        fullName: true,
        employeeCode: true,
        department: { select: { name: true } },
        assetAllocations: {
          where: { status: "ACTIVE" },
          select: {
            allocatedAt: true,
            expectedReturnAt: true,
            asset: {
              select: {
                code: true,
                name: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return user;
  }

  static async getAssetLocation(assetCode?: string, assetName?: string) {
    if (!assetCode && !assetName) return null;

    const whereClause: any = { isDeleted: false };
    if (assetCode) {
      whereClause.code = assetCode;
    } else if (assetName) {
      whereClause.name = { contains: assetName, mode: "insensitive" };
    }

    const asset = await prisma.asset.findFirst({
      where: whereClause,
      select: {
        code: true,
        name: true,
        location: true,
        status: true,
        department: { select: { name: true } },
        allocations: {
          where: { status: "ACTIVE" },
          select: {
            employee: { select: { fullName: true } },
          },
          take: 1,
        },
      },
    });

    return asset;
  }
}
