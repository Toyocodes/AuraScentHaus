"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
  value: number;
  max: number;
  min?: number;
  disabled?: boolean;
  onChange?: (quantity: number) => void;
}

export function QuantityStepper({ value, max, min = 1, disabled, onChange }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange?.(value - 1)}
      >
        <Minus />
      </Button>
      <span className="w-6 text-center text-sm tabular-nums">{value}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange?.(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
