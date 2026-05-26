export type WalletTransaction = {
  id: string;
  type: "INSCRIPTION" | "RECHARGE" | "DEDUCTION" | "REFUND";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string | null;
  caseId: string | null;
  product: string | null;
  createdAt: string;
};

export type WalletHistory = {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
};

export const TX_TYPE_LABEL: Record<WalletTransaction["type"], string> = {
  INSCRIPTION: "Inscription",
  RECHARGE: "Recharge",
  DEDUCTION: "Vérification",
  REFUND: "Remboursement",
};
