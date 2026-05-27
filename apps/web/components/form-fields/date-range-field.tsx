"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { DateRangePicker, type DateRange } from "@identis/ui";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@identis/ui";

export type { DateRange };

type DateRangeFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function DateRangeField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled,
  className,
}: DateRangeFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <DateRangePicker
            value={field.value as DateRange | undefined}
            onChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
