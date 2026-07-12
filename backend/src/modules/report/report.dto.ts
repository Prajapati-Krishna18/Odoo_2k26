/**
 * @file    report.dto.ts
 * @desc    Data Transfer Objects for Reports.
 *          Implements standard report structures for summaries, charts, and tables.
 */

export interface ReportSummaryDTO {
  totalDepartments: number;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentWiseEmployees: Record<string, number>;
  roleDistribution: Record<string, number>;

  // Hooks for future modules:
  assets?: Record<string, any>;
  bookings?: Record<string, any>;
  maintenance?: Record<string, any>;
}

export interface ChartDataSeries {
  label: string;
  data: number[];
}

export interface ReportChartDTO {
  labels: string[];
  datasets: ChartDataSeries[];
}

export interface ReportTableDTO {
  headers: string[];
  rows: Record<string, any>[];
}

export interface ReportResponseDTO {
  summary: Record<string, any>;
  charts: Record<string, ReportChartDTO>;
  tables: Record<string, ReportTableDTO>;
  metadata: {
    generatedAt: string;
    generatedBy: string;
    filters: Record<string, any>;
  };
}
