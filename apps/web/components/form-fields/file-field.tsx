"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@identis/ui";

type FileFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  accept?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function FileField<T extends FieldValues>({
  control,
  name,
  label,
  accept = "image/jpeg,image/png,image/webp",
  description,
  disabled,
  className,
}: FileFieldProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const file = field.value as File | null | undefined;
        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            {file ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
                <span className="max-w-[200px] truncate text-sm text-foreground">
                  {file.name}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    field.onChange(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="ml-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className={[
                  "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-sm transition-colors",
                  fieldState.error
                    ? "border-destructive/50 text-destructive"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  disabled && "cursor-not-allowed opacity-50",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Upload size={14} />
                Sélectionner
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              disabled={disabled}
              className="hidden"
              onChange={(e) => {
                const picked = e.target.files?.[0] ?? null;
                field.onChange(picked);
              }}
            />
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
