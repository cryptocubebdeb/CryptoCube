"use client";
import { useRef, useEffect, useState } from "react";
import LineChart from "../../components/SpecificCoin/LineChart";

export default function PortfolioChart() {
    const containerRef = useRef<HTMLDivElement>(null); //access to the container div wrapping the chart
    const [dimensions, setDimensions] = useState({ width: 1200, height: 500 }); //default dimensions


    // Dynamically track container size
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(([entry]) => { //observer is an API that tracks size changes of an element
            const { width } = entry.contentRect; //get the new width with entry which is an object representing the observed element
            setDimensions({
                width,
                height: Math.max(400, width * 0.4), // proportional height
            });
        });
        observer.observe(containerRef.current); //start observing the container element
        return () => observer.disconnect(); //cleanup on unmount
    }, []);

    // ============ TEST DATA FOR NOW NEED TO REMOVE ==============
    const data = [
        { x: Date.now() - 5 * 86400000, y: 75000 },
        { x: Date.now() - 4 * 86400000, y: 76000 },
        { x: Date.now() - 3 * 86400000, y: 75200 },
        { x: Date.now() - 2 * 86400000, y: 77100 },
        { x: Date.now() - 1 * 86400000, y: 79000 },
        { x: Date.now(), y: 78200 },
    ];

    return (
        <div
            ref={containerRef}
            className="shadow-md w-full max-w-[1600px] mx-auto"
        >
            <h2 className="text-2xl font-semibold mb-6 text-center">
                Portfolio Value Over Time
            </h2>

            <div className="w-full">
                <LineChart
                    width={0.95 *dimensions.width}
                    height={dimensions.height}
                    data={data}
                />
            </div>
        </div>
    );
}