"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@identis/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@identis/ui/components/select";
import { clientApiRequest } from "@/lib/api/client-api";
import { createWorkspace } from "@/domains/workspace/use-cases/create-workspace";
import type { Sector } from "@/domains/workspace/types/workspace";

const AUTRE = "__AUTRE__";

const onboardingSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Au moins 2 caractères.")
      .max(80, "80 caractères max."),
    sectorId: z.string().min(1, "Choisissez un secteur."),
    customSector: z.string().trim().max(80, "80 caractères max.").optional(),
  })
  .refine(
    (data) =>
      data.sectorId !== AUTRE ||
      (data.customSector && data.customSector.length >= 2),
    {
      message: "Précisez votre secteur.",
      path: ["customSector"],
    },
  );

type OnboardingValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    clientApiRequest<Sector[]>("/sectors")
      .then(setSectors)
      .catch(() => setSectors([]));
  }, []);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: "", sectorId: "", customSector: "" },
    mode: "onTouched",
  });

  const sectorId = form.watch("sectorId");

  async function onSubmit(values: OnboardingValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      let sectorLabel: string | undefined;
      if (values.sectorId === AUTRE) {
        sectorLabel = values.customSector?.trim().toUpperCase();
      } else {
        sectorLabel = sectors.find((s) => s.id === values.sectorId)?.label;
      }
      await createWorkspace({ name: values.name, sectorLabel });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer l'organisation.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l&apos;organisation</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex : MaCoop Finances"
                  autoComplete="organization"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sectorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secteur d&apos;activité</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  if (val !== AUTRE) form.setValue("customSector", "");
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir un secteur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label.charAt(0) + s.label.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                  <SelectItem value={AUTRE}>Autre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {sectorId === AUTRE && (
          <FormField
            control={form.control}
            name="customSector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Précisez votre secteur</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex : Assurance, Santé, RH…"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Création…" : "Créer mon organisation"}
        </Button>
      </form>
    </Form>
  );
}
