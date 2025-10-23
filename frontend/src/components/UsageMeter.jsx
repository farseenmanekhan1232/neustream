import { Progress } from "@/components/ui/progress";

function UsageMeter({ label, current, max, unit, className = "" }) {
  // Convert to numbers and handle invalid values
  const currentNum = parseFloat(current) || 0;
  const maxNum = parseFloat(max) || 0;

  const percentage = maxNum > 0 ? Math.min((currentNum / maxNum) * 100, 100) : 0;
  const remaining = maxNum - currentNum;

  // Determine color based on usage
  const getColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {currentNum.toFixed(1)} / {maxNum} {unit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" indicatorClassName={getColor()} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentage.toFixed(0)}% used</span>
        <span>{remaining.toFixed(1)} {unit} remaining</span>
      </div>
    </div>
  );
}

export default UsageMeter;