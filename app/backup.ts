import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import type { Asset, Expense, Frequency } from "./finance";
import type { FinchState } from "./types";

export type BackupType = "json" | "csv";

const frequencies: Frequency[] = [
  "monthly",
  "bimonthly",
  "quarterly",
  "semiannual",
  "annual",
  "eventual",
];

const csvHeaders = [
  "recordType",
  "id",
  "name",
  "ticker",
  "category",
  "amount",
  "kind",
  "dueDay",
  "paid",
  "quantity",
  "purchasePrice",
  "currentPrice",
  "incomeType",
  "incomePerShare",
  "frequency",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isExpense(value: unknown): value is Expense {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    isFiniteNumber(value.amount) &&
    (value.kind === "fixed" || value.kind === "extra") &&
    (value.dueDay === undefined || isFiniteNumber(value.dueDay)) &&
    typeof value.paid === "boolean";
}

function isAsset(value: unknown): value is Asset {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" &&
    typeof value.ticker === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    isFiniteNumber(value.quantity) &&
    isFiniteNumber(value.purchasePrice) &&
    isFiniteNumber(value.currentPrice) &&
    typeof value.incomeType === "string" &&
    isFiniteNumber(value.incomePerShare) &&
    frequencies.includes(value.frequency as Frequency);
}

export function isFinchState(value: unknown): value is FinchState {
  if (!isRecord(value) || !isRecord(value.profile)) return false;
  const profile = value.profile;
  return value.schemaVersion === 1 &&
    typeof profile.name === "string" &&
    isFiniteNumber(profile.salary) &&
    isFiniteNumber(profile.extraIncome) &&
    (profile.payday === undefined || isFiniteNumber(profile.payday)) &&
    typeof profile.pinHash === "string" &&
    typeof profile.pinSalt === "string" &&
    Array.isArray(value.expenses) && value.expenses.every(isExpense) &&
    Array.isArray(value.assets) && value.assets.every(isAsset) &&
    (value.theme === "light" || value.theme === "dark") &&
    (value.language === "pt" || value.language === "en");
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function createBackupContent(data: FinchState, type: BackupType) {
  if (type === "json") return JSON.stringify(data, null, 2);

  const rows: unknown[][] = [csvHeaders];
  rows.push(...data.expenses.map((item) => [
    "expense",
    item.id,
    item.name,
    "",
    item.category,
    item.amount,
    item.kind,
    item.dueDay ?? "",
    item.paid,
    "",
    "",
    "",
    "",
    "",
    "",
  ]));
  rows.push(...data.assets.map((item) => [
    "asset",
    item.id,
    item.name,
    item.ticker,
    item.category,
    "",
    "",
    "",
    "",
    item.quantity,
    item.purchasePrice,
    item.currentPrice,
    item.incomeType,
    item.incomePerShare,
    item.frequency,
  ]));
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export async function exportBackup(data: FinchState, type: BackupType) {
  const content = createBackupContent(data, type);
  const fileName = `finch-backup-${new Date().toISOString().slice(0, 10)}.${type}`;

  if (Capacitor.isNativePlatform()) {
    const file = await Filesystem.writeFile({
      path: fileName,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({
      title: "Finch backup",
      url: file.uri,
      dialogTitle: "Finch backup",
    });
    return;
  }

  const mime = type === "json" ? "application/json" : "text/csv";
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function parseCsv(content: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && content[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function numberValue(value: string, fallback = 0) {
  if (!value.trim()) return fallback;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function canonicalCategory(value: string) {
  const categories: Record<string, string> = {
    Housing: "Moradia",
    Home: "Casa",
    Food: "Alimentação",
    Health: "Saúde",
    Leisure: "Lazer",
    Transport: "Transporte",
    Others: "Outros",
    Stocks: "Ações",
    "Fixed income": "Renda fixa",
    Other: "Outro",
  };
  return categories[value] ?? value;
}

function importCsv(content: string, current: FinchState): FinchState {
  const rows = parseCsv(content);
  if (rows.length < 2) throw new Error("invalid-csv");
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const cell = (row: string[], ...names: string[]) => {
    const index = names.map((name) => headers.indexOf(name.toLowerCase())).find((value) => value >= 0) ?? -1;
    return index >= 0 ? row[index]?.trim() ?? "" : "";
  };
  const hasTickerColumn = headers.includes("ticker");
  const expenses: Expense[] = [];
  const assets: Asset[] = [];

  rows.slice(1).forEach((row) => {
    const recordType = cell(row, "recordType", "type", "tipo").toLowerCase();
    if (recordType === "expense" || recordType === "despesa") {
      const name = cell(row, "name", "nome");
      const amount = numberValue(cell(row, "amount", "value", "valor"));
      if (!name || amount <= 0) throw new Error("invalid-expense");
      const kindValue = cell(row, "kind", "detail", "detalhe").toLowerCase();
      expenses.push({
        id: cell(row, "id") || crypto.randomUUID(),
        name,
        category: canonicalCategory(cell(row, "category", "categoria") || "Outros"),
        amount,
        kind: kindValue === "fixed" || kindValue === "fixo" ? "fixed" : "extra",
        dueDay: numberValue(cell(row, "dueDay")) || undefined,
        paid: cell(row, "paid").toLowerCase() === "true",
      });
    } else if (recordType === "asset" || recordType === "ativo") {
      const oldName = cell(row, "name", "nome");
      const ticker = cell(row, "ticker") || oldName;
      const quantity = numberValue(cell(row, "quantity", "detail", "detalhe"));
      const oldValue = numberValue(cell(row, "value", "valor"));
      const currentPrice = numberValue(cell(row, "currentPrice"), quantity > 0 ? oldValue / quantity : 0);
      if (!ticker || quantity <= 0 || currentPrice < 0) throw new Error("invalid-asset");
      const frequency = cell(row, "frequency") as Frequency;
      assets.push({
        id: cell(row, "id") || crypto.randomUUID(),
        ticker: ticker.toUpperCase(),
        name: hasTickerColumn ? oldName || ticker : ticker,
        category: canonicalCategory(cell(row, "category", "categoria") || "Outro"),
        quantity,
        purchasePrice: numberValue(cell(row, "purchasePrice"), currentPrice),
        currentPrice,
        incomeType: cell(row, "incomeType") || "Outro",
        incomePerShare: numberValue(cell(row, "incomePerShare")),
        frequency: frequencies.includes(frequency) ? frequency : "eventual",
      });
    }
  });

  if (!expenses.length && !assets.length) throw new Error("empty-csv");
  return {
    ...current,
    expenses,
    assets,
  };
}

export async function importBackup(file: File, current: FinchState) {
  const content = await file.text();
  if (file.name.toLowerCase().endsWith(".json") || file.type.includes("json")) {
    const parsed: unknown = JSON.parse(content);
    if (!isFinchState(parsed)) throw new Error("invalid-json");
    return { state: parsed, fullBackup: true };
  }
  return { state: importCsv(content, current), fullBackup: false };
}
