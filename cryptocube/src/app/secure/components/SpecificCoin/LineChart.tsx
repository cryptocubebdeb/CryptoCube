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
    marginTop = 10, // top margin, in pixels
    marginRight = 20, // right margin, in pixels
    marginBottom = 20, // bottom margin, in pixels
    marginLeft = 30, // left margin, in pixels
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
    const xAxis = d3.axisBottom(xScale).ticks(6).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(6, yFormat).tickPadding(5);

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

    // Create the SVG container. An SVG is a Scalable Vector Graphic, an XML-based image format for two-dimensional graphics.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: 100%;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .style("-webkit-tap-highlight-color", "transparent")
        .style("overflow", "visible")
        .on("pointerenter pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());

    svg
        .style("background", "transparent")   // dark navy background
        .attr("stroke", "#e4af04")        // yellow line accent
        .attr("color", "#e5e7eb");        // light gray text for axes

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 20)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel ?? ""));

    // === Create a vertical color gradient for the area under the line ===

    //Here we create a definition, which is a reusable SVG element we will reference later
    const gradient = svg.append("defs")
        .append("linearGradient") // Create a linear gradient (smooth color transition)
        .attr("id", "chart-gradient") // Give it an ID so we can reference it later (as a fill)
        .attr("x1", "0%") // Start of the gradient (horizontal position)
        .attr("y1", "0%") // Start of the gradient (vertical position, top)
        .attr("x2", "0%")  // End horizontally — still at 0%, so vertical gradient only
        .attr("y2", "100%"); // End vertically at the bottom of the chart (100% down)

    // Slightly below top — still bright but slightly less
    gradient.append("stop")
        .attr("offset", "30%")
        .attr("stop-color", "#e4af04")
        .attr("stop-opacity", 0.3);  // 80% visible

    gradient.append("stop") //end color at the bottom
        .attr("offset", "100%") //fully transparent at the bottom for fade effect
        .attr("stop-color", "#e4af04") //yellow
        .attr("stop-opacity", 0); //fully transparent

    // Area generator: it will convert the data so that SVG can draw it
    const area = d3.area<{ Date: Date; Close: number }>()
        .x(d => xScale(d.Date)) //Converts the date to a pixel position on the chart (ex.: Jan 2020 => 34px)
        .y0(height - marginBottom) //Bottom of the area, shows where to start filling (at the bottom of the chart)
        .y1(d => yScale(d.Close)); //Converts the closing price to a pixel position on the chart

    svg.append("path")
        .datum(data)
        .attr("fill", "url(#chart-gradient)") // Use the gradient defined earlier as the fill color
        .attr("stroke", "none") //to not have borders
        .attr("d", area); // Generate the fade fill area

    //Here we generate the line path
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#e4af04")
        .attr("stroke-width", 2.5)
        .attr("d", line); 
    
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
                .attr("font-weight", "bold")
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