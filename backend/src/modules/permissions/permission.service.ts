/**
 * @file    permission.service.ts
 * @desc    Service layer to manage permissions and dynamically map them to roles.
 */

import { prisma } from "../../config/prisma.js";

export class PermissionService {
  /**
   * Dynamically register a new permission in the database.
   * Succeeds silently if the permission already exists.
   */
  static async registerPermission(name: string): Promise<void> {
    try {
      await prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    } catch (err) {
      console.error(`❌  Failed to dynamically register permission '${name}':`, err);
    }
  }

  /**
   * Assign a permission to a specific role.
   * Resolves IDs automatically from string names.
   */
  static async assignPermissionToRole(roleName: string, permissionName: string): Promise<void> {
    try {
      const [role, permission] = await Promise.all([
        prisma.role.findUnique({ where: { name: roleName } }),
        prisma.permission.findUnique({ where: { name: permissionName } }),
      ]);

      if (!role) {
        console.warn(`⚠️  Cannot assign permission: Role '${roleName}' not found`);
        return;
      }

      if (!permission) {
        console.warn(`⚠️  Cannot assign permission: Permission '${permissionName}' not found. Registering it first.`);
        await this.registerPermission(permissionName);
        return this.assignPermissionToRole(roleName, permissionName);
      }

      // Check if association already exists
      const existing = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    } catch (err) {
      console.error(`❌  Failed to assign permission '${permissionName}' to role '${roleName}':`, err);
    }
  }

  /**
   * Fetch all permissions associated with a role name.
   */
  static async getRolePermissions(roleName: string): Promise<string[]> {
    const list = await prisma.rolePermission.findMany({
      where: {
        role: { name: roleName },
      },
      include: {
        permission: { select: { name: true } },
      },
    });

    return list.map((rp) => rp.permission.name);
  }
}
