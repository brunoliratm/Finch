"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Download,
  Eye,
  EyeOff,
  FileJson,
  Home,
  Languages,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Moon,
  Pencil,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Trash2,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  Asset,
  buildProjection,
  buildRecommendations,
  calculateExpenseMetrics,
  calculatePortfolioMetrics,
  Expense,
  formatBRL,
  Frequency,
  Profile,
} from "./finance";
import { loadLocalState, saveLocalState } from "./storage";

type Language = "pt" | "en";
type Tab = "dashboard" | "portfolio" | "expenses" | "profile";

type EditorModal =
  | { type: "expense"; item?: Expense }
  | { type: "asset"; item?: Asset };

type FinchState = {
  schemaVersion: 1;
  profile: Profile;
  expenses: Expense[];
  assets: Asset[];
  theme: "light" | "dark";
  language: Language;
};

const pt = {
  nav: { home: "Início", portfolio: "Carteira", expenses: "Despesas", profile: "Perfil", label: "Navegação principal" },
  common: { optional: "Opcional", cancel: "Cancelar", close: "Fechar", edit: "Editar", remove: "Remover", save: "Salvar alterações", fixed: "Fixo", extra: "Extra", paid: "Pago", pending: "Pendente", noDueDate: "Sem vencimento", day: "Dia", perMonth: "por mês" },
  onboarding: { tagline: "Seu dinheiro, mais claro", firstAccess: "Primeiro acesso", title: "Vamos preparar seu espaço", intro: "Somente o essencial é obrigatório. Você poderá alterar tudo depois.", nameQuestion: "Como devemos chamar você?", namePlaceholder: "Seu nome", salary: "Salário mensal", extraIncome: "Renda extra", payday: "Dia do pagamento", paydayPlaceholder: "Ex.: 5", continue: "Continuar", back: "Voltar", protection: "Proteção local", pinTitle: "Crie seu PIN", pinIntro: "Ele será solicitado quando você abrir novamente o Finch.", pin: "PIN", pinPlaceholder: "4 a 6 dígitos", confirmPin: "Confirme o PIN", confirmPlaceholder: "Repita seu PIN", demoTitle: "Adicionar dados de demonstração", demoDescription: "Ideal para conhecer os gráficos e indicadores.", enter: "Entrar no Finch", pinLengthError: "Crie um PIN numérico de 4 a 6 dígitos.", pinMatchError: "Os PINs informados não são iguais.", privacy: "Seus dados ficam neste dispositivo" },
  lock: { welcome: "Bem-vindo de volta", hello: "Olá", description: "Digite seu PIN para acessar seus dados financeiros.", incorrect: "PIN incorreto. Tente novamente.", unlock: "Desbloquear", protected: "Proteção local ativa" },
  dashboard: { greeting: "Olá", description: "Seu panorama financeiro deste mês.", newExpense: "Nova despesa", balance: "Saldo disponível", showValues: "Mostrar valores", hideValues: "Ocultar valores", freeIncome: "da renda permanece livre", income: "Receitas", expenses: "Despesas", invested: "Patrimônio investido", savingsRate: "Taxa de economia", suggestedGoal: "Meta sugerida: 20%", investmentIncome: "Renda de investimentos", monthlyAverage: "Média mensal projetada", distribution: "Distribuição", categories: "Despesas por categoria", details: "Ver detalhes", noExpenses: "Nenhuma despesa", noExpensesDescription: "Adicione despesas para visualizar sua distribuição.", forecast: "Previsão", nextMonths: "Próximos 12 meses", localEstimate: "Estimativa local", estimatedBalance: "Saldo acumulado estimado", insights: "Finch insights", recommendations: "Recomendações para você" },
  portfolio: { eyebrow: "Seus investimentos", title: "Carteira", description: "Acompanhe posições e rendimentos informados manualmente.", add: "Adicionar ativo", currentValue: "Valor atual", invested: "Total investido", result: "Resultado", annualIncome: "Renda anual", registeredProjection: "projeção cadastrada", positions: "Posições", registeredAssets: "Ativos cadastrados", manualUpdate: "Atualização manual", quantity: "Quantidade", currentPrice: "Preço atual", position: "Posição", emptyTitle: "Sua carteira começa aqui", emptyDescription: "Adicione o primeiro ativo para calcular sua rentabilidade.", removeConfirm: "Remover {ticker} da carteira?" },
  expenses: { eyebrow: "Controle mensal", title: "Despesas", description: "Acompanhe compromissos fixos e gastos extras do mês.", add: "Nova despesa", monthTotal: "Total do mês", fixed: "Gastos fixos", ofIncome: "da renda", extras: "Gastos extras", commitment: "Comprometimento", withinLimit: "Dentro do limite", review: "Revisar despesas", thisMonth: "Neste mês", bills: "Contas e gastos", paidCount: "pagos", markPending: "Marcar como pendente", markPaid: "Marcar como pago", emptyTitle: "Nenhuma despesa registrada", emptyDescription: "Adicione seus gastos fixos e extras deste mês.", budget: "Orçamento sugerido", basedOnIncome: "Baseado na sua renda", budgetDescription: "Uma referência simples para distribuir {income}, sem transformar recomendações em regras rígidas.", essentials: "Essenciais", lifestyle: "Estilo de vida", reserve: "Reserva e metas", removeConfirm: "Remover a despesa “{name}”?" },
  profile: { eyebrow: "Preferências locais", title: "Seu perfil", description: "Atualize renda, idioma, segurança, aparência e backups.", language: "Idioma", languageTitle: "Idioma do aplicativo", languageDescription: "Alterne toda a interface do Finch.", portuguese: "Português", english: "English", financialData: "Dados financeiros", personalInfo: "Informações pessoais", name: "Nome", salary: "Salário mensal", extraIncome: "Renda extra", payday: "Dia do pagamento", security: "Segurança", changePin: "Alterar PIN", currentPin: "PIN atual", newPin: "Novo PIN", confirm: "Confirme", updatePin: "Atualizar PIN", wrongPin: "O PIN atual está incorreto.", invalidPin: "O novo PIN deve ter de 4 a 6 dígitos.", pinMismatch: "A confirmação do novo PIN não corresponde.", appearance: "Aparência", theme: "Tema do Finch", themeDescription: "Escolha o tema mais confortável para acompanhar suas finanças.", light: "Claro", dark: "Escuro", backup: "Backup local", export: "Exportar seus dados", exportDescription: "Baixe uma cópia para guardar ou analisar fora do Finch.", exportJson: "Exportar JSON", exportCsv: "Exportar CSV", lock: "Bloquear aplicativo agora" },
  expenseForm: { eyebrow: "Cadastro local", newTitle: "Nova despesa", editTitle: "Editar despesa", description: "Registre um compromisso fixo ou gasto extra.", name: "Descrição", namePlaceholder: "Ex.: Conta de energia", category: "Categoria", amount: "Valor", type: "Tipo", fixed: "Gasto fixo", extra: "Gasto extra", dueDay: "Dia do vencimento", paid: "Marcar como pago", paidDescription: "Você poderá alterar depois.", add: "Adicionar despesa" },
  assetForm: { eyebrow: "Cadastro local", newTitle: "Novo ativo", editTitle: "Editar ativo", description: "Informe os dados da sua posição e dos rendimentos.", ticker: "Código do ativo", tickerPlaceholder: "Ex.: PETR4", name: "Nome", namePlaceholder: "Empresa ou fundo", category: "Categoria", quantity: "Quantidade", purchasePrice: "Preço de compra", currentPrice: "Preço atual", incomeType: "Forma de lucro", incomePerShare: "Valor por ação/cota", frequency: "Periodicidade", add: "Adicionar ativo" },
  options: { housing: "Moradia", home: "Casa", food: "Alimentação", health: "Saúde", leisure: "Lazer", transport: "Transporte", others: "Outros", stocks: "Ações", fixedIncome: "Renda fixa", other: "Outro", dividends: "Dividendos", interest: "Juros sobre capital", distributions: "Rendimentos", monthly: "Mensal", bimonthly: "Bimestral", quarterly: "Trimestral", semiannual: "Semestral", annual: "Anual", eventual: "Eventual" },
  toast: { expenseAdded: "Despesa adicionada", expenseUpdated: "Despesa atualizada", expenseRemoved: "Despesa removida", assetAdded: "Ativo adicionado", assetUpdated: "Ativo atualizado", assetRemoved: "Ativo removido", profileUpdated: "Perfil atualizado", pinUpdated: "PIN alterado", languageUpdated: "Idioma atualizado" },
};

