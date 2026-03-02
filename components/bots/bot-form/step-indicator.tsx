"use client";

import { STEPS } from "./constants";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <>
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCompleted = currentStep > s.id;
          const isCurrent = currentStep === s.id;
          return (
            <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-center justify-start gap-1">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 transition-all",
                    isCurrent && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-primary bg-primary/10 text-primary",
                    !isCurrent && !isCompleted && "border-border text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div
                  className={cn(
                    "h-px flex-1 transition-colors",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              </div>
              <span
                className={cn(
                  "w-full text-[10px] font-medium",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                {s.label}
                {s.optional && <span className="ml-0.5 opacity-60">*</span>}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-muted-foreground -mt-1 text-right text-[10px]">* optional</p>
    </>
  );
}
