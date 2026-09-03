import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

type SliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  label: string;
  className?: string;
};

function Slider({ value, min, max, step = 0.05, onValueChange, label, className }: SliderProps) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onValueChange(v[0] ?? value)}
      aria-label={label}
      className={cn("relative flex h-11 w-full touch-none items-center", className)}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-surface-2">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-4 rounded-full bg-fg shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-bg)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" />
    </SliderPrimitive.Root>
  );
}

export { Slider };