const en = {
  nav: { home: "Home", portfolio: "Portfolio", expenses: "Expenses", profile: "Profile", label: "Main navigation" },
  common: { optional: "Optional", cancel: "Cancel", close: "Close", edit: "Edit", remove: "Remove", save: "Save changes", fixed: "Fixed", extra: "Extra", paid: "Paid", pending: "Pending", noDueDate: "No due date", day: "Day", perMonth: "per month" },
  onboarding: { tagline: "Your money, made clearer", firstAccess: "First access", title: "Let's set up your space", intro: "Only essential information is required. You can change everything later.", nameQuestion: "What should we call you?", namePlaceholder: "Your name", salary: "Monthly salary", extraIncome: "Additional income", payday: "Payday", paydayPlaceholder: "E.g. 5", continue: "Continue", back: "Back", protection: "Local protection", pinTitle: "Create your PIN", pinIntro: "It will be requested when you open Finch again.", pin: "PIN", pinPlaceholder: "4 to 6 digits", confirmPin: "Confirm PIN", confirmPlaceholder: "Repeat your PIN", demoTitle: "Add demonstration data", demoDescription: "Ideal for exploring charts and indicators.", enter: "Enter Finch", pinLengthError: "Create a numeric PIN with 4 to 6 digits.", pinMatchError: "The PIN values do not match.", privacy: "Your data stays on this device" },
  lock: { welcome: "Welcome back", hello: "Hello", description: "Enter your PIN to access your financial data.", incorrect: "Incorrect PIN. Try again.", unlock: "Unlock", protected: "Local protection active" },
  dashboard: { greeting: "Hello", description: "Your financial overview for this month.", newExpense: "New expense", balance: "Available balance", showValues: "Show values", hideValues: "Hide values", freeIncome: "of your income remains available", income: "Income", expenses: "Expenses", invested: "Invested assets", savingsRate: "Savings rate", suggestedGoal: "Suggested goal: 20%", investmentIncome: "Investment income", monthlyAverage: "Projected monthly average", distribution: "Distribution", categories: "Expenses by category", details: "View details", noExpenses: "No expenses", noExpensesDescription: "Add expenses to see their distribution.", forecast: "Forecast", nextMonths: "Next 12 months", localEstimate: "Local estimate", estimatedBalance: "Estimated accumulated balance", insights: "Finch insights", recommendations: "Recommendations for you" },
  portfolio: { eyebrow: "Your investments", title: "Portfolio", description: "Track positions and income entered manually.", add: "Add asset", currentValue: "Current value", invested: "Total invested", result: "Result", annualIncome: "Annual income", registeredProjection: "registered projection", positions: "Positions", registeredAssets: "Registered assets", manualUpdate: "Manual update", quantity: "Quantity", currentPrice: "Current price", position: "Position", emptyTitle: "Your portfolio starts here", emptyDescription: "Add your first asset to calculate profitability.", removeConfirm: "Remove {ticker} from your portfolio?" },
  expenses: { eyebrow: "Monthly control", title: "Expenses", description: "Track fixed commitments and extra monthly spending.", add: "New expense", monthTotal: "Month total", fixed: "Fixed expenses", ofIncome: "of income", extras: "Extra expenses", commitment: "Income committed", withinLimit: "Within the limit", review: "Review expenses", thisMonth: "This month", bills: "Bills and spending", paidCount: "paid", markPending: "Mark as pending", markPaid: "Mark as paid", emptyTitle: "No expenses registered", emptyDescription: "Add this month's fixed and extra expenses.", budget: "Suggested budget", basedOnIncome: "Based on your income", budgetDescription: "A simple reference for distributing {income} without turning recommendations into strict rules.", essentials: "Essentials", lifestyle: "Lifestyle", reserve: "Savings and goals", removeConfirm: "Remove the expense “{name}”?" },
  profile: { eyebrow: "Local preferences", title: "Your profile", description: "Update income, language, security, appearance, and backups.", language: "Language", languageTitle: "Application language", languageDescription: "Switch the entire Finch interface.", portuguese: "Português", english: "English", financialData: "Financial data", personalInfo: "Personal information", name: "Name", salary: "Monthly salary", extraIncome: "Additional income", payday: "Payday", security: "Security", changePin: "Change PIN", currentPin: "Current PIN", newPin: "New PIN", confirm: "Confirm", updatePin: "Update PIN", wrongPin: "The current PIN is incorrect.", invalidPin: "The new PIN must contain 4 to 6 digits.", pinMismatch: "The new PIN confirmation does not match.", appearance: "Appearance", theme: "Finch theme", themeDescription: "Choose the most comfortable theme for tracking your finances.", light: "Light", dark: "Dark", backup: "Local backup", export: "Export your data", exportDescription: "Download a copy for safekeeping or analysis outside Finch.", exportJson: "Export JSON", exportCsv: "Export CSV", lock: "Lock application now" },
  expenseForm: { eyebrow: "Local record", newTitle: "New expense", editTitle: "Edit expense", description: "Register a fixed commitment or extra expense.", name: "Description", namePlaceholder: "E.g. Electricity bill", category: "Category", amount: "Amount", type: "Type", fixed: "Fixed expense", extra: "Extra expense", dueDay: "Due day", paid: "Mark as paid", paidDescription: "You can change this later.", add: "Add expense" },
  assetForm: { eyebrow: "Local record", newTitle: "New asset", editTitle: "Edit asset", description: "Enter the details of your position and investment income.", ticker: "Asset ticker", tickerPlaceholder: "E.g. PETR4", name: "Name", namePlaceholder: "Company or fund", category: "Category", quantity: "Quantity", purchasePrice: "Purchase price", currentPrice: "Current price", incomeType: "Income type", incomePerShare: "Amount per share", frequency: "Frequency", add: "Add asset" },
  options: { housing: "Housing", home: "Home", food: "Food", health: "Health", leisure: "Leisure", transport: "Transport", others: "Others", stocks: "Stocks", fixedIncome: "Fixed income", other: "Other", dividends: "Dividends", interest: "Interest on equity", distributions: "Distributions", monthly: "Monthly", bimonthly: "Every two months", quarterly: "Quarterly", semiannual: "Semiannual", annual: "Annual", eventual: "Occasional" },
  toast: { expenseAdded: "Expense added", expenseUpdated: "Expense updated", expenseRemoved: "Expense removed", assetAdded: "Asset added", assetUpdated: "Asset updated", assetRemoved: "Asset removed", profileUpdated: "Profile updated", pinUpdated: "PIN updated", languageUpdated: "Language updated" },
} satisfies typeof pt;

