import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: string | null;
  changeType?: "positive" | "negative" | null;
  color: "primary" | "accent" | "teal" | "amber" | "green";
};

const colorMap: Record<Props["color"], string> = {
  primary:
    "bg-primary/10 text-primary border-primary/20",
  accent:
    "bg-accent/10 text-accent border-accent/20",
  teal:
    "bg-teal-500/10 text-teal-500 border-teal-500/20",
  amber:
    "bg-amber-500/10 text-amber-500 border-amber-500/20",
  green:
    "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function StatsCard({ icon, label, value, change, changeType, color }: Props) {
  return (
    <div className="rounded-2xl animate-fade-in-up border border-border-strong bg-card-base p-4 flex flex-col gap-2.5 hover:shadow-[0_4px_20px_rgba(139,92,246,0.08)] hover:-translate-y-px transition duration-200">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[12px] text-muted-foreground font-medium leading-none">{label}</p>
      <p className="text-[22px] font-extrabold font-display leading-none text-foreground">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${changeType === "positive" ? "text-green-500" : "text-destructive"}`}>
          {changeType === "positive"
            ? <TrendingUp size={11} />
            : <TrendingDown size={11} />}
          <span>{change} this month</span>
        </div>
      )}
    </div>
  );
}
