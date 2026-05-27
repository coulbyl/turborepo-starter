"use client";

import { clientApiRequest } from "@/lib/api/client-api";
import type { CreateCaseInput, CreatedCase } from "../types/case";

export async function createCase(
  workspaceId: string,
  input: CreateCaseInput,
): Promise<CreatedCase> {
  const form = new FormData();
  form.append("firstName", input.firstName);
  form.append("lastName", input.lastName);
  form.append("country", input.country);
  form.append("idType", input.idType);
  if (input.dateOfBirth) form.append("dateOfBirth", input.dateOfBirth);
  if (input.idNumber) form.append("idNumber", input.idNumber);
  form.append("selfie", input.selfie);
  form.append("idFront", input.idFront);
  if (input.idBack) form.append("idBack", input.idBack);

  return clientApiRequest<CreatedCase>(`/workspaces/${workspaceId}/cases`, {
    method: "POST",
    body: form,
    fallbackErrorMessage:
      "La vérification n'a pas pu être soumise. Veuillez réessayer.",
  });
}
