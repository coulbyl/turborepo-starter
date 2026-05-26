import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identis",
  description:
    "Plateforme de vérification d'identité et de validation de dossiers pour l'Afrique francophone.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-dvh overflow-y-auto">{children}</div>;
}
