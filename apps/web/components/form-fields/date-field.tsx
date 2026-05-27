"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { DatePicker } from "@identis/ui";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@identis/ui";

type DateFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
};

export function DateField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Choisir une date",
  description,
  disabled,
  className,
  fromYear,
  toYear,
}: DateFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <DatePicker
            value={field.value as Date | undefined}
            onChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            fromYear={fromYear}
            toYear={toYear}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
