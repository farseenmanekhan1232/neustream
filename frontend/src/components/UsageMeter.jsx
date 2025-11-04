import { Progress } from "@/components/ui/progress";

function UsageMeter({ label, current, max, unit, className = "", compact = false }) {
  // Convert to numbers and handle invalid values
  const currentNum = parseFloat(current) || 0;
  const maxNum = parseFloat(max) || 0;

  // Ensure we have valid numbers
  if (isNaN(currentNum) || isNaN(maxNum)) {
    console.warn(`UsageMeter: Invalid values - current: ${current}, max: ${max}`);
  }

  const percentage = maxNum > 0 ? Math.min((currentNum / maxNum) * 100, 100) : 0;
  const remaining = maxNum - currentNum;

  // Determine color based on usage
  const getColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
  };

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">
            {currentNum.toFixed(1)}/{maxNum}{unit}
          </span>
        </div>
        <Progress value={percentage} className="h-1.5" indicatorClassName={getColor()} />
      </div>
    );
  }

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
        <span>{parseFloat(percentage).toFixed(0)}% used</span>
        <span>{remaining.toFixed(1)} {unit} remaining</span>
      </div>
    </div>
  );
}

export default UsageMeter;