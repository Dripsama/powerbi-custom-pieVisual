"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IColorPalette = powerbi.extensibility.IColorPalette;
import * as d3 from "d3";

import { VisualFormattingSettingsModel } from "./settings";
import { PieChartDataPoints, PieChartDataView } from "./interface";
//import { pieSample } from "./resources/sampleData";
import { Selection } from "./type";

export class PieChartVisual implements IVisual {
  private host: IVisualHost;
  private root: HTMLElement;
  private svg: Selection<SVGElement>;
  private container: Selection<SVGElement>;

  constructor(options: VisualConstructorOptions) {
    this.host = options.host;
    this.root = options.element;
    this.svg = d3.select(this.root).append("svg").classed("pieChart", true);
    this.container = this.svg.append("g").classed("pieContainer", true);
  }

  public visualTransform(
    options: VisualUpdateOptions,
    host: IVisualHost
  ): PieChartDataView {
    let dataViews = options.dataViews;
    let viewModel: PieChartDataView = {
      dataPoints: [],
    };

    if (
      !dataViews ||
      !dataViews[0] ||
      !dataViews[0].categorical ||
      !dataViews[0].categorical.categories ||
      !dataViews[0].categorical.categories[0].source ||
      !dataViews[0].categorical.values
    )
      return viewModel;

    let categorical = dataViews[0].categorical;
    let category = categorical.categories[0];
    let dataValue = categorical.values[0];

    let barChartDataPoints: PieChartDataPoints[] = [];
    let colorPalette: IColorPalette = host.colorPalette;

    for (
      let i = 0,
        len = Math.max(category.values.length, dataValue.values.length);
      i < len;
      i++
    ) {
      barChartDataPoints.push({
        category: <string>category.values[i],
        value: <number>dataValue.values[i],
        color: colorPalette.getColor(<string>category.values[i]).value,
      });
      console.log(colorPalette.getColor(<string>category.values[i]).value);
    }

    return {
      dataPoints: barChartDataPoints,
    };
  }

  public update(options: VisualUpdateOptions) {
    let width: number = options.viewport.width;
    let height: number = options.viewport.height;

    let dataview: PieChartDataView = this.visualTransform(options, this.host);
    const data: PieChartDataPoints[] = dataview.dataPoints;

    // clear previous chart
    this.container.selectAll("*").remove();

    this.svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // pie
    const pie: any = d3
      .pie<any>()
      .sort(null)
      .value((d: any) => d.value)(data);

    const arc = d3
      .arc<any>()
      .innerRadius(0)
      .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = arc.outerRadius()((d: any) => d) * 0.8;

    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

    this.container
      .attr("stroke", "white")
      .selectAll()
      .data(pie)
      .join("path")
      .attr("fill", (d: any) => d.data.color)
      .attr("d", arc)
      .append("title")
      .text(
        (d: any) =>
          `${d.data.category}: ${d.data.value.toLocaleString("en-US")}`
      );

    this.container
      .attr("text-anchor", "middle")
      .selectAll()
      .data(pie)
      .join("text")
      .attr("transform", (d: any) => `translate(${arcLabel.centroid(d)})`)
      .attr("stroke", "black")
      .call((text) =>
        text
          .append("tspan")
          .attr("y", "-0.4em")
          .text((d: any) => d.data.category)
      )
      .call((text) =>
        text
          .filter((d: any) => d.endAngle - d.startAngle > 0.25)
          .append("tspan")
          .attr("x", 0)
          .attr("y", "0.7em")
          .attr("fill-opacity", 0.7)
          .text((d: any) => d.data.value.toLocaleString("en-US"))
      );
  }
}
