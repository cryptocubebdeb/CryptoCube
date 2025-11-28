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
    const minY = d3.min(Y);
    const maxY = d3.max(Y);
    const padding = (maxY - minY) * 0.1; // add 10% breathing room
    yDomain = [minY - padding, maxY + padding];

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(6).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat((d) => formatAbbrev(Number(d)).replace("G", "B") as unknown as string);

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
        .attr("color", "transparent");        // transparent axes and lines

    const formatAbbrev = d3.format(".2s");

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    svg.selectAll(".x-axis text")
        .attr("fill", "#ffffff40")     // light gray text color
        .style("font-size", "20px")  // larger text
        .style("font-weight", "500");

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${width - marginRight + 20},0)`)
        .call(d3.axisRight(yScale)                                // axis on right side
            .ticks(6)
            .tickFormat((d: any) => formatAbbrev(Number(d)).replace("G", "B"))
        )
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

    const yTicks = d3.range(yDomain[0], yDomain[1], (yDomain[1] - yDomain[0]) / 7);

    svg.append("g")
        .attr("class", "grid-lines")
        .selectAll("line")
        .data(yTicks)
        .join("line")
        .attr("x1", marginLeft)
        .attr("x2", width - marginRight)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "#444")
        .attr("stroke-opacity", 0.3)
        .attr("shape-rendering", "crispEdges");


    svg.selectAll(".y-axis text")
        .attr("fill", "#ffffff40")
        .style("font-size", "20px")
        .style("font-weight", "500");

    // === Create a vertical color gradient for the area under the line ===

    const isGrowing = Y[Y.length - 1] > Y[0];
    const lineColor = isGrowing ? "#16a34a" : "#dc2626"; // green / red

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
        .attr("stop-color", lineColor)
        .attr("stop-opacity", 0.3);  // 80% visible

    gradient.append("stop") //end color at the bottom
        .attr("offset", "100%") //fully transparent at the bottom for fade effect
        .attr("stop-color", lineColor) //green or red depending on growth
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
        .attr("stroke", lineColor)
        .attr("stroke-width", 2.5)
        .attr("d", line);

    const tooltip = svg.append("g")
        .style("pointer-events", "none");

    // line that follows the cursor along X
    const cursorLine = svg.append("line")
        .attr("class", "cursor-line")
        .attr("stroke", "#ffffff40")    // soft white with transparency
        .attr("stroke-width", 1)
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom)
        .style("display", "none");      // hidden until hover


    //This method handles the pointer movement over the chart and displays the tooltip
    function pointermoved(event: PointerEvent) {
        const i = d3.bisectCenter(X, xScale.invert(d3.pointer(event)[0]));
        if (i < 0 || i >= X.length) return;

        const date = new Date(X[i]);
        const value = Y[i];

        const formatDate = d3.timeFormat("%b %d, %Y, %H:%M:%S %Z");
        const formatNumber = d3.format(",.0f");

        const pointX = xScale(X[i]);
        const pointY = yScale(Y[i]);
        const isLeft = pointX < width / 2;

        tooltip.style("display", null);
        tooltip.attr("transform", `translate(${pointX},${pointY})`);
        tooltip.selectAll("*").remove();

        // === text content ===
            const lines = [
                { text: formatDate(date), color: "#9ca3af" },
                { text: "Prix : ", color: "#b0b6c3", append: `$${formatNumber(value)}` },
            ];

        const text = tooltip.append("text")
            .attr("font-family", "Inter, sans-serif")
            .attr("font-size", 16)
            .attr("text-anchor", "start")
            .attr("stroke", "none") // remove yellow outline
            .attr("fill", "#fff")
            .style("text-shadow", "none")
            .style("-webkit-font-smoothing", "antialiased");

        // Start the first line right at the top
        let y = 0;

        // Go through each line we want to display in the tooltip (like date, price, etc.) **Kinda works like a printer**
        lines.forEach(line => {
            text.append("tspan")
                .attr("x", 0) // start text drawing at x=0, all the way to the left of the box
                .attr("y", y) // draw this line a bit lower for each line, depending on the value of y
                .attr("fill", line.color) // gray tone for the label
                .attr("font-weight", 400)
                .text(line.text);

            // If there’s an extra part (like the price value), add it next to it
            if (line.append) {
                text.append("tspan")
                    .attr("fill", "#fff") // white text to stand out
                    .attr("font-weight", 600)
                    .text(line.append);
            }

            // Move down before writing the next line
            y += 24;
        });

        // === box sizing ===

        // Figure out how big the text is, so we can draw a box that fits it
        const bbox = (text.node() as SVGTextElement).getBBox();

        // Add a bit of empty space around the text inside the box
        const paddingX = 20, paddingY = 14;

        // Calculate how wide and tall the box should be
        const boxWidthWithPadding = bbox.width + paddingX * 2;
        const boxHeightWithPadding = bbox.height + paddingY * 2;

        // If the point is on the left side of the chart, put the box to the right of it.
        // If it’s on the right side, put the box to the left.
        const boxX = isLeft ? 20 : -boxWidthWithPadding - 20; //Basically its x position

        // Place the box so it’s centered up and down with the data point
        const boxY = -boxHeightWithPadding / 2; //Basically its y position

        const boxColor = "rgba(20,25,35,0.95)"; // dark box color

        // === drawing the box here ===

        tooltip.append("rect")
            .attr("x", boxX)
            .attr("y", boxY)
            .attr("width", boxWidthWithPadding)
            .attr("height", boxHeightWithPadding)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", boxColor)
            .lower();

        // === reposition text inside box ===
        const textX = boxX + paddingX;
        const textY = boxY + (boxHeightWithPadding - bbox.height) / 2 + 12;
        text.attr("transform", `translate(${textX}, ${textY})`);

        // === arrow ===
        // Little triangle that connects the box to the point on the line
        const arrowSize = 8;
        const centerPointOfTheBoxInY = boxY + boxHeightWithPadding / 2;
        tooltip.selectAll(".tooltip-arrow").remove();

        // Make the shape of the arrow depending on which side the box is on
        const arrowPath = isLeft
            ? `M${boxX - arrowSize},${centerPointOfTheBoxInY} L${boxX},${centerPointOfTheBoxInY - arrowSize} L${boxX},${centerPointOfTheBoxInY + arrowSize}Z`
            : `M${boxX + boxWidthWithPadding + arrowSize},${centerPointOfTheBoxInY} L${boxX + boxWidthWithPadding},${centerPointOfTheBoxInY - arrowSize} L${boxX + boxWidthWithPadding},${centerPointOfTheBoxInY + arrowSize}Z`;

        // Draw the arrow
        tooltip.append("path")
            .attr("class", "tooltip-arrow")
            .attr("d", arrowPath)
            .attr("fill", boxColor);

        // === show and move the cursor line ===
        cursorLine
            .style("display", null)
            .attr("x1", pointX)
            .attr("x2", pointX);
    }


    function pointerleft() {
        tooltip.style("display", "none");
    }

    return svg.node();
}