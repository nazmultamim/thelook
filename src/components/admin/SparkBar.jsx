'use client';

export default function SparkBar({ values, color }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-[2px] h-10">
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            height: `${(v / max) * 100}%`,
            background: color,
            opacity: i === values.length - 1 ? 1 : 0.35 + (i / values.length) * 0.55,
          }}
          className="w-[5px] rounded-sm flex-shrink-0"
        />
      ))}
    </div>
  );
}