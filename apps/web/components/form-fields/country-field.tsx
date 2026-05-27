"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Button } from "@identis/ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@identis/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@identis/ui/components/popover";
import { FormField, FormItem, FormLabel, FormMessage } from "@identis/ui";
import { cn } from "@identis/ui/lib/utils";
import {
  CEDEAO_COUNTRIES,
  OTHER_COUNTRIES,
  COUNTRY_MAP,
} from "@/lib/countries";

type CountryFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function CountryField<T extends FieldValues>({
  control,
  name,
  label = "Pays",
  disabled,
  className,
}: CountryFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className={cn(
                  "w-full justify-between font-normal",
                  !field.value && "text-muted-foreground",
                )}
              >
                {field.value
                  ? COUNTRY_MAP[field.value as string]
                  : "Choisir un pays"}
                <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Rechercher un pays…" />
                <CommandList>
                  <CommandEmpty>Pays introuvable.</CommandEmpty>
                  <CommandGroup heading="CEDEAO">
                    {CEDEAO_COUNTRIES.map((c) => (
                      <CommandItem
                        key={c.value}
                        value={c.label}
                        onSelect={() => {
                          field.onChange(c.value);
                          setOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            field.value === c.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {c.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Autres pays">
                    {OTHER_COUNTRIES.map((c) => (
                      <CommandItem
                        key={c.value}
                        value={c.label}
                        onSelect={() => {
                          field.onChange(c.value);
                          setOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 size-4",
                            field.value === c.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {c.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
