"use client";

/*
  This section will later show performance statistics,
  such as:
   - profit and loss %
   - win rate
   - equity curve
   - benchmarks
   - etc.

  For now, it's a simple placeholder box.
*/

export default function PercentSection() {
  return (
    <div className="bg-[#11131b] border border-[#23252c] rounded-xl p-6">
      
      {/* Section Title */}
      <h2 className="text-xl font-bold text-yellow-400 mb-3">
        Performance & Percent
      </h2>

      {/* Temporary description */}
      <p className="text-sm text-slate-400 leading-relaxed">
        This area will show your simulator performance once data is available.
      </p>
    </div>
  );
}
