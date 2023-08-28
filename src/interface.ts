import ISelectionId = powerbi.extensibility.ISelectionId;

/**
 * Interface for piechart datapoints
 */
export interface PieChartDataPoints {
  category: string;
  value: number;
  color: string;
  selectionId: ISelectionId;
}

/**
 * Interface for piechart dataview
 */
export interface PieChartDataView {
  dataPoints: PieChartDataPoints[];
}
