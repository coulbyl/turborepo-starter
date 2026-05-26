"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientApiRequest } from "@/lib/api/client-api";
import { UserAvatar } from "@/components/user-avatar";
import { FREE_AVATARS, AVATAR_OPTIONS } from "@/lib/avatars";
import {
  useCurrentUser,
  useSetCurrentUser,
} from "@/domains/auth/context/current-user-context";
import { SettingsSectionCard } from "./settings-section-card";

export function AvatarSection({
  currentAvatarUrl,
  username,
}: {
  currentAvatarUrl: string | null;
  username: string;
}) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();
  const [selected, setSelected] = useState<string | null>(currentAvatarUrl);
  const [saving, setSaving] = useState(false);

  async function handleSelect(avatarUrl: string) {
    if (avatarUrl === selected) return;
    setSelected(avatarUrl);
    setSaving(true);
    try {
      await clientApiRequest("/auth/me", {
        method: "PATCH",
        body: { avatarUrl },
        fallbackErrorMessage: "Unable to save avatar.",
      });
      setCurrentUser({ ...currentUser, avatarUrl });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSectionCard
      eyebrow="Account"
      title="Avatar"
      description="Choose your profile avatar."
    >
      <div className="mb-4 flex justify-center">
        <UserAvatar avatarUrl={selected} username={username} size={72} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Available
        </p>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {FREE_AVATARS.map((avatar) => (
            <AvatarChip
              key={avatar.url}
              avatar={avatar}
              isSelected={selected === avatar.url}
              isLocked={false}
              saving={saving}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </SettingsSectionCard>
  );
}

function AvatarChip({
  avatar,
  isSelected,
  isLocked,
  saving,
  onSelect,
}: {
  avatar: (typeof AVATAR_OPTIONS)[number];
  isSelected: boolean;
  isLocked: boolean;
  saving: boolean;
  onSelect: (url: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={isLocked || saving}
      onClick={() => onSelect(avatar.url)}
      className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors ${
        isSelected
          ? "border-accent bg-accent/10"
          : isLocked
            ? "cursor-not-allowed border-border bg-panel opacity-50 grayscale"
            : "border-border bg-panel hover:border-accent/50"
      }`}
    >
      <UserAvatar avatarUrl={avatar.url} username={avatar.label} size={40} />
      <span className="text-center text-[0.62rem] font-medium leading-tight text-muted-foreground">
        {avatar.label}
      </span>
    </button>
  );
}
