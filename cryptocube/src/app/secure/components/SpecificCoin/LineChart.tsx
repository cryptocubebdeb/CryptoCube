/*
This code is adapted from the D3 example:
  "Line Chart with Tooltip" — https://observablehq.com/@d3/line-with-tooltip

  For more information and related tutorials:
  - React Graph Gallery Line Chart: https://www.react-graph-gallery.com/line-chart
*/
"use client";
import { use, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { da, de } from "zod/v4/locales";

type DataPoint = { x: number; y: number };

type LineChartProps = {
    width: number;
    height: number;
    data: DataPoint[];
};

export default function LineChart({ width, height, data }: LineChartProps) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!data?.length) return;

        const formattedData = data.map(p => ({ Date: new Date(p.x), Close: p.y }));
        ref.current!.innerHTML = ""; //Clear previous chart if any

        const svg = createLineChart(formattedData, { width, height, yLabel: "Price (CAD)", yFormat: "$,.2f" });
        ref.current!.appendChild(svg as unknown as Node); //Show that its a Node to avoid TS error
    }, [data, width, height]);

    return <div ref={ref} />;
}

function createLineChart(data: any[], {
    x = (d: { Date: Date; Close: number }) => d.Date, // given d in data, returns the (temporal) x-value
    y = (d: { Date: Date; Close: number }) => d.Close, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xType = d3.scaleUtc, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    color = "currentColor", // stroke color of line
    strokeWidth = 1.5, // stroke width of line, in pixels
    strokeLinejoin = "round", // stroke line join of line
    strokeLinecap = "round", // stroke line cap of line
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
}: {
    x?: (...args: any[]) => any;
    y?: (...args: any[]) => any;
    title?: any;
    defined?: any;
    curve?: any;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    width?: number;
    height?: number;
    xType?: any;
    xDomain?: any;
    xRange?: [number, number];
    yType?: any;
    yDomain?: any;
    yRange?: [number, number];
    color?: string;
    strokeWidth?: number;
    strokeLinejoin?: string;
    strokeLinecap?: string;
    yFormat?: any;
    yLabel?: string;
} = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const O = d3.map(data, d => d);
    const I = d3.map(data, (_, i) => i);

    // Compute which data points are considered defined.
    if (defined === undefined) defined = (_: { Date: Date; Close: number }, i: number) =>
        !isNaN(X[i]) && !isNaN(Y[i]);
    const D = d3.map(data, defined);

    // Compute default domains.
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

    // Compute titles.
    if (title === undefined) {
        const formatDate = xScale.tickFormat(null, "%b %-d, %Y");
        const formatValue = yScale.tickFormat(100, yFormat);
        title = (i: number) => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
    } else {
        const O = d3.map(data, d => d);
        const T = title;
        title = (i: number) => T(O[i], i, data);
    }

    // Construct a line generator.
    const line = d3.line<{ Date: Date; Close: number }>()
        .defined(d => !isNaN(d.Close))
        .curve(curve)
        .x(d => xScale(d.Date))
        .y(d => yScale(d.Close));


    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .style("-webkit-tap-highlight-color", "transparent")
        .style("overflow", "visible")
        .on("pointerenter pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());

    svg
        .style("background", "#0c111d")   // dark navy background
        .attr("stroke", "#e4af04")        // yellow line accent
        .attr("color", "#cfd8dc");        // light gray text for axes

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel ?? ""));

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-linecap", strokeLinecap)
        .attr("d", line(data)!);

    const tooltip = svg.append("g")
        .style("pointer-events", "none");

    function pointermoved(event: PointerEvent) {
        const i = d3.bisectCenter(X, xScale.invert(d3.pointer(event)[0]));
        tooltip.style("display", null);
        tooltip.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);

        const path = tooltip.selectAll("path")
            .data([,])
            .join("path")
            .attr("fill", "white")
            .attr("stroke", "black");

        const text = tooltip.selectAll("text")
            .data([,])
            .join("text")
            .call(text => text
                .selectAll("tspan")
                .data(`${title(i)}`.split(/\n/))
                .join("tspan")
                .attr("x", 0)
                .attr("y", (_, i) => `${i * 1.1}em`)
                .attr("font-weight", (_, i) => i ? null : "bold")
                .text(d => d));

        const { x, y, width: w, height: h } = (text.node() as SVGTextElement)?.getBBox();
        text.attr("transform", `translate(${-w / 2},${15 - y})`);
        path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    }

    function pointerleft() {
        tooltip.style("display", "none");
    }

    return svg.node();
}

/*const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type DataPoint = { x: number; y: number };

type LineChartProps = {
    width: number;
    height: number;
    data: DataPoint[];
};

export const LineChart = ({ width, height, data }: LineChartProps) => {
    const coinData = data.map(dataPoint => ({
        Date: new Date(dataPoint.x), // Timestamp is in milliseconds since epoch (1970), convert to Date object
        Close: dataPoint.y // Price
    }));

    const chartRef = useRef<HTMLDivElement | null>(null);

    const axesRef = useRef<SVGGElement | null>(null);
    const boundsWidth = width - MARGIN.right - MARGIN.left;
    const boundsHeight = height - MARGIN.top - MARGIN.bottom;

    if (!data || data.length < 2) {
        return <svg width={width} height={height} />;
    }

    // Y scale
    const [yMin, yMax] = d3.extent(data, d => d.y) as [number, number];
    const yScale = useMemo(() => {
        const min = yMin ?? 0;
        const max = yMax ?? 0;
        return d3.scaleLinear()
            .domain([min, max])
            .range([boundsHeight, 0])
            .nice();
    }, [yMin, yMax, boundsHeight]);

    // X scale
    const [xMin, xMax] = d3.extent(data, d => d.x) as [number, number];
    const xScale = useMemo(() => {
        const min = xMin ?? 0;
        const max = xMax ?? 0;
        return d3
            .scaleTime() //To use actual dates
            .domain([new Date(min), new Date(max)])
            .range([0, boundsWidth]);
    }, [xMin, xMax, boundsWidth]);

    // Axes
    useEffect(() => {
        const svgElement = d3.select(axesRef.current);
        svgElement.selectAll("*").remove();

        const xAxisGenerator = d3.axisBottom(xScale);
        svgElement
            .append("g")
            .attr("transform", "translate(0," + boundsHeight + ")")
            .call(xAxisGenerator);

        const yAxisGenerator = d3.axisLeft(yScale);
        svgElement.append("g").call(yAxisGenerator);
    }, [xScale, yScale, boundsHeight]);

    // Line path
    const lineBuilder = d3.line<DataPoint>()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y));

    const linePath = lineBuilder(data);
    if (!linePath) return null;

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`} width={boundsWidth} height={boundsHeight}>
                <path d={linePath} stroke="#e4af04ff" fill="none" strokeWidth={2} />
            </g>
            <g ref={axesRef} transform={`translate(${MARGIN.left},${MARGIN.top})`} width={boundsWidth} height={boundsHeight} />
        </svg>
    );
};*/