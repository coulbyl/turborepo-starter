"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@identis/ui/lib/utils";

// ── Contexts ───────────────────────────────────────────────────────────────

type StepperContextValue = {
  step: number;
  setStep: (n: number) => void;
};

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepperContext() {
  const ctx = React.useContext(StepperContext);
  if (!ctx)
    throw new Error(
      "Stepper compound components must be used within <Stepper>.",
    );
  return ctx;
}

type StepStatus = "completed" | "active" | "pending";

type StepperItemContextValue = {
  step: number;
  status: StepStatus;
};

const StepperItemContext = React.createContext<StepperItemContextValue | null>(
  null,
);

function useStepperItemContext() {
  const ctx = React.useContext(StepperItemContext);
  if (!ctx)
    throw new Error(
      "<StepperIndicator>, <StepperTitle>, <StepperDescription> must be used within <StepperItem>.",
    );
  return ctx;
}

// ── Hook ───────────────────────────────────────────────────────────────────

function useStepper() {
  const { step, setStep } = useStepperContext();
  return {
    currentStep: step,
    goTo: setStep,
    next: () => setStep(step + 1),
    prev: () => setStep(Math.max(1, step - 1)),
  };
}

// ── Stepper (root) ─────────────────────────────────────────────────────────

type StepperProps = {
  step?: number;
  defaultStep?: number;
  onStepChange?: (n: number) => void;
  className?: string;
  children: React.ReactNode;
};

function Stepper({
  step: controlledStep,
  defaultStep = 1,
  onStepChange,
  className,
  children,
}: StepperProps) {
  const [internalStep, setInternalStep] = React.useState(defaultStep);
  const isControlled = controlledStep !== undefined;
  const step = isControlled ? controlledStep : internalStep;

  const setStep = React.useCallback(
    (n: number) => {
      if (!isControlled) setInternalStep(n);
      onStepChange?.(n);
    },
    [isControlled, onStepChange],
  );

  return (
    <StepperContext.Provider value={{ step, setStep }}>
      <div data-slot="stepper" className={cn("flex flex-col gap-6", className)}>
        {children}
      </div>
    </StepperContext.Provider>
  );
}

// ── StepperList ────────────────────────────────────────────────────────────

function StepperList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="stepper-list"
      className={cn("flex w-full items-center", className)}
      {...props}
    />
  );
}

// ── StepperItem ────────────────────────────────────────────────────────────

type StepperItemProps = React.ComponentProps<"li"> & {
  step: number;
};

function StepperItem({
  step,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { step: currentStep } = useStepperContext();
  const status: StepStatus =
    step < currentStep
      ? "completed"
      : step === currentStep
        ? "active"
        : "pending";

  return (
    <StepperItemContext.Provider value={{ step, status }}>
      <li
        data-slot="stepper-item"
        data-status={status}
        className={cn("flex items-center gap-2.5", className)}
        {...props}
      >
        {children}
      </li>
    </StepperItemContext.Provider>
  );
}

// ── StepperIndicator ───────────────────────────────────────────────────────

function StepperIndicator({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { step, status } = useStepperItemContext();

  return (
    <span
      data-slot="stepper-indicator"
      data-status={status}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
        status === "completed" &&
          "border-primary bg-primary text-primary-foreground",
        status === "active" &&
          "border-primary bg-primary text-primary-foreground",
        status === "pending" &&
          "border-border bg-transparent text-muted-foreground",
        className,
      )}
      {...props}
    >
      {status === "completed" ? <CheckIcon className="size-4" /> : step}
    </span>
  );
}

// ── StepperTitle ───────────────────────────────────────────────────────────

function StepperTitle({ className, ...props }: React.ComponentProps<"p">) {
  const { status } = useStepperItemContext();

  return (
    <p
      data-slot="stepper-title"
      data-status={status}
      className={cn(
        "text-sm font-medium leading-none transition-colors",
        status === "pending" ? "text-muted-foreground" : "text-foreground",
        className,
      )}
      {...props}
    />
  );
}

// ── StepperDescription ─────────────────────────────────────────────────────

function StepperDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const { status } = useStepperItemContext();

  return (
    <p
      data-slot="stepper-description"
      data-status={status}
      className={cn(
        "text-xs transition-colors",
        status === "pending"
          ? "text-muted-foreground/50"
          : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

// ── StepperSeparator ───────────────────────────────────────────────────────

type StepperSeparatorProps = React.ComponentProps<"li"> & {
  afterStep: number;
};

function StepperSeparator({
  afterStep,
  className,
  ...props
}: StepperSeparatorProps) {
  const { step } = useStepperContext();
  const completed = step > afterStep;

  return (
    <li
      data-slot="stepper-separator"
      aria-hidden
      className={cn("mx-2 flex flex-1 items-center", className)}
      {...props}
    >
      <div
        className={cn(
          "h-px w-full transition-colors duration-300",
          completed ? "bg-primary" : "bg-border",
        )}
      />
    </li>
  );
}

// ── StepperContent ─────────────────────────────────────────────────────────

type StepperContentProps = React.ComponentProps<"div"> & {
  step: number;
};

function StepperContent({
  step,
  className,
  children,
  ...props
}: StepperContentProps) {
  const { step: currentStep } = useStepperContext();
  if (step !== currentStep) return null;

  return (
    <div
      data-slot="stepper-content"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Exports ────────────────────────────────────────────────────────────────

export {
  Stepper,
  StepperList,
  StepperItem,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
  StepperContent,
  useStepper,
};
export type { StepStatus };
