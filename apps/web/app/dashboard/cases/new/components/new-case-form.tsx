"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { createCase } from "@/domains/case/use-cases/create-case";
import { useCurrentWorkspace } from "@/domains/workspace/context/current-workspace-context";
import { SUPPORTED_ID_TYPES } from "@/domains/case/constants";

const COUNTRIES = [
  { code: "CI", label: "Côte d'Ivoire" },
  { code: "SN", label: "Sénégal" },
  { code: "BJ", label: "Bénin" },
  { code: "BF", label: "Burkina Faso" },
  { code: "ML", label: "Mali" },
  { code: "TG", label: "Togo" },
  { code: "GH", label: "Ghana" },
  { code: "NG", label: "Nigeria" },
  { code: "GN", label: "Guinée" },
  { code: "MR", label: "Mauritanie" },
  { code: "NE", label: "Niger" },
  { code: "CM", label: "Cameroun" },
  { code: "FR", label: "France" },
  { code: "US", label: "États-Unis" },
  { code: "GB", label: "Royaume-Uni" },
  { code: "DE", label: "Allemagne" },
  { code: "LB", label: "Liban" },
  { code: "MA", label: "Maroc" },
  { code: "DZ", label: "Algérie" },
  { code: "TN", label: "Tunisie" },
];

const ID_TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: "Carte nationale d'identité",
  PASSPORT: "Passeport",
  DRIVERS_LICENSE: "Permis de conduire",
  RESIDENT_CARD: "Carte de résident",
  HEALTH_INSURANCE_ID: "Carte CMU / Assurance maladie",
  ATTESTATION_CARD: "Attestation d'identité",
  ECOWAS_ID: "Carte CEDEAO",
  VOTER_ID: "Carte d'électeur",
};

function FileUploadButton({
  label,
  file,
  onChange,
  required,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      {file ? (
        <div className="flex items-center justify-between rounded-lg border border-[#2563eb]/30 bg-[#2563eb]/5 px-3 py-2.5">
          <span className="max-w-[200px] truncate text-sm text-foreground">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-[#2563eb]/50 hover:text-foreground"
        >
          <Upload size={14} />
          Sélectionner
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export function NewCaseForm() {
  const router = useRouter();
  const workspace = useCurrentWorkspace();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("CI");
  const [idType, setIdType] = useState("NATIONAL_ID");
  const [idNumber, setIdNumber] = useState("");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selfie || !idFront) return;
    setLoading(true);
    setError(null);
    try {
      const created = await createCase(workspace.id, {
        firstName,
        lastName,
        dateOfBirth: dob || undefined,
        country,
        idType,
        idNumber: idNumber || undefined,
        selfie,
        idFront,
        idBack: idBack ?? undefined,
      });
      router.push(`/dashboard/cases/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <div className="rounded-2xl border border-border bg-panel-strong p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">
          Identité du sujet
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="firstName"
            >
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              placeholder="Konan"
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="lastName"
            >
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              placeholder="Kouassi"
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="dob"
            >
              Date de naissance
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Document */}
      <div className="rounded-2xl border border-border bg-panel-strong p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Document</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="country"
            >
              Pays <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputClass}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="idType"
            >
              Type de document <span className="text-red-500">*</span>
            </label>
            <select
              id="idType"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              className={inputClass}
            >
              {SUPPORTED_ID_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ID_TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="idNumber"
            >
              Numéro du document
              <span className="ml-1 text-xs text-muted-foreground">
                (optionnel — améliore la précision)
              </span>
            </label>
            <input
              id="idNumber"
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className={inputClass}
              placeholder="Ex : CI-1234567"
            />
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="rounded-2xl border border-border bg-panel-strong p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Photos</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <FileUploadButton
            label="Selfie"
            file={selfie}
            onChange={setSelfie}
            required
          />
          <FileUploadButton
            label="Document recto"
            file={idFront}
            onChange={setIdFront}
            required
          />
          <FileUploadButton
            label="Document verso"
            file={idBack}
            onChange={setIdBack}
          />
        </div>
        <p className="mt-3 text-[0.72rem] text-muted-foreground/60">
          Formats acceptés : JPEG, PNG, WebP. Taille max 5 Mo par fichier.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !selfie || !idFront || !firstName || !lastName}
        className="w-full rounded-xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Envoi en cours…" : "Soumettre la vérification"}
      </button>
    </form>
  );
}