const copy = { pt, en };

const expenseColors: Record<string, string> = {
  Moradia: "#7357e8",
  Casa: "#9a84ee",
  Alimentação: "#ffb95c",
  Saúde: "#55c8a5",
  Lazer: "#ff8797",
  Transporte: "#64a8f4",
  Outros: "#a7a6b4",
};

const expenseCategoryKeys: Record<string, keyof typeof pt.options> = {
  Moradia: "housing",
  Casa: "home",
  Alimentação: "food",
  Saúde: "health",
  Lazer: "leisure",
  Transporte: "transport",
  Outros: "others",
};

const assetCategoryKeys: Record<string, keyof typeof pt.options> = {
  Ações: "stocks",
  FII: "FII" as keyof typeof pt.options,
  ETF: "ETF" as keyof typeof pt.options,
  "Renda fixa": "fixedIncome",
  Outro: "other",
};

const optionLabel = (language: Language, value: string) => {
  if (value === "FII" || value === "ETF") return value;
  const key = expenseCategoryKeys[value] ?? assetCategoryKeys[value];
  return key ? copy[language].options[key] : value;
};

const createDemoExpenses = (language: Language): Expense[] => [
  { id: "exp-1", name: language === "pt" ? "Aluguel" : "Rent", category: "Moradia", amount: 1650, kind: "fixed", dueDay: 8, paid: true },
  { id: "exp-2", name: language === "pt" ? "Energia" : "Electricity", category: "Casa", amount: 238.4, kind: "fixed", dueDay: 12, paid: true },
  { id: "exp-3", name: "Internet", category: "Casa", amount: 119.9, kind: "fixed", dueDay: 15, paid: false },
  { id: "exp-4", name: language === "pt" ? "Supermercado" : "Groceries", category: "Alimentação", amount: 742.35, kind: "extra", paid: true },
  { id: "exp-5", name: language === "pt" ? "Academia" : "Gym", category: "Saúde", amount: 109.9, kind: "fixed", dueDay: 20, paid: false },
  { id: "exp-6", name: language === "pt" ? "Cinema" : "Movies", category: "Lazer", amount: 84, kind: "extra", paid: true },
];

const demoAssets: Asset[] = [
  { id: "asset-1", ticker: "PETR4", name: "Petrobras", category: "Ações", quantity: 25, purchasePrice: 34.2, currentPrice: 37.82, incomeType: "Dividendos", incomePerShare: 0.82, frequency: "quarterly" },
  { id: "asset-2", ticker: "MXRF11", name: "Maxi Renda", category: "FII", quantity: 70, purchasePrice: 10.18, currentPrice: 10.42, incomeType: "Rendimentos", incomePerShare: 0.1, frequency: "monthly" },
  { id: "asset-3", ticker: "BOVA11", name: "ETF Ibovespa", category: "ETF", quantity: 8, purchasePrice: 119.4, currentPrice: 124.9, incomeType: "Outro", incomePerShare: 0, frequency: "eventual" },
];

