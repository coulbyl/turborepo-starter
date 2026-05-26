import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starter App",
  description: "A production-ready monorepo starter.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-dvh overflow-y-auto">{children}</div>;
}
