"use client";

export default function PercentSection() {
  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">

      {/* Title */}
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        Performance
      </h2>

      {/* Placeholder */}
      <p className="text-sm text-slate-400">
        Your performance metrics will appear here once your simulator activity grows.
      </p>

      <div className="mt-4 text-xs text-slate-500">
        • Profit / Loss (%)  
        <br />
        • Total return  
        <br />
        • Equity curve  
        <br />
        • Win rate  
        <br />
        • Avg gain / avg loss  
      </div>
    </div>
  );
}
