"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Form } from "@identis/ui";
import {
  Stepper,
  StepperList,
  StepperItem,
  StepperIndicator,
  StepperTitle,
  StepperSeparator,
  StepperContent,
} from "@identis/ui";
import {
  InputField,
  SelectField,
  CountryField,
  DateField,
  FileField,
} from "@/components/form-fields";
import { createCase } from "@/domains/case/use-cases/create-case";
import { useCurrentWorkspace } from "@/domains/workspace/context/current-workspace-context";
import { SUPPORTED_ID_TYPES } from "@/domains/case/constants";
import { getSupportedIdTypes } from "@/lib/supported-documents";

const ID_TYPE_OPTIONS = [
  { value: "NATIONAL_ID", label: "Carte nationale d'identité" },
  { value: "PASSPORT", label: "Passeport" },
  { value: "DRIVERS_LICENSE", label: "Permis de conduire" },
  { value: "RESIDENT_CARD", label: "Carte de résident" },
  { value: "HEALTH_INSURANCE_ID", label: "Carte CMU / Assurance maladie" },
  { value: "ATTESTATION_CARD", label: "Attestation d'identité" },
  { value: "ECOWAS_ID", label: "Carte CEDEAO" },
  { value: "VOTER_ID", label: "Carte d'électeur" },
] satisfies { value: (typeof SUPPORTED_ID_TYPES)[number]; label: string }[];

const schema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis.")
    .max(80, "80 caractères maximum."),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(80, "80 caractères maximum."),
  dateOfBirth: z
    .date({ error: "Date invalide." })
    .max(new Date(), { message: "La date ne peut pas être dans le futur." })
    .optional(),
  country: z.string().min(1, "Le pays est requis."),
  idType: z.enum(SUPPORTED_ID_TYPES, "Choisissez un type de document."),
  idNumber: z.string().trim().max(60, "60 caractères maximum.").optional(),
  selfie: z.instanceof(File, { message: "La photo du sujet est requise." }),
  idFront: z.instanceof(File, { message: "Le recto du document est requis." }),
  idBack: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { step: 1, title: "Identité" },
  { step: 2, title: "Document" },
  { step: 3, title: "Captures" },
] as const;

const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  1: ["firstName", "lastName"],
  2: ["country", "idType"],
  3: ["selfie", "idFront"],
};

export function NewCaseForm() {
  const router = useRouter();
  const workspace = useCurrentWorkspace();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: undefined,
      country: "CI",
      idType: "NATIONAL_ID",
      idNumber: "",
      selfie: undefined,
      idFront: undefined,
      idBack: undefined,
    },
    mode: "onTouched",
  });

  const { formState } = form;
  const country = form.watch("country");
  const supportedIdTypes = getSupportedIdTypes(country);
  const idTypeOptions = ID_TYPE_OPTIONS.filter((opt) =>
    supportedIdTypes.includes(opt.value),
  );

  useEffect(() => {
    const current = form.getValues("idType");
    if (!supportedIdTypes.includes(current)) {
      form.setValue("idType", "PASSPORT", { shouldValidate: true });
    }
  }, [country]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNext() {
    const valid = await form.trigger(STEP_FIELDS[currentStep]);
    if (valid) setCurrentStep((s) => s + 1);
  }

  async function onSubmit(values: FormValues) {
    try {
      const created = await createCase(workspace.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth?.toISOString().slice(0, 10),
        country: values.country,
        idType: values.idType,
        idNumber: values.idNumber || undefined,
        selfie: values.selfie,
        idFront: values.idFront,
        idBack: values.idBack,
      });
      router.push(`/dashboard/cases/${created.id}`);
    } catch (err: unknown) {
      form.setError("root", {
        message:
          err instanceof Error ? err.message : "Une erreur est survenue.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stepper step={currentStep} onStepChange={setCurrentStep}>
          {/* Indicateurs */}
          <StepperList>
            {STEPS.map(({ step, title }, i) => (
              <React.Fragment key={step}>
                <StepperItem step={step}>
                  <StepperIndicator />
                  <StepperTitle>{title}</StepperTitle>
                </StepperItem>
                {i < STEPS.length - 1 && <StepperSeparator afterStep={step} />}
              </React.Fragment>
            ))}
          </StepperList>

          {/* Étape 1 — Identité */}
          <StepperContent step={1}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                control={form.control}
                name="firstName"
                label="Prénom"
                placeholder="Konan"
                autoComplete="given-name"
              />
              <InputField
                control={form.control}
                name="lastName"
                label="Nom"
                placeholder="Kouassi"
                autoComplete="family-name"
              />
              <DateField
                control={form.control}
                name="dateOfBirth"
                label="Date de naissance"
                placeholder="Choisir une date"
                fromYear={1920}
                toYear={new Date().getFullYear()}
                className="sm:col-span-2"
              />
            </div>
          </StepperContent>

          {/* Étape 2 — Document */}
          <StepperContent step={2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <CountryField control={form.control} name="country" />
              <SelectField
                control={form.control}
                name="idType"
                label="Type de document"
                options={idTypeOptions}
              />
              <InputField
                control={form.control}
                name="idNumber"
                label="Numéro du document"
                placeholder="Ex : CI-1234567"
                description="Optionnel — améliore la précision"
                className="sm:col-span-2"
              />
            </div>
          </StepperContent>

          {/* Étape 3 — Captures */}
          <StepperContent step={3}>
            <div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Photo biométrique
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Photo du visage du sujet, prise au moment de la vérification.
              </p>
              <FileField
                control={form.control}
                name="selfie"
                label="Selfie"
                description="Face visible, fond neutre, bonne luminosité."
              />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Scans du document
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Photos du document sélectionné à l&apos;étape précédente.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FileField
                  control={form.control}
                  name="idFront"
                  label="Recto"
                  description="Face principale avec photo et données."
                />
                <FileField
                  control={form.control}
                  name="idBack"
                  label="Verso"
                  description="Optionnel selon le type de document."
                />
              </div>
              <p className="mt-3 text-[0.72rem] text-muted-foreground/60">
                Formats acceptés : JPEG, PNG, WebP. Taille max 5 Mo par fichier.
              </p>
            </div>
          </StepperContent>

          {/* Erreur globale */}
          {formState.errors.root && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {formState.errors.root.message}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep((s) => s - 1)}
              >
                Précédent
              </Button>
            )}
            {currentStep < 3 ? (
              <Button type="button" className="flex-1" onClick={handleNext}>
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1"
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting
                  ? "Envoi en cours…"
                  : "Soumettre la vérification"}
              </Button>
            )}
          </div>
        </Stepper>
      </form>
    </Form>
  );
}
