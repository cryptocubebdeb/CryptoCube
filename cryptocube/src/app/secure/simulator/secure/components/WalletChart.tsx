"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Every slice of the chart looks like this
type ChartData = {
  label: string;   // Ex: "BTC"
  value: number;   // Ex: 12000 (this makes the slice bigger or smaller)
  id?: string;     // used to redirect to a coin page
};

// The props we accept from parent components
type Props = {
  data: ChartData[];               // The list of slices to draw
  onClick?: (entry: ChartData) => void; // when a slice is clicked
};

// Colors used for each slice of the chart
const COLORS = [
  "#FFDD00",
  "#0EA5E9",
  "#16A34A",
  "#EF4444",
  "#A855F7",
  "#F97316",
  "#14B8A6",
  "#EAB308",
];

export default function CircleChart({ data, onClick }: Props) {
  
  // If no portfolio yet, don't display chart at all
  if (!data || data.length === 0) return null;

  return (
    // Fixed size container for the chart
    <div className="w-64 h-64">
      
      {/* Makes the chart responsive inside the square */}
      <ResponsiveContainer>

        {/* The chart wrapper */}
        <PieChart>

          {/* Tooltip when hovering slices */}
          <Tooltip
            formatter={(value: number) => `$${value.toFixed(2)}`} // Format number
            labelFormatter={(label: string) => label}            // Label on top
          />

          {/* Chart shape */}
          <Pie
            data={data}          // Our list of slices
            dataKey="value"      // The value used to size each slice
            nameKey="label"      // Name used inside tooltip
            innerRadius="60%"    // Creates the donut hole
            outerRadius="90%"    // Total radius
            paddingAngle={3}     // Small gap between slices

            // When a user clicks, return the slice information
            onClick={(sliceInfo) => {
              // sliceInfo.payload contains the actual ChartData object
              const entry = sliceInfo.payload as ChartData;

              // Only call onClick if it was passed from parent
              if (onClick) onClick(entry);
            }}
          >
            {/* Create one slice for each coin */}
            {data.map((entry, index) => (
              <Cell
                key={`slice-${index}`}
                fill={COLORS[index % COLORS.length]} // Pick a color
                style={{ cursor: "pointer" }}        // Clickable
              />
            ))}
          </Pie>

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
