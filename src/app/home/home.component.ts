import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

import * as d3 from 'd3';
import { ChartBorder } from '../shared/model/chart-border.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild("chart") chart: ElementRef;
  element: HTMLElement;
  margin: ChartBorder;
  contentHeight: number = 0;
  contentWidth: number = 0;
  g: any;
  x: any;
  y: any;
  xAxisGroup: any;
  yAxisGroup: any;
  flag: boolean = true;
  t: any;

  constructor() { }

  ngOnInit() {
    this.generateBarChart();
  }

  generateBarChart() {
    d3.select('svg').remove();

    this.element = this.chart.nativeElement;

    this.margin = { left: 50, top: 20, right: 30, bottom: 40 };
    this.contentHeight = this.element.offsetHeight - this.margin.top - this.margin.bottom;
    this.contentWidth = this.element.offsetWidth - this.margin.left - this.margin.right;
    this.t = d3.transition().delay(750);
    this.x = d3.scaleBand()
      .range([0, this.contentWidth])
      .padding(0.2);

    this.y = d3.scaleLinear()
      .range([this.contentHeight, 0]);

    this.g = d3.select(this.element)
      .append('svg')
      .attr('height', this.contentHeight + this.margin.top + this.margin.bottom)
      .attr('width', this.contentWidth + this.margin.left + this.margin.right)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ', ' + this.margin.top + ')');

    this.xAxisGroup = this.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + this.contentHeight + ')');

    this.yAxisGroup = this.g.append('g')
      .attr('class', 'y axis');

    d3.json('assets/data/revenues.json')
      .then((data: any[]) => {
        data.map(d => {
          d["revenue"] = +d["revenue"];
          d["profit"] = +d["profit"];
        });

        d3.interval(() => {
          this.flag = !this.flag;
          this.update(data);
        }, 1000);

        this.update(data);
      })
      .catch(err => console.log(err));
  }

  update(data) {

    const value = this.flag ? "revenue" : "profit";

    this.x.domain(data.map(d => d["month"]));
    this.y.domain([0, d3.max(data, d => +d[value])]);

    const xAxisCall = d3.axisBottom(this.x);
    this.xAxisGroup.transition(this.t).call(xAxisCall);

    const yAxisCall = d3.axisLeft(this.y).tickFormat(d => "$" + d);
    this.yAxisGroup.transition(this.t).call(yAxisCall);

    const rects = this.g.selectAll('rect').data(data);

    rects.exit()
      .attr('fill', 'red')
      .transition(this.t)
      .attr('y', this.y(0))
      .attr('height', 0)
      .remove();

    rects.enter()
      .append('rect')
      .attr('y', this.y(0))
      .attr('x', d => this.x(d["month"]))
      .attr('height', 0)
      .attr('width', this.x.bandwidth)
      .attr('fill', 'grey')
      .merge(rects)
      .transition(this.t)
      .attr('y', d => this.y(d[value]))
      .attr('x', d => this.x(d["month"]))
      .attr('height', d => this.contentHeight - this.y(d[value]))
      .attr('width', this.x.bandwidth);
  }

}