async function hashPin(pin: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function percentage(value: number, language: Language) {
  return `${value.toFixed(1).replace(".", language === "pt" ? "," : ".")}%`;
}

export default function HomePage() {
  const [data, setData] = useState<FinchState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [hideValues, setHideValues] = useState(false);
  const [modal, setModal] = useState<EditorModal | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadLocalState<FinchState>()
      .then((saved) => {
        if (saved) {
          const migrated = { ...saved, language: saved.language ?? "pt" as Language };
          setData(migrated);
          if (!saved.language) void saveLocalState(migrated);
        }
        setUnlocked(sessionStorage.getItem("finch-unlocked") === "true");
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = data?.theme ?? "light";
    document.documentElement.lang = data?.language === "en" ? "en" : "pt-BR";
  }, [data?.theme, data?.language]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const commit = (next: FinchState, message?: string) => {
    setData(next);
    void saveLocalState(next);
    if (message) setToast(message);
  };

  if (!hydrated) return <LoadingScreen />;
  if (!data) return <Onboarding onComplete={(next) => { setData(next); setUnlocked(true); sessionStorage.setItem("finch-unlocked", "true"); }} />;
  if (!unlocked) return <LockScreen profile={data.profile} language={data.language} onUnlock={() => { setUnlocked(true); sessionStorage.setItem("finch-unlocked", "true"); }} />;

  const language = data.language;
  const c = copy[language];
  const expenseMetrics = calculateExpenseMetrics(data.profile, data.expenses);
  const portfolioMetrics = calculatePortfolioMetrics(data.assets);
  const navigation = [
    { id: "dashboard" as Tab, label: c.nav.home, icon: Home },
    { id: "portfolio" as Tab, label: c.nav.portfolio, icon: BriefcaseBusiness },
    { id: "expenses" as Tab, label: c.nav.expenses, icon: ReceiptText },
    { id: "profile" as Tab, label: c.nav.profile, icon: UserRound },
  ];

  const lock = () => {
    sessionStorage.removeItem("finch-unlocked");
    setUnlocked(false);
  };

  return (
    <div className="app-shell">
      <Header language={language} onHome={() => setActiveTab("dashboard")} onLock={lock} />

      <main className="main-content">
        {activeTab === "dashboard" && <Dashboard data={data} hideValues={hideValues} onToggleValues={() => setHideValues((current) => !current)} onNavigate={setActiveTab} />}
        {activeTab === "portfolio" && (
          <Portfolio
            data={data}
            metrics={portfolioMetrics}
            onAdd={() => setModal({ type: "asset" })}
            onEdit={(item) => setModal({ type: "asset", item })}
            onDelete={(item) => {
              if (window.confirm(c.portfolio.removeConfirm.replace("{ticker}", item.ticker))) {
                commit({ ...data, assets: data.assets.filter((asset) => asset.id !== item.id) }, c.toast.assetRemoved);
              }
            }}
          />
        )}
        {activeTab === "expenses" && (
          <Expenses
            data={data}
            metrics={expenseMetrics}
            onAdd={() => setModal({ type: "expense" })}
            onEdit={(item) => setModal({ type: "expense", item })}
            onDelete={(item) => {
              if (window.confirm(c.expenses.removeConfirm.replace("{name}", item.name))) {
                commit({ ...data, expenses: data.expenses.filter((expense) => expense.id !== item.id) }, c.toast.expenseRemoved);
              }
            }}
            onTogglePaid={(id) => {
              const expenses = data.expenses.map((expense) => expense.id === id ? { ...expense, paid: !expense.paid } : expense);
              commit({ ...data, expenses }, c.toast.expenseUpdated);
            }}
          />
        )}
        {activeTab === "profile" && <ProfilePage data={data} onSave={commit} onLock={lock} />}
      </main>

      <nav className="mobile-navigation" aria-label={c.nav.label}>
        {navigation.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}><Icon size={20} strokeWidth={2.2} /><span>{item.label}</span></button>;
        })}
      </nav>

      {modal?.type === "expense" && <ExpenseModal language={language} initial={modal.item} onClose={() => setModal(null)} onSave={(expense) => { const exists = data.expenses.some((item) => item.id === expense.id); const expenses = exists ? data.expenses.map((item) => item.id === expense.id ? expense : item) : [...data.expenses, expense]; commit({ ...data, expenses }, exists ? c.toast.expenseUpdated : c.toast.expenseAdded); setModal(null); }} />}
      {modal?.type === "asset" && <AssetModal language={language} initial={modal.item} onClose={() => setModal(null)} onSave={(asset) => { const exists = data.assets.some((item) => item.id === asset.id); const assets = exists ? data.assets.map((item) => item.id === asset.id ? asset : item) : [...data.assets, asset]; commit({ ...data, assets }, exists ? c.toast.assetUpdated : c.toast.assetAdded); setModal(null); }} />}
      {toast && <div className="toast"><Check size={18} /> {toast}</div>}
    </div>
  );
}

function Header({ language, onHome, onLock }: { language: Language; onHome: () => void; onLock: () => void }) {
  const c = copy[language];
  return <header className="topbar"><button className="brand" onClick={onHome} aria-label={c.nav.home}><span className="brand-mark"><Sparkles size={18} /></span><span>Finch</span></button><button className="avatar-button" onClick={onLock} aria-label={c.profile.lock}><LockKeyhole size={17} /></button></header>;
}

function LoadingScreen() {
  return <div className="loading-screen"><span className="brand-mark large"><Sparkles size={26} /></span><strong>Finch</strong><div className="loading-line" /></div>;
}

function Onboarding({ onComplete }: { onComplete: (state: FinchState) => void }) {
  const [language, setLanguage] = useState<Language>("pt");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", salary: "", extraIncome: "", payday: "", pin: "", confirmPin: "", demo: true });
  const c = copy[language];

  const finish = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{4,6}$/.test(form.pin)) return setError(c.onboarding.pinLengthError);
    if (form.pin !== form.confirmPin) return setError(c.onboarding.pinMatchError);
    const pinSalt = createSalt();
    const profile: Profile = { name: form.name.trim(), salary: Number(form.salary), extraIncome: Number(form.extraIncome) || 0, payday: form.payday ? Number(form.payday) : undefined, pinSalt, pinHash: await hashPin(form.pin, pinSalt) };
    const next: FinchState = { schemaVersion: 1, profile, expenses: form.demo ? createDemoExpenses(language) : [], assets: form.demo ? demoAssets : [], theme: "light", language };
    await saveLocalState(next);
    onComplete(next);
  };

  return (
    <div className="auth-layout">
      <section className="auth-panel">
        <div className="auth-top"><div className="mobile-auth-brand"><span className="brand-mark"><Sparkles size={17} /></span><strong>Finch</strong></div><LanguageSwitch language={language} onChange={setLanguage} compact /></div>
        <div className="onboarding-intro"><span className="eyebrow">{c.onboarding.tagline}</span><div className="privacy-pill"><ShieldCheck size={16} /> {c.onboarding.privacy}</div></div>
        <div className="step-indicator"><span className={step >= 1 ? "active" : ""} /><span className={step >= 2 ? "active" : ""} /></div>
        {step === 1 ? (
          <form className="auth-form" onSubmit={(event) => { event.preventDefault(); if (form.name && Number(form.salary) > 0) setStep(2); }}>
            <span className="eyebrow">{c.onboarding.firstAccess}</span><h1>{c.onboarding.title}</h1><p>{c.onboarding.intro}</p>
            <label>{c.onboarding.nameQuestion}<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={c.onboarding.namePlaceholder} /></label>
            <label>{c.onboarding.salary}<input required min="1" step="0.01" type="number" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} placeholder="R$ 0,00" /></label>
            <label>{c.onboarding.extraIncome} <small>{c.common.optional}</small><input min="0" step="0.01" type="number" value={form.extraIncome} onChange={(event) => setForm({ ...form, extraIncome: event.target.value })} placeholder="R$ 0,00" /></label>
            <label>{c.onboarding.payday} <small>{c.common.optional}</small><input min="1" max="31" type="number" value={form.payday} onChange={(event) => setForm({ ...form, payday: event.target.value })} placeholder={c.onboarding.paydayPlaceholder} /></label>
            <button className="primary-button" type="submit">{c.onboarding.continue} <ChevronRight size={18} /></button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={finish}>
            <button type="button" className="back-link" onClick={() => setStep(1)}>← {c.onboarding.back}</button><span className="eyebrow">{c.onboarding.protection}</span><h1>{c.onboarding.pinTitle}</h1><p>{c.onboarding.pinIntro}</p>
            <label>{c.onboarding.pin}<input required inputMode="numeric" maxLength={6} type="password" value={form.pin} onChange={(event) => setForm({ ...form, pin: event.target.value.replace(/\D/g, "") })} placeholder={c.onboarding.pinPlaceholder} /></label>
            <label>{c.onboarding.confirmPin}<input required inputMode="numeric" maxLength={6} type="password" value={form.confirmPin} onChange={(event) => setForm({ ...form, confirmPin: event.target.value.replace(/\D/g, "") })} placeholder={c.onboarding.confirmPlaceholder} /></label>
            <label className="demo-choice"><input type="checkbox" checked={form.demo} onChange={(event) => setForm({ ...form, demo: event.target.checked })} /><span><strong>{c.onboarding.demoTitle}</strong><small>{c.onboarding.demoDescription}</small></span></label>
            {error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">{c.onboarding.enter} <ArrowUpRight size={18} /></button>
          </form>
        )}
      </section>
    </div>
  );
}

