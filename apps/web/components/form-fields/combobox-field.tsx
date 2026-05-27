"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Combobox, type ComboboxOption } from "@identis/ui";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@identis/ui";

export type { ComboboxOption };

type ComboboxFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function ComboboxField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  description,
  disabled,
  className,
}: ComboboxFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Combobox
            options={options}
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyLabel={emptyLabel}
            disabled={disabled}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
