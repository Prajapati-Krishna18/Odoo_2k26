/**
 * @file    search.service.ts
 * @desc    Extensible global search infrastructure using modular providers.
 *          Pre-registers Department and Employee search capabilities.
 */

import { prisma } from "../../config/prisma.js";

// ── Search Contracts ─────────────────────────────────────────

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: string; // e.g. "DEPARTMENT", "EMPLOYEE", "ASSET"
  meta?: any;
}

export interface SearchProvider {
  name: string;
  search(query: string, limit: number): Promise<SearchResultItem[]>;
}

// ── Department Search Provider ───────────────────────────────

class DepartmentSearchProvider implements SearchProvider {
  name = "departments";

  async search(query: string, limit: number): Promise<SearchResultItem[]> {
    const departments = await prisma.department.findMany({
      where: {
        isDeleted: false,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: { id: true, name: true, code: true, description: true },
    });

    return departments.map((d) => ({
      id: d.id,
      title: d.name,
      subtitle: `Code: ${d.code} | ${d.description || "No description"}`,
      type: "DEPARTMENT",
      meta: { code: d.code },
    }));
  }
}

// ── Employee Search Provider ─────────────────────────────────

class EmployeeSearchProvider implements SearchProvider {
  name = "employees";

  async search(query: string, limit: number): Promise<SearchResultItem[]> {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { employeeCode: { contains: query, mode: "insensitive" } },
          { designation: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: { id: true, fullName: true, email: true, employeeCode: true, designation: true },
    });

    return users.map((u) => ({
      id: u.id,
      title: u.fullName,
      subtitle: `${u.designation || "Employee"} | Email: ${u.email} | Code: ${u.employeeCode || "Pending"}`,
      type: "EMPLOYEE",
      meta: { email: u.email, employeeCode: u.employeeCode },
    }));
  }
}

// ── Global Search Manager ────────────────────────────────────

export class SearchManager {
  private static providers: SearchProvider[] = [];

  static registerProvider(provider: SearchProvider) {
    // Avoid duplicate registration of the same provider type
    if (!this.providers.some((p) => p.name === provider.name)) {
      this.providers.push(provider);
    }
  }

  static async searchAll(query: string, limitPerProvider: number = 5): Promise<Record<string, SearchResultItem[]>> {
    const results: Record<string, SearchResultItem[]> = {};

    await Promise.all(
      this.providers.map(async (provider) => {
        try {
          results[provider.name] = await provider.search(query, limitPerProvider);
        } catch (err) {
          console.error(`❌  Search provider '${provider.name}' encountered an error:`, err);
          results[provider.name] = [];
        }
      })
    );

    return results;
  }
}

// ── Register default search providers ────────────────────────

SearchManager.registerProvider(new DepartmentSearchProvider());
SearchManager.registerProvider(new EmployeeSearchProvider());