function LockScreen({ profile, language, onUnlock }: { profile: Profile; language: Language; onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const c = copy[language];
  const unlock = async (event: FormEvent) => { event.preventDefault(); if ((await hashPin(pin, profile.pinSalt)) === profile.pinHash) onUnlock(); else { setError(c.lock.incorrect); setPin(""); } };
  return <div className="lock-screen"><div className="lock-card"><span className="brand-mark large"><LockKeyhole size={25} /></span><span className="eyebrow">{c.lock.welcome}</span><h1>{c.lock.hello}, {profile.name.split(" ")[0]}</h1><p>{c.lock.description}</p><form onSubmit={unlock}><input autoFocus aria-label="PIN" inputMode="numeric" maxLength={6} type="password" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="••••" />{error && <span className="form-error">{error}</span>}<button className="primary-button" type="submit" disabled={pin.length < 4}>{c.lock.unlock}</button></form><small><ShieldCheck size={15} /> {c.lock.protected}</small></div></div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Dashboard({ data, hideValues, onToggleValues, onNavigate }: { data: FinchState; hideValues: boolean; onToggleValues: () => void; onNavigate: (tab: Tab) => void }) {
  const language = data.language;
  const c = copy[language];
  const metrics = calculateExpenseMetrics(data.profile, data.expenses);
  const portfolio = calculatePortfolioMetrics(data.assets);
  const recommendations = buildRecommendations(data.profile, data.expenses, data.assets, language);
  const projection = buildProjection(data.profile, data.expenses, language);
  const display = (value: number) => hideValues ? "R$ •••••" : formatBRL(value);
  const categories = Object.entries(data.expenses.reduce<Record<string, number>>((result, expense) => ({ ...result, [expense.category]: (result[expense.category] ?? 0) + expense.amount }), {})).sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(...categories.map(([, value]) => value), 1);
  const date = new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en-US", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return <>
    <PageHeading eyebrow={date} title={`${c.dashboard.greeting}, ${data.profile.name.split(" ")[0]}`} description={c.dashboard.description} action={<button className="secondary-button" onClick={() => onNavigate("expenses")}><Plus size={17} /> {c.dashboard.newExpense}</button>} />
    <section className="dashboard-grid">
      <article className="balance-card"><div className="balance-top"><span>{c.dashboard.balance}</span><button onClick={onToggleValues} aria-label={hideValues ? c.dashboard.showValues : c.dashboard.hideValues}>{hideValues ? <Eye size={18} /> : <EyeOff size={18} />}</button></div><strong>{display(metrics.balance)}</strong><div className="balance-change"><span className={metrics.balance >= 0 ? "positive" : "negative"}>{metrics.balance >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {percentage(Math.abs(metrics.savingsRate), language)}</span><span>{c.dashboard.freeIncome}</span></div><div className="balance-footer"><div><small>{c.dashboard.income}</small><b>{display(metrics.income)}</b></div><div><small>{c.dashboard.expenses}</small><b>{display(metrics.total)}</b></div></div></article>
      <article className="kpi-card"><span className="metric-icon purple"><WalletCards size={19} /></span><small>{c.dashboard.invested}</small><strong>{display(portfolio.current)}</strong><span className={portfolio.profit >= 0 ? "metric-trend positive" : "metric-trend negative"}>{portfolio.profit >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}{percentage(portfolio.profitability, language)}</span></article>
      <article className="kpi-card"><span className="metric-icon mint"><Target size={19} /></span><small>{c.dashboard.savingsRate}</small><strong>{percentage(metrics.savingsRate, language)}</strong><span className="metric-caption">{c.dashboard.suggestedGoal}</span></article>
      <article className="kpi-card wide"><span className="metric-icon amber"><CalendarDays size={19} /></span><small>{c.dashboard.investmentIncome}</small><strong>{display(portfolio.monthlyIncome)}</strong><span className="metric-caption">{c.dashboard.monthlyAverage}</span></article>
    </section>
    <section className="content-stack">
      <article className="panel"><div className="panel-title"><div><span className="eyebrow">{c.dashboard.distribution}</span><h2>{c.dashboard.categories}</h2></div><button className="text-button" onClick={() => onNavigate("expenses")}>{c.dashboard.details} <ChevronRight size={16} /></button></div>{categories.length ? <div className="category-chart">{categories.map(([category, value]) => <div className="category-row" key={category}><div className="category-label"><span className="category-dot" style={{ background: expenseColors[category] ?? expenseColors.Outros }} /><span>{optionLabel(language, category)}</span><strong>{display(value)}</strong></div><div className="progress-track"><span style={{ width: `${(value / maxCategory) * 100}%`, background: expenseColors[category] ?? expenseColors.Outros }} /></div></div>)}</div> : <EmptyState icon={<ReceiptText />} title={c.dashboard.noExpenses} description={c.dashboard.noExpensesDescription} />}</article>
      <article className="panel"><div className="panel-title"><div><span className="eyebrow">{c.dashboard.forecast}</span><h2>{c.dashboard.nextMonths}</h2></div><span className="status-pill">{c.dashboard.localEstimate}</span></div><div className="projection-total"><small>{c.dashboard.estimatedBalance}</small><strong>{display(projection[11].value)}</strong></div><div className="projection-chart" aria-label={c.dashboard.nextMonths}>{projection.map((item) => { const max = Math.max(...projection.map((point) => Math.abs(point.value)), 1); return <div className="projection-column" key={item.month}><span className={item.value < 0 ? "negative-bar" : ""} style={{ height: `${Math.max(10, (Math.abs(item.value) / max) * 100)}%` }} /><small>{item.month}</small></div>; })}</div></article>
      <article className="panel insights-panel"><div className="panel-title"><div><span className="eyebrow">{c.dashboard.insights}</span><h2>{c.dashboard.recommendations}</h2></div><span className="metric-icon purple"><Lightbulb size={19} /></span></div><div className="insights-grid">{recommendations.map((item) => <div className={`insight ${item.tone}`} key={item.title}><span>{item.tone === "positive" ? <TrendingUp size={18} /> : item.tone === "attention" ? <Target size={18} /> : <Sparkles size={18} />}</span><div><strong>{item.title}</strong><p>{item.description}</p></div></div>)}</div></article>
    </section>
  </>;
}

function Portfolio({ data, metrics, onAdd, onEdit, onDelete }: { data: FinchState; metrics: ReturnType<typeof calculatePortfolioMetrics>; onAdd: () => void; onEdit: (asset: Asset) => void; onDelete: (asset: Asset) => void }) {
  const c = copy[data.language];
  return <><PageHeading eyebrow={c.portfolio.eyebrow} title={c.portfolio.title} description={c.portfolio.description} action={<button className="primary-button compact" onClick={onAdd}><Plus size={17} /> {c.portfolio.add}</button>} /><section className="stat-grid"><StatCard label={c.portfolio.currentValue} value={formatBRL(metrics.current)} icon={<BriefcaseBusiness />} /><StatCard label={c.portfolio.invested} value={formatBRL(metrics.invested)} icon={<CircleDollarSign />} /><StatCard label={c.portfolio.result} value={formatBRL(metrics.profit)} trend={percentage(metrics.profitability, data.language)} positive={metrics.profit >= 0} icon={<TrendingUp />} /><StatCard label={c.portfolio.annualIncome} value={formatBRL(metrics.annualIncome)} caption={c.portfolio.registeredProjection} icon={<CalendarDays />} /></section><section className="panel asset-panel"><div className="panel-title"><div><span className="eyebrow">{c.portfolio.positions}</span><h2>{c.portfolio.registeredAssets}</h2></div><span className="status-pill">{c.portfolio.manualUpdate}</span></div>{data.assets.length ? <div className="asset-list">{data.assets.map((asset) => { const current = asset.currentPrice * asset.quantity; const invested = asset.purchasePrice * asset.quantity; const result = invested ? ((current - invested) / invested) * 100 : 0; return <article className="asset-row" key={asset.id}><div className="asset-main"><div className="ticker-badge">{asset.ticker.slice(0, 2)}</div><div className="asset-name"><strong>{asset.ticker}</strong><span>{asset.name} · {optionLabel(data.language, asset.category)}</span></div><span className={result >= 0 ? "asset-result positive" : "asset-result negative"}>{result >= 0 ? "+" : ""}{percentage(result, data.language)}</span></div><div className="asset-details"><div><small>{c.portfolio.quantity}</small><strong>{asset.quantity}</strong></div><div><small>{c.portfolio.currentPrice}</small><strong>{formatBRL(asset.currentPrice)}</strong></div><div><small>{c.portfolio.position}</small><strong>{formatBRL(current)}</strong></div></div><div className="row-actions full"><button className="row-action" onClick={() => onEdit(asset)}><Pencil size={16} /> {c.common.edit}</button><button className="row-action danger" onClick={() => onDelete(asset)}><Trash2 size={16} /> {c.common.remove}</button></div></article>; })}</div> : <EmptyState icon={<BriefcaseBusiness />} title={c.portfolio.emptyTitle} description={c.portfolio.emptyDescription} action={<button className="primary-button compact" onClick={onAdd}>{c.portfolio.add}</button>} />}</section></>;
}

function Expenses({ data, metrics, onAdd, onTogglePaid, onEdit, onDelete }: { data: FinchState; metrics: ReturnType<typeof calculateExpenseMetrics>; onAdd: () => void; onTogglePaid: (id: string) => void; onEdit: (expense: Expense) => void; onDelete: (expense: Expense) => void }) {
  const c = copy[data.language];
  const sorted = [...data.expenses].sort((a, b) => Number(a.paid) - Number(b.paid));
  return <><PageHeading eyebrow={c.expenses.eyebrow} title={c.expenses.title} description={c.expenses.description} action={<button className="primary-button compact" onClick={onAdd}><Plus size={17} /> {c.expenses.add}</button>} /><section className="stat-grid"><StatCard label={c.expenses.monthTotal} value={formatBRL(metrics.total)} icon={<ReceiptText />} /><StatCard label={c.expenses.fixed} value={formatBRL(metrics.fixed)} caption={`${percentage(metrics.income ? (metrics.fixed / metrics.income) * 100 : 0, data.language)} ${c.expenses.ofIncome}`} icon={<CalendarDays />} /><StatCard label={c.expenses.extras} value={formatBRL(metrics.extras)} icon={<Sparkles />} /><StatCard label={c.expenses.commitment} value={percentage(metrics.commitment, data.language)} trend={metrics.commitment <= 80 ? c.expenses.withinLimit : c.expenses.review} positive={metrics.commitment <= 80} icon={<Target />} /></section><section className="content-stack"><article className="panel expense-list-panel"><div className="panel-title"><div><span className="eyebrow">{c.expenses.thisMonth}</span><h2>{c.expenses.bills}</h2></div><span className="status-pill">{data.expenses.filter((expense) => expense.paid).length}/{data.expenses.length} {c.expenses.paidCount}</span></div>{sorted.length ? <div className="expense-list">{sorted.map((expense) => <article className="expense-row" key={expense.id}><div className="expense-main"><button className={`paid-toggle ${expense.paid ? "paid" : ""}`} onClick={() => onTogglePaid(expense.id)} aria-label={expense.paid ? c.expenses.markPending : c.expenses.markPaid}>{expense.paid && <Check size={15} />}</button><span className="expense-symbol" style={{ background: `${expenseColors[expense.category] ?? expenseColors.Outros}20`, color: expenseColors[expense.category] ?? expenseColors.Outros }}><ReceiptText size={18} /></span><div className="expense-name"><strong>{expense.name}</strong><span>{optionLabel(data.language, expense.category)} · {expense.kind === "fixed" ? c.common.fixed : c.common.extra}</span></div><strong>{formatBRL(expense.amount)}</strong></div><div className="expense-meta"><span>{expense.dueDay ? `${c.common.day} ${expense.dueDay}` : c.common.noDueDate}</span><span className={`expense-status ${expense.paid ? "paid" : "pending"}`}>{expense.paid ? c.common.paid : c.common.pending}</span></div><div className="row-actions full"><button className="row-action" onClick={() => onEdit(expense)}><Pencil size={16} /> {c.common.edit}</button><button className="row-action danger" onClick={() => onDelete(expense)}><Trash2 size={16} /> {c.common.remove}</button></div></article>)}</div> : <EmptyState icon={<ReceiptText />} title={c.expenses.emptyTitle} description={c.expenses.emptyDescription} />}</article><article className="panel budget-card"><span className="metric-icon mint"><Target size={20} /></span><span className="eyebrow">{c.expenses.budget}</span><h2>{c.expenses.basedOnIncome}</h2><p>{c.expenses.budgetDescription.replace("{income}", formatBRL(metrics.income))}</p><div className="budget-split"><BudgetLine label={c.expenses.essentials} value="50%" amount={metrics.income * 0.5} color="#7357e8" language={data.language} /><BudgetLine label={c.expenses.lifestyle} value="30%" amount={metrics.income * 0.3} color="#ffb95c" language={data.language} /><BudgetLine label={c.expenses.reserve} value="20%" amount={metrics.income * 0.2} color="#55c8a5" language={data.language} /></div></article></section></>;
}

function StatCard({ label, value, caption, trend, positive = true, icon }: { label: string; value: string; caption?: string; trend?: string; positive?: boolean; icon: React.ReactNode }) {
  return <article className="stat-card"><span className="metric-icon purple">{icon}</span><small>{label}</small><strong>{value}</strong>{trend && <span className={positive ? "metric-trend positive" : "metric-trend negative"}>{trend}</span>}{caption && <span className="metric-caption">{caption}</span>}</article>;
}

function BudgetLine({ label, value, amount, color, language }: { label: string; value: string; amount: number; color: string; language: Language }) {
  return <div className="budget-line"><div><span><i style={{ background: color }} />{label}</span><strong>{value}</strong></div><small>{formatBRL(amount)} {copy[language].common.perMonth}</small></div>;
}

function LanguageSwitch({ language, onChange, compact = false }: { language: Language; onChange: (language: Language) => void; compact?: boolean }) {
  return <div className={`language-switch ${compact ? "compact" : ""}`}><button type="button" className={language === "pt" ? "active" : ""} onClick={() => onChange("pt")}>PT</button><button type="button" className={language === "en" ? "active" : ""} onClick={() => onChange("en")}>EN</button></div>;
}

function ProfilePage({ data, onSave, onLock }: { data: FinchState; onSave: (state: FinchState, message?: string) => void; onLock: () => void }) {
  const c = copy[data.language];
  const [profile, setProfile] = useState({ name: data.profile.name, salary: String(data.profile.salary), extraIncome: String(data.profile.extraIncome), payday: data.profile.payday ? String(data.profile.payday) : "" });
  const [pin, setPin] = useState({ current: "", next: "", confirm: "" });
  const [pinError, setPinError] = useState("");
  const saveProfile = (event: FormEvent) => { event.preventDefault(); onSave({ ...data, profile: { ...data.profile, name: profile.name, salary: Number(profile.salary), extraIncome: Number(profile.extraIncome) || 0, payday: profile.payday ? Number(profile.payday) : undefined } }, c.toast.profileUpdated); };
  const changePin = async (event: FormEvent) => { event.preventDefault(); setPinError(""); if ((await hashPin(pin.current, data.profile.pinSalt)) !== data.profile.pinHash) return setPinError(c.profile.wrongPin); if (!/^\d{4,6}$/.test(pin.next)) return setPinError(c.profile.invalidPin); if (pin.next !== pin.confirm) return setPinError(c.profile.pinMismatch); const pinSalt = createSalt(); const pinHash = await hashPin(pin.next, pinSalt); onSave({ ...data, profile: { ...data.profile, pinSalt, pinHash } }, c.toast.pinUpdated); setPin({ current: "", next: "", confirm: "" }); };
  const download = (type: "json" | "csv") => { let content: string; let mime: string; if (type === "json") { content = JSON.stringify(data, null, 2); mime = "application/json"; } else { const rows = data.language === "pt" ? [["tipo", "nome", "categoria", "valor", "detalhe"]] : [["type", "name", "category", "value", "detail"]]; rows.push(...data.expenses.map((item) => [data.language === "pt" ? "despesa" : "expense", item.name, optionLabel(data.language, item.category), String(item.amount), item.kind]), ...data.assets.map((item) => [data.language === "pt" ? "ativo" : "asset", item.ticker, optionLabel(data.language, item.category), String(item.currentPrice * item.quantity), `${item.quantity}`])); content = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n"); mime = "text/csv"; } const url = URL.createObjectURL(new Blob([content], { type: mime })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `finch-backup.${type}`; anchor.click(); URL.revokeObjectURL(url); };

  return <><PageHeading eyebrow={c.profile.eyebrow} title={c.profile.title} description={c.profile.description} /><section className="profile-grid"><article className="panel settings-card"><div className="panel-title"><div><span className="eyebrow">{c.profile.language}</span><h2>{c.profile.languageTitle}</h2></div><span className="metric-icon purple"><Languages size={19} /></span></div><p>{c.profile.languageDescription}</p><div className="language-options"><button className={data.language === "pt" ? "active" : ""} onClick={() => onSave({ ...data, language: "pt" }, pt.toast.languageUpdated)}><span>PT</span><strong>{c.profile.portuguese}</strong>{data.language === "pt" && <Check size={18} />}</button><button className={data.language === "en" ? "active" : ""} onClick={() => onSave({ ...data, language: "en" }, en.toast.languageUpdated)}><span>EN</span><strong>{c.profile.english}</strong>{data.language === "en" && <Check size={18} />}</button></div></article><form className="panel settings-card" onSubmit={saveProfile}><div className="panel-title"><div><span className="eyebrow">{c.profile.financialData}</span><h2>{c.profile.personalInfo}</h2></div><span className="metric-icon purple"><UserRound size={19} /></span></div><label>{c.profile.name}<input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label><label>{c.profile.salary}<input required min="1" step="0.01" type="number" value={profile.salary} onChange={(event) => setProfile({ ...profile, salary: event.target.value })} /></label><label>{c.profile.extraIncome} <small>{c.common.optional}</small><input min="0" step="0.01" type="number" value={profile.extraIncome} onChange={(event) => setProfile({ ...profile, extraIncome: event.target.value })} /></label><label>{c.profile.payday} <small>{c.common.optional}</small><input min="1" max="31" type="number" value={profile.payday} onChange={(event) => setProfile({ ...profile, payday: event.target.value })} /></label><button className="primary-button compact" type="submit">{c.common.save}</button></form><form className="panel settings-card" onSubmit={changePin}><div className="panel-title"><div><span className="eyebrow">{c.profile.security}</span><h2>{c.profile.changePin}</h2></div><span className="metric-icon mint"><LockKeyhole size={19} /></span></div><label>{c.profile.currentPin}<input required inputMode="numeric" maxLength={6} type="password" value={pin.current} onChange={(event) => setPin({ ...pin, current: event.target.value.replace(/\D/g, "") })} /></label><label>{c.profile.newPin}<input required inputMode="numeric" maxLength={6} type="password" value={pin.next} onChange={(event) => setPin({ ...pin, next: event.target.value.replace(/\D/g, "") })} /></label><label>{c.profile.confirm}<input required inputMode="numeric" maxLength={6} type="password" value={pin.confirm} onChange={(event) => setPin({ ...pin, confirm: event.target.value.replace(/\D/g, "") })} /></label>{pinError && <p className="form-error">{pinError}</p>}<button className="secondary-button" type="submit">{c.profile.updatePin}</button></form><article className="panel settings-card"><div className="panel-title"><div><span className="eyebrow">{c.profile.appearance}</span><h2>{c.profile.theme}</h2></div>{data.theme === "light" ? <Sun size={21} /> : <Moon size={21} />}</div><p>{c.profile.themeDescription}</p><div className="theme-switch"><button className={data.theme === "light" ? "active" : ""} onClick={() => onSave({ ...data, theme: "light" })}><Sun size={18} /> {c.profile.light}</button><button className={data.theme === "dark" ? "active" : ""} onClick={() => onSave({ ...data, theme: "dark" })}><Moon size={18} /> {c.profile.dark}</button></div></article><article className="panel settings-card"><div className="panel-title"><div><span className="eyebrow">{c.profile.backup}</span><h2>{c.profile.export}</h2></div><span className="metric-icon amber"><Download size={19} /></span></div><p>{c.profile.exportDescription}</p><div className="export-actions"><button className="secondary-button" onClick={() => download("json")}><FileJson size={18} /> {c.profile.exportJson}</button><button className="secondary-button" onClick={() => download("csv")}><Download size={18} /> {c.profile.exportCsv}</button></div></article></section><button className="lock-action" onClick={onLock}><LogOut size={18} /> {c.profile.lock}</button></>;
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{description}</p>{action}</div>;
}

function ModalShell({ language, eyebrow, title, description, onClose, children }: { language: Language; eyebrow: string; title: string; description: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><span className="eyebrow">{eyebrow}</span><h2 id="modal-title">{title}</h2><p>{description}</p></div><button className="icon-button" onClick={onClose} aria-label={copy[language].common.close}><X size={19} /></button></div>{children}</div></div>;
}

function ExpenseModal({ language, initial, onClose, onSave }: { language: Language; initial?: Expense; onClose: () => void; onSave: (expense: Expense) => void }) {
  const c = copy[language];
  const [form, setForm] = useState({ name: initial?.name ?? "", category: initial?.category ?? "Moradia", amount: initial ? String(initial.amount) : "", kind: initial?.kind ?? "fixed" as Expense["kind"], dueDay: initial?.dueDay ? String(initial.dueDay) : "", paid: initial?.paid ?? false });
  const categories = ["Moradia", "Casa", "Alimentação", "Saúde", "Lazer", "Transporte", "Outros"];
  return <ModalShell language={language} eyebrow={c.expenseForm.eyebrow} title={initial ? c.expenseForm.editTitle : c.expenseForm.newTitle} description={c.expenseForm.description} onClose={onClose}><form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, id: initial?.id ?? crypto.randomUUID(), amount: Number(form.amount), dueDay: form.dueDay ? Number(form.dueDay) : undefined }); }}><label>{c.expenseForm.name}<input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={c.expenseForm.namePlaceholder} /></label><label>{c.expenseForm.category}<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option value={item} key={item}>{optionLabel(language, item)}</option>)}</select></label><label>{c.expenseForm.amount}<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="R$ 0,00" /></label><label>{c.expenseForm.type}<select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as Expense["kind"] })}><option value="fixed">{c.expenseForm.fixed}</option><option value="extra">{c.expenseForm.extra}</option></select></label><label>{c.expenseForm.dueDay} <small>{c.common.optional}</small><input min="1" max="31" type="number" value={form.dueDay} onChange={(event) => setForm({ ...form, dueDay: event.target.value })} /></label><label className="demo-choice"><input type="checkbox" checked={form.paid} onChange={(event) => setForm({ ...form, paid: event.target.checked })} /><span><strong>{c.expenseForm.paid}</strong><small>{c.expenseForm.paidDescription}</small></span></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>{c.common.cancel}</button><button type="submit" className="primary-button compact">{initial ? c.common.save : c.expenseForm.add}</button></div></form></ModalShell>;
}

