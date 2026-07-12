/**
 * @file    integration.service.ts
 * @desc    Integration Service layer allowing modules (Assets, Bookings, etc.)
 *          to register stats, search, and reports providers dynamically.
 */

// ── Statistics Integration ───────────────────────────────────

export interface StatsProvider {
  name: string; // e.g. "assets", "bookings"
  getStats(): Promise<Record<string, any>>;
}

class StatsIntegrationRegistry {
  private providers: StatsProvider[] = [];

  register(provider: StatsProvider) {
    if (!this.providers.some((p) => p.name === provider.name)) {
      this.providers.push(provider);
    }
  }

  async compileAll(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    await Promise.all(
      this.providers.map(async (provider) => {
        try {
          results[provider.name] = await provider.getStats();
        } catch (err) {
          console.error(`❌  StatsProvider '${provider.name}' failed to run:`, err);
          results[provider.name] = {};
        }
      })
    );
    return results;
  }
}

// ── Reports Integration ───────────────────────────────────────

export interface ReportProvider {
  name: string; // e.g. "assets-by-status", "maintenance-costs"
  title: string;
  description: string;
  generate(filters: Record<string, any>): Promise<{
    summary: Record<string, any>;
    charts: Record<string, any>;
    tables: {
      headers: string[];
      rows: Record<string, any>[];
    };
  }>;
}

class ReportIntegrationRegistry {
  private providers: ReportProvider[] = [];

  register(provider: ReportProvider) {
    if (!this.providers.some((p) => p.name === provider.name)) {
      this.providers.push(provider);
    }
  }

  getProviders() {
    return this.providers;
  }

  getProvider(name: string): ReportProvider | undefined {
    return this.providers.find((p) => p.name === name);
  }
}

// ── Export Shared Registries ──────────────────────────────────

export const StatsRegistry = new StatsIntegrationRegistry();
export const ReportRegistry = new ReportIntegrationRegistry();
export { SearchManager as SearchRegistry } from "../search/search.service.js";
