/**
 * Interface for piechart datapoints
 */
export interface PieChartDataPoints {
  category: string;
  value: number;
  color: string;
}

/**
 * Interface for piechart dataview
 */
export interface PieChartDataView {
  dataPoints: PieChartDataPoints[];
}