function AssetModal({ language, initial, onClose, onSave }: { language: Language; initial?: Asset; onClose: () => void; onSave: (asset: Asset) => void }) {
  const c = copy[language];
  const [form, setForm] = useState({ ticker: initial?.ticker ?? "", name: initial?.name ?? "", category: initial?.category ?? "Ações", quantity: initial ? String(initial.quantity) : "", purchasePrice: initial ? String(initial.purchasePrice) : "", currentPrice: initial ? String(initial.currentPrice) : "", incomeType: initial?.incomeType ?? "Dividendos", incomePerShare: initial ? String(initial.incomePerShare) : "", frequency: initial?.frequency ?? "quarterly" as Frequency });
  const categories = ["Ações", "FII", "ETF", "Renda fixa", "Outro"];
  const incomeTypes = [{ value: "Dividendos", label: c.options.dividends }, { value: "Juros sobre capital", label: c.options.interest }, { value: "Rendimentos", label: c.options.distributions }, { value: "Outro", label: c.options.other }];
  const frequencies: { value: Frequency; label: string }[] = [{ value: "monthly", label: c.options.monthly }, { value: "bimonthly", label: c.options.bimonthly }, { value: "quarterly", label: c.options.quarterly }, { value: "semiannual", label: c.options.semiannual }, { value: "annual", label: c.options.annual }, { value: "eventual", label: c.options.eventual }];
  return <ModalShell language={language} eyebrow={c.assetForm.eyebrow} title={initial ? c.assetForm.editTitle : c.assetForm.newTitle} description={c.assetForm.description} onClose={onClose}><form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, id: initial?.id ?? crypto.randomUUID(), ticker: form.ticker.toUpperCase(), quantity: Number(form.quantity), purchasePrice: Number(form.purchasePrice), currentPrice: Number(form.currentPrice), incomePerShare: Number(form.incomePerShare) || 0 }); }}><label>{c.assetForm.ticker}<input autoFocus required value={form.ticker} onChange={(event) => setForm({ ...form, ticker: event.target.value })} placeholder={c.assetForm.tickerPlaceholder} /></label><label>{c.assetForm.name}<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={c.assetForm.namePlaceholder} /></label><label>{c.assetForm.category}<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option value={item} key={item}>{optionLabel(language, item)}</option>)}</select></label><label>{c.assetForm.quantity}<input required min="0.0001" step="0.0001" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label><label>{c.assetForm.purchasePrice}<input required min="0" step="0.01" type="number" value={form.purchasePrice} onChange={(event) => setForm({ ...form, purchasePrice: event.target.value })} /></label><label>{c.assetForm.currentPrice}<input required min="0" step="0.01" type="number" value={form.currentPrice} onChange={(event) => setForm({ ...form, currentPrice: event.target.value })} /></label><label>{c.assetForm.incomeType}<select value={form.incomeType} onChange={(event) => setForm({ ...form, incomeType: event.target.value })}>{incomeTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label>{c.assetForm.incomePerShare} <small>{c.common.optional}</small><input min="0" step="0.01" type="number" value={form.incomePerShare} onChange={(event) => setForm({ ...form, incomePerShare: event.target.value })} /></label><label>{c.assetForm.frequency}<select value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value as Frequency })}>{frequencies.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>{c.common.cancel}</button><button type="submit" className="primary-button compact">{initial ? c.common.save : c.assetForm.add}</button></div></form></ModalShell>;
}
