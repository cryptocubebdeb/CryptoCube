//For more information, refer to this tutorial: https://www.react-graph-gallery.com/line-chart
"use client";
import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type DataPoint = { x: number; y: number };

type LineChartProps = {
    width: number;
    height: number;
    data: DataPoint[];
};

export const LineChart = ({ width, height, data }: LineChartProps) => {

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
                <path d={linePath} stroke="#9a6fb0" fill="none" strokeWidth={2} />
            </g>
            <g ref={axesRef} transform={`translate(${MARGIN.left},${MARGIN.top})`} width={boundsWidth} height={boundsHeight} />
        </svg>
    );
};