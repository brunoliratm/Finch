import type { Asset, Expense, Profile } from "./finance";

export type Language = "pt" | "en";

export type FinchState = {
  schemaVersion: 1;
  profile: Profile;
  expenses: Expense[];
  assets: Asset[];
  theme: "light" | "dark";
  language: Language;
};
