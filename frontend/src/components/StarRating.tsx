import { Star } from "lucide-react";

export default function StarRating({
  rating,
  count,
  size = 16,
  interactive = false,
  onChange,
}: {
  rating: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }
          style={interactive ? { cursor: "pointer" } : undefined}
          onClick={interactive && onChange ? () => onChange(s) : undefined}
        />
      ))}
      {count !== undefined && (
        <span className="ml-1 text-xs text-slate-500">
          {rating > 0 ? `${rating.toFixed(1)} (${count})` : "No ratings yet"}
        </span>
      )}
    </div>
  );
}
