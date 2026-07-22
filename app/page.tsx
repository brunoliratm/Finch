"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
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
  Lightbulb,
  LockKeyhole,
  LogOut,
  Moon,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
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

type Tab = "dashboard" | "portfolio" | "expenses" | "profile";

type FinchState = {
  schemaVersion: 1;
  profile: Profile;
  expenses: Expense[];
  assets: Asset[];
  theme: "light" | "dark";
};

const navigation = [
  { id: "dashboard" as Tab, label: "Início", icon: Home },
  { id: "portfolio" as Tab, label: "Carteira", icon: BriefcaseBusiness },
  { id: "expenses" as Tab, label: "Despesas", icon: ReceiptText },
  { id: "profile" as Tab, label: "Perfil", icon: UserRound },
];

const demoExpenses: Expense[] = [
  { id: "exp-1", name: "Aluguel", category: "Moradia", amount: 1650, kind: "fixed", dueDay: 8, paid: true },
  { id: "exp-2", name: "Energia", category: "Casa", amount: 238.4, kind: "fixed", dueDay: 12, paid: true },
  { id: "exp-3", name: "Internet", category: "Casa", amount: 119.9, kind: "fixed", dueDay: 15, paid: false },
  { id: "exp-4", name: "Supermercado", category: "Alimentação", amount: 742.35, kind: "extra", paid: true },
  { id: "exp-5", name: "Academia", category: "Saúde", amount: 109.9, kind: "fixed", dueDay: 20, paid: false },
  { id: "exp-6", name: "Cinema", category: "Lazer", amount: 84, kind: "extra", paid: true },
];

const demoAssets: Asset[] = [
  { id: "asset-1", ticker: "PETR4", name: "Petrobras", category: "Ações", quantity: 25, purchasePrice: 34.2, currentPrice: 37.82, incomeType: "Dividendos", incomePerShare: 0.82, frequency: "quarterly" },
  { id: "asset-2", ticker: "MXRF11", name: "Maxi Renda", category: "FII", quantity: 70, purchasePrice: 10.18, currentPrice: 10.42, incomeType: "Rendimentos", incomePerShare: 0.1, frequency: "monthly" },
  { id: "asset-3", ticker: "BOVA11", name: "ETF Ibovespa", category: "ETF", quantity: 8, purchasePrice: 119.4, currentPrice: 124.9, incomeType: "Outro", incomePerShare: 0, frequency: "eventual" },
];

const expenseColors: Record<string, string> = {
  Moradia: "#7357e8",
  Casa: "#9a84ee",
  Alimentação: "#ffb95c",
  Saúde: "#55c8a5",
  Lazer: "#ff8797",
  Transporte: "#64a8f4",
  Outros: "#a7a6b4",
};

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

function percentage(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

export default function HomePage() {
  const [data, setData] = useState<FinchState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [hideValues, setHideValues] = useState(false);
  const [modal, setModal] = useState<"expense" | "asset" | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadLocalState<FinchState>()
      .then((saved) => {
        setData(saved);
        setUnlocked(sessionStorage.getItem("finch-unlocked") === "true");
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = data?.theme ?? "light";
  }, [data?.theme]);

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
  if (!unlocked) return <LockScreen profile={data.profile} onUnlock={() => { setUnlocked(true); sessionStorage.setItem("finch-unlocked", "true"); }} />;

  const expenseMetrics = calculateExpenseMetrics(data.profile, data.expenses);
  const portfolioMetrics = calculatePortfolioMetrics(data.assets);

  const lock = () => {
    sessionStorage.removeItem("finch-unlocked");
    setUnlocked(false);
  };

  return (
    <div className="app-shell">
      <Header activeTab={activeTab} onNavigate={setActiveTab} onLock={lock} />

      <main className="main-content">
        {activeTab === "dashboard" && (
          <Dashboard
            data={data}
            hideValues={hideValues}
            onToggleValues={() => setHideValues((current) => !current)}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "portfolio" && (
          <Portfolio data={data} metrics={portfolioMetrics} onAdd={() => setModal("asset")} />
        )}
        {activeTab === "expenses" && (
          <Expenses
            data={data}
            metrics={expenseMetrics}
            onAdd={() => setModal("expense")}
            onTogglePaid={(id) => {
              const expenses = data.expenses.map((expense) =>
                expense.id === id ? { ...expense, paid: !expense.paid } : expense,
              );
              commit({ ...data, expenses }, "Despesa atualizada");
            }}
          />
        )}
        {activeTab === "profile" && <ProfilePage data={data} onSave={commit} onLock={lock} />}
      </main>

      <nav className="mobile-navigation" aria-label="Navegação principal">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id)}>
              <Icon size={20} strokeWidth={2.2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {modal === "expense" && (
        <ExpenseModal
          onClose={() => setModal(null)}
          onSave={(expense) => {
            commit({ ...data, expenses: [...data.expenses, expense] }, "Despesa adicionada");
            setModal(null);
          }}
        />
      )}
      {modal === "asset" && (
        <AssetModal
          onClose={() => setModal(null)}
          onSave={(asset) => {
            commit({ ...data, assets: [...data.assets, asset] }, "Ativo adicionado");
            setModal(null);
          }}
        />
      )}
      {toast && <div className="toast"><Check size={18} /> {toast}</div>}
    </div>
  );
}

function Header({ activeTab, onNavigate, onLock }: { activeTab: Tab; onNavigate: (tab: Tab) => void; onLock: () => void }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate("dashboard")} aria-label="Ir para o início">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <span>Finch</span>
      </button>
      <nav className="desktop-navigation" aria-label="Navegação principal">
        {navigation.map((item) => (
          <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => onNavigate(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Notificações"><Bell size={19} /></button>
        <button className="avatar-button" onClick={onLock} aria-label="Bloquear Finch"><LockKeyhole size={17} /></button>
      </div>
    </header>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <span className="brand-mark large"><Sparkles size={26} /></span>
      <strong>Finch</strong>
      <div className="loading-line" />
    </div>
  );
}

function Onboarding({ onComplete }: { onComplete: (state: FinchState) => void }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", salary: "", extraIncome: "", payday: "", pin: "", confirmPin: "", demo: true });

  const finish = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{4,6}$/.test(form.pin)) return setError("Crie um PIN numérico de 4 a 6 dígitos.");
    if (form.pin !== form.confirmPin) return setError("Os PINs informados não são iguais.");
    const pinSalt = createSalt();
    const profile: Profile = {
      name: form.name.trim(),
      salary: Number(form.salary),
      extraIncome: Number(form.extraIncome) || 0,
      payday: form.payday ? Number(form.payday) : undefined,
      pinSalt,
      pinHash: await hashPin(form.pin, pinSalt),
    };
    const next: FinchState = {
      schemaVersion: 1,
      profile,
      expenses: form.demo ? demoExpenses : [],
      assets: form.demo ? demoAssets : [],
      theme: "light",
    };
    await saveLocalState(next);
    onComplete(next);
  };

  return (
    <div className="auth-layout">
      <section className="auth-visual">
        <div className="brand light"><span className="brand-mark"><Sparkles size={18} /></span><span>Finch</span></div>
        <div className="visual-copy">
          <span className="eyebrow light">Seu dinheiro, mais claro</span>
          <h1>Decisões melhores começam com uma visão completa.</h1>
          <p>Organize despesas, acompanhe investimentos e planeje os próximos 12 meses — tudo no seu dispositivo.</p>
        </div>
        <div className="privacy-pill"><ShieldCheck size={18} /> Seus dados não saem daqui</div>
      </section>
      <section className="auth-panel">
        <div className="mobile-auth-brand"><span className="brand-mark"><Sparkles size={17} /></span><strong>Finch</strong></div>
        <div className="step-indicator"><span className={step >= 1 ? "active" : ""} /><span className={step >= 2 ? "active" : ""} /></div>
        {step === 1 ? (
          <form className="auth-form" onSubmit={(event) => { event.preventDefault(); if (form.name && Number(form.salary) > 0) setStep(2); }}>
            <span className="eyebrow">Primeiro acesso</span>
            <h2>Vamos preparar seu espaço</h2>
            <p>Somente o essencial é obrigatório. Você poderá alterar tudo depois.</p>
            <label>Como devemos chamar você?<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Seu nome" /></label>
            <label>Salário mensal<input required min="1" step="0.01" type="number" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} placeholder="R$ 0,00" /></label>
            <div className="field-row">
              <label>Renda extra <small>Opcional</small><input min="0" step="0.01" type="number" value={form.extraIncome} onChange={(event) => setForm({ ...form, extraIncome: event.target.value })} placeholder="R$ 0,00" /></label>
              <label>Dia do pagamento <small>Opcional</small><input min="1" max="31" type="number" value={form.payday} onChange={(event) => setForm({ ...form, payday: event.target.value })} placeholder="Ex.: 5" /></label>
            </div>
            <button className="primary-button" type="submit">Continuar <ChevronRight size={18} /></button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={finish}>
            <button type="button" className="back-link" onClick={() => setStep(1)}>← Voltar</button>
            <span className="eyebrow">Proteção local</span>
            <h2>Crie seu PIN</h2>
            <p>Ele será solicitado quando você abrir novamente o Finch.</p>
            <label>PIN<input required inputMode="numeric" maxLength={6} type="password" value={form.pin} onChange={(event) => setForm({ ...form, pin: event.target.value.replace(/\D/g, "") })} placeholder="4 a 6 dígitos" /></label>
            <label>Confirme o PIN<input required inputMode="numeric" maxLength={6} type="password" value={form.confirmPin} onChange={(event) => setForm({ ...form, confirmPin: event.target.value.replace(/\D/g, "") })} placeholder="Repita seu PIN" /></label>
            <label className="demo-choice"><input type="checkbox" checked={form.demo} onChange={(event) => setForm({ ...form, demo: event.target.checked })} /><span><strong>Adicionar dados de demonstração</strong><small>Ideal para conhecer os gráficos e indicadores.</small></span></label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" type="submit">Entrar no Finch <ArrowUpRight size={18} /></button>
          </form>
        )}
      </section>
    </div>
  );
}

function LockScreen({ profile, onUnlock }: { profile: Profile; onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const unlock = async (event: FormEvent) => {
    event.preventDefault();
    if ((await hashPin(pin, profile.pinSalt)) === profile.pinHash) onUnlock();
    else { setError("PIN incorreto. Tente novamente."); setPin(""); }
  };

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <span className="brand-mark large"><LockKeyhole size={25} /></span>
        <span className="eyebrow">Bem-vindo de volta</span>
        <h1>Olá, {profile.name.split(" ")[0]}</h1>
        <p>Digite seu PIN para acessar seus dados financeiros.</p>
        <form onSubmit={unlock}>
          <input autoFocus aria-label="PIN" inputMode="numeric" maxLength={6} type="password" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="••••" />
          {error && <span className="form-error">{error}</span>}
          <button className="primary-button" type="submit" disabled={pin.length < 4}>Desbloquear</button>
        </form>
        <small><ShieldCheck size={15} /> Proteção local ativa</small>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Dashboard({ data, hideValues, onToggleValues, onNavigate }: { data: FinchState; hideValues: boolean; onToggleValues: () => void; onNavigate: (tab: Tab) => void }) {
  const metrics = calculateExpenseMetrics(data.profile, data.expenses);
  const portfolio = calculatePortfolioMetrics(data.assets);
  const recommendations = buildRecommendations(data.profile, data.expenses, data.assets);
  const projection = buildProjection(data.profile, data.expenses);
  const display = (value: number) => hideValues ? "R$ •••••" : formatBRL(value);
  const categories = Object.entries(data.expenses.reduce<Record<string, number>>((result, expense) => ({ ...result, [expense.category]: (result[expense.category] ?? 0) + expense.amount }), {})).sort((a, b) => b[1] - a[1]);
  const maxCategory = Math.max(...categories.map(([, value]) => value), 1);
  const date = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <>
      <PageHeading eyebrow={date} title={`Olá, ${data.profile.name.split(" ")[0]}`} description="Aqui está o panorama das suas finanças neste mês." action={<button className="secondary-button" onClick={() => onNavigate("expenses")}><Plus size={17} /> Nova despesa</button>} />
      <section className="dashboard-grid">
        <article className="balance-card">
          <div className="balance-top"><span>Saldo disponível</span><button onClick={onToggleValues} aria-label={hideValues ? "Mostrar valores" : "Ocultar valores"}>{hideValues ? <Eye size={18} /> : <EyeOff size={18} />}</button></div>
          <strong>{display(metrics.balance)}</strong>
          <div className="balance-change"><span className={metrics.balance >= 0 ? "positive" : "negative"}>{metrics.balance >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {percentage(Math.abs(metrics.savingsRate))}</span><span>da renda permanece livre</span></div>
          <div className="balance-footer"><div><small>Receitas</small><b>{display(metrics.income)}</b></div><div><small>Despesas</small><b>{display(metrics.total)}</b></div></div>
        </article>
        <article className="kpi-card"><span className="metric-icon purple"><WalletCards size={19} /></span><small>Patrimônio investido</small><strong>{display(portfolio.current)}</strong><span className={portfolio.profit >= 0 ? "metric-trend positive" : "metric-trend negative"}>{portfolio.profit >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}{percentage(portfolio.profitability)}</span></article>
        <article className="kpi-card"><span className="metric-icon mint"><Target size={19} /></span><small>Taxa de economia</small><strong>{percentage(metrics.savingsRate)}</strong><span className="metric-caption">Meta sugerida: 20%</span></article>
        <article className="kpi-card"><span className="metric-icon amber"><CalendarDays size={19} /></span><small>Renda de investimentos</small><strong>{display(portfolio.monthlyIncome)}</strong><span className="metric-caption">Média mensal projetada</span></article>
      </section>

      <section className="content-grid">
        <article className="panel spending-panel">
          <div className="panel-title"><div><span className="eyebrow">Distribuição</span><h2>Despesas por categoria</h2></div><button className="text-button" onClick={() => onNavigate("expenses")}>Ver detalhes <ChevronRight size={16} /></button></div>
          {categories.length ? <div className="category-chart">{categories.map(([category, value]) => <div className="category-row" key={category}><div className="category-label"><span className="category-dot" style={{ background: expenseColors[category] ?? expenseColors.Outros }} /><span>{category}</span><strong>{display(value)}</strong></div><div className="progress-track"><span style={{ width: `${(value / maxCategory) * 100}%`, background: expenseColors[category] ?? expenseColors.Outros }} /></div></div>)}</div> : <EmptyState icon={<ReceiptText />} title="Nenhuma despesa" description="Adicione despesas para visualizar sua distribuição." />}
        </article>
        <article className="panel projection-panel">
          <div className="panel-title"><div><span className="eyebrow">Previsão</span><h2>Próximos 12 meses</h2></div><span className="status-pill">Estimativa local</span></div>
          <div className="projection-total"><small>Saldo acumulado estimado</small><strong>{display(projection[11].value)}</strong></div>
          <div className="projection-chart" aria-label="Projeção de saldo para 12 meses">{projection.map((item) => { const max = Math.max(...projection.map((point) => Math.abs(point.value)), 1); return <div className="projection-column" key={item.month}><span className={item.value < 0 ? "negative-bar" : ""} style={{ height: `${Math.max(10, (Math.abs(item.value) / max) * 100)}%` }} /><small>{item.month}</small></div>; })}</div>
        </article>
      </section>

      <section className="panel insights-panel">
        <div className="panel-title"><div><span className="eyebrow">Finch insights</span><h2>Recomendações para você</h2></div><span className="metric-icon purple"><Lightbulb size={19} /></span></div>
        <div className="insights-grid">{recommendations.map((item) => <div className={`insight ${item.tone}`} key={item.title}><span>{item.tone === "positive" ? <TrendingUp size={18} /> : item.tone === "attention" ? <Target size={18} /> : <Sparkles size={18} />}</span><div><strong>{item.title}</strong><p>{item.description}</p></div></div>)}</div>
      </section>
    </>
  );
}

function Portfolio({ data, metrics, onAdd }: { data: FinchState; metrics: ReturnType<typeof calculatePortfolioMetrics>; onAdd: () => void }) {
  return (
    <>
      <PageHeading eyebrow="Seus investimentos" title="Carteira" description="Acompanhe posições, rendimentos e concentração sem depender de cotações externas." action={<button className="primary-button compact" onClick={onAdd}><Plus size={17} /> Adicionar ativo</button>} />
      <section className="stat-grid four"><StatCard label="Valor atual" value={formatBRL(metrics.current)} icon={<BriefcaseBusiness />} /><StatCard label="Total investido" value={formatBRL(metrics.invested)} icon={<CircleDollarSign />} /><StatCard label="Resultado" value={formatBRL(metrics.profit)} trend={percentage(metrics.profitability)} positive={metrics.profit >= 0} icon={<TrendingUp />} /><StatCard label="Renda anual" value={formatBRL(metrics.annualIncome)} caption="projeção cadastrada" icon={<CalendarDays />} /></section>
      <section className="panel asset-panel">
        <div className="panel-title"><div><span className="eyebrow">Posições</span><h2>Ativos cadastrados</h2></div><span className="status-pill">Atualização manual</span></div>
        {data.assets.length ? <div className="asset-list">{data.assets.map((asset) => { const current = asset.currentPrice * asset.quantity; const invested = asset.purchasePrice * asset.quantity; const result = invested ? ((current - invested) / invested) * 100 : 0; return <article className="asset-row" key={asset.id}><div className="ticker-badge">{asset.ticker.slice(0, 2)}</div><div className="asset-name"><strong>{asset.ticker}</strong><span>{asset.name} · {asset.category}</span></div><div><small>Quantidade</small><strong>{asset.quantity}</strong></div><div><small>Preço atual</small><strong>{formatBRL(asset.currentPrice)}</strong></div><div><small>Posição</small><strong>{formatBRL(current)}</strong></div><span className={result >= 0 ? "asset-result positive" : "asset-result negative"}>{result >= 0 ? "+" : ""}{percentage(result)}</span></article>; })}</div> : <EmptyState icon={<BriefcaseBusiness />} title="Sua carteira começa aqui" description="Adicione o primeiro ativo para calcular sua rentabilidade." action={<button className="primary-button compact" onClick={onAdd}>Adicionar ativo</button>} />}
      </section>
    </>
  );
}

function Expenses({ data, metrics, onAdd, onTogglePaid }: { data: FinchState; metrics: ReturnType<typeof calculateExpenseMetrics>; onAdd: () => void; onTogglePaid: (id: string) => void }) {
  const sorted = [...data.expenses].sort((a, b) => Number(a.paid) - Number(b.paid));
  return (
    <>
      <PageHeading eyebrow="Controle mensal" title="Despesas" description="Separe compromissos fixos dos gastos extras e acompanhe o impacto na renda." action={<button className="primary-button compact" onClick={onAdd}><Plus size={17} /> Nova despesa</button>} />
      <section className="stat-grid four"><StatCard label="Total do mês" value={formatBRL(metrics.total)} icon={<ReceiptText />} /><StatCard label="Gastos fixos" value={formatBRL(metrics.fixed)} caption={`${percentage(metrics.income ? (metrics.fixed / metrics.income) * 100 : 0)} da renda`} icon={<CalendarDays />} /><StatCard label="Gastos extras" value={formatBRL(metrics.extras)} icon={<Sparkles />} /><StatCard label="Comprometimento" value={percentage(metrics.commitment)} trend={metrics.commitment <= 80 ? "Dentro do limite" : "Revisar despesas"} positive={metrics.commitment <= 80} icon={<Target />} /></section>
      <section className="expense-layout">
        <article className="panel expense-list-panel">
          <div className="panel-title"><div><span className="eyebrow">Neste mês</span><h2>Contas e gastos</h2></div><span className="status-pill">{data.expenses.filter((expense) => expense.paid).length}/{data.expenses.length} pagos</span></div>
          {sorted.length ? <div className="expense-list">{sorted.map((expense) => <article className="expense-row" key={expense.id}><button className={`paid-toggle ${expense.paid ? "paid" : ""}`} onClick={() => onTogglePaid(expense.id)} aria-label={expense.paid ? "Marcar como pendente" : "Marcar como pago"}>{expense.paid && <Check size={15} />}</button><span className="expense-symbol" style={{ background: `${expenseColors[expense.category] ?? expenseColors.Outros}20`, color: expenseColors[expense.category] ?? expenseColors.Outros }}><ReceiptText size={18} /></span><div className="expense-name"><strong>{expense.name}</strong><span>{expense.category} · {expense.kind === "fixed" ? "Fixo" : "Extra"}</span></div><div className="expense-date">{expense.dueDay ? `Dia ${expense.dueDay}` : "Sem vencimento"}</div><strong>{formatBRL(expense.amount)}</strong><span className={`expense-status ${expense.paid ? "paid" : "pending"}`}>{expense.paid ? "Pago" : "Pendente"}</span></article>)}</div> : <EmptyState icon={<ReceiptText />} title="Nenhuma despesa registrada" description="Adicione seus gastos fixos e extras deste mês." />}
        </article>
        <article className="panel budget-card"><span className="metric-icon mint"><Target size={20} /></span><span className="eyebrow">Orçamento sugerido</span><h2>Baseado na sua renda</h2><p>Uma referência simples para distribuir {formatBRL(metrics.income)} sem transformar recomendações em regras rígidas.</p><div className="budget-split"><BudgetLine label="Essenciais" value="50%" amount={metrics.income * 0.5} color="#7357e8" /><BudgetLine label="Estilo de vida" value="30%" amount={metrics.income * 0.3} color="#ffb95c" /><BudgetLine label="Reserva e metas" value="20%" amount={metrics.income * 0.2} color="#55c8a5" /></div></article>
      </section>
    </>
  );
}

function StatCard({ label, value, caption, trend, positive = true, icon }: { label: string; value: string; caption?: string; trend?: string; positive?: boolean; icon: React.ReactNode }) {
  return <article className="stat-card"><span className="metric-icon purple">{icon}</span><small>{label}</small><strong>{value}</strong>{trend && <span className={positive ? "metric-trend positive" : "metric-trend negative"}>{trend}</span>}{caption && <span className="metric-caption">{caption}</span>}</article>;
}

function BudgetLine({ label, value, amount, color }: { label: string; value: string; amount: number; color: string }) {
  return <div className="budget-line"><div><span><i style={{ background: color }} />{label}</span><strong>{value}</strong></div><small>{formatBRL(amount)} por mês</small></div>;
}

function ProfilePage({ data, onSave, onLock }: { data: FinchState; onSave: (state: FinchState, message?: string) => void; onLock: () => void }) {
  const [profile, setProfile] = useState({ name: data.profile.name, salary: String(data.profile.salary), extraIncome: String(data.profile.extraIncome), payday: data.profile.payday ? String(data.profile.payday) : "" });
  const [pin, setPin] = useState({ current: "", next: "", confirm: "" });
  const [pinError, setPinError] = useState("");

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    onSave({ ...data, profile: { ...data.profile, name: profile.name, salary: Number(profile.salary), extraIncome: Number(profile.extraIncome) || 0, payday: profile.payday ? Number(profile.payday) : undefined } }, "Perfil atualizado");
  };

  const changePin = async (event: FormEvent) => {
    event.preventDefault();
    setPinError("");
    if ((await hashPin(pin.current, data.profile.pinSalt)) !== data.profile.pinHash) return setPinError("O PIN atual está incorreto.");
    if (!/^\d{4,6}$/.test(pin.next)) return setPinError("O novo PIN deve ter de 4 a 6 dígitos.");
    if (pin.next !== pin.confirm) return setPinError("A confirmação do novo PIN não corresponde.");
    const pinSalt = createSalt();
    const pinHash = await hashPin(pin.next, pinSalt);
    onSave({ ...data, profile: { ...data.profile, pinSalt, pinHash } }, "PIN alterado");
    setPin({ current: "", next: "", confirm: "" });
  };

  const download = (type: "json" | "csv") => {
    let content: string;
    let mime: string;
    if (type === "json") {
      content = JSON.stringify(data, null, 2);
      mime = "application/json";
    } else {
      const rows = [
        ["tipo", "nome", "categoria", "valor", "detalhe"],
        ...data.expenses.map((item) => ["despesa", item.name, item.category, item.amount, item.kind]),
        ...data.assets.map((item) => ["ativo", item.ticker, item.category, item.currentPrice * item.quantity, `${item.quantity} cotas`]),
      ];
      content = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
      mime = "text/csv";
    }
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `finch-backup.${type}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeading eyebrow="Preferências locais" title="Seu perfil" description="Atualize renda, segurança, aparência e exporte uma cópia dos seus dados." />
      <section className="profile-grid">
        <form className="panel settings-card" onSubmit={saveProfile}><div className="panel-title"><div><span className="eyebrow">Dados financeiros</span><h2>Informações pessoais</h2></div><span className="metric-icon purple"><UserRound size={19} /></span></div><label>Nome<input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label><div className="field-row"><label>Salário mensal<input required min="1" step="0.01" type="number" value={profile.salary} onChange={(event) => setProfile({ ...profile, salary: event.target.value })} /></label><label>Renda extra <small>Opcional</small><input min="0" step="0.01" type="number" value={profile.extraIncome} onChange={(event) => setProfile({ ...profile, extraIncome: event.target.value })} /></label></div><label>Dia do pagamento <small>Opcional</small><input min="1" max="31" type="number" value={profile.payday} onChange={(event) => setProfile({ ...profile, payday: event.target.value })} /></label><button className="primary-button compact" type="submit">Salvar alterações</button></form>
        <form className="panel settings-card" onSubmit={changePin}><div className="panel-title"><div><span className="eyebrow">Segurança</span><h2>Alterar PIN</h2></div><span className="metric-icon mint"><LockKeyhole size={19} /></span></div><label>PIN atual<input required inputMode="numeric" maxLength={6} type="password" value={pin.current} onChange={(event) => setPin({ ...pin, current: event.target.value.replace(/\D/g, "") })} /></label><div className="field-row"><label>Novo PIN<input required inputMode="numeric" maxLength={6} type="password" value={pin.next} onChange={(event) => setPin({ ...pin, next: event.target.value.replace(/\D/g, "") })} /></label><label>Confirme<input required inputMode="numeric" maxLength={6} type="password" value={pin.confirm} onChange={(event) => setPin({ ...pin, confirm: event.target.value.replace(/\D/g, "") })} /></label></div>{pinError && <p className="form-error">{pinError}</p>}<button className="secondary-button" type="submit">Atualizar PIN</button></form>
        <article className="panel settings-card"><div className="panel-title"><div><span className="eyebrow">Aparência</span><h2>Tema do Finch</h2></div>{data.theme === "light" ? <Sun size={21} /> : <Moon size={21} />}</div><p>Escolha o tema mais confortável para acompanhar suas finanças.</p><div className="theme-switch"><button className={data.theme === "light" ? "active" : ""} onClick={() => onSave({ ...data, theme: "light" })}><Sun size={18} /> Claro</button><button className={data.theme === "dark" ? "active" : ""} onClick={() => onSave({ ...data, theme: "dark" })}><Moon size={18} /> Escuro</button></div></article>
        <article className="panel settings-card"><div className="panel-title"><div><span className="eyebrow">Backup local</span><h2>Exportar seus dados</h2></div><span className="metric-icon amber"><Download size={19} /></span></div><p>Baixe uma cópia para guardar ou analisar fora do Finch.</p><div className="export-actions"><button className="secondary-button" onClick={() => download("json")}><FileJson size={18} /> Exportar JSON</button><button className="secondary-button" onClick={() => download("csv")}><Download size={18} /> Exportar CSV</button></div></article>
      </section>
      <button className="lock-action" onClick={onLock}><LogOut size={18} /> Bloquear aplicativo agora</button>
    </>
  );
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{description}</p>{action}</div>;
}

function ModalShell({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><span className="eyebrow">Cadastro local</span><h2 id="modal-title">{title}</h2><p>{description}</p></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19} /></button></div>{children}</div></div>;
}

function ExpenseModal({ onClose, onSave }: { onClose: () => void; onSave: (expense: Expense) => void }) {
  const [form, setForm] = useState({ name: "", category: "Moradia", amount: "", kind: "fixed" as Expense["kind"], dueDay: "", paid: false });
  return <ModalShell title="Nova despesa" description="Registre um compromisso fixo ou gasto extra." onClose={onClose}><form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, id: crypto.randomUUID(), amount: Number(form.amount), dueDay: form.dueDay ? Number(form.dueDay) : undefined }); }}><label>Descrição<input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Conta de energia" /></label><div className="field-row"><label>Categoria<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["Moradia", "Casa", "Alimentação", "Saúde", "Lazer", "Transporte", "Outros"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Valor<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="R$ 0,00" /></label></div><div className="field-row"><label>Tipo<select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as Expense["kind"] })}><option value="fixed">Gasto fixo</option><option value="extra">Gasto extra</option></select></label><label>Dia do vencimento <small>Opcional</small><input min="1" max="31" type="number" value={form.dueDay} onChange={(event) => setForm({ ...form, dueDay: event.target.value })} /></label></div><label className="demo-choice"><input type="checkbox" checked={form.paid} onChange={(event) => setForm({ ...form, paid: event.target.checked })} /><span><strong>Marcar como pago</strong><small>Você poderá alterar depois.</small></span></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button compact">Adicionar despesa</button></div></form></ModalShell>;
}

function AssetModal({ onClose, onSave }: { onClose: () => void; onSave: (asset: Asset) => void }) {
  const [form, setForm] = useState({ ticker: "", name: "", category: "Ações", quantity: "", purchasePrice: "", currentPrice: "", incomeType: "Dividendos", incomePerShare: "", frequency: "quarterly" as Frequency });
  return <ModalShell title="Novo ativo" description="Informe os dados da sua posição e dos rendimentos." onClose={onClose}><form className="modal-form" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, id: crypto.randomUUID(), ticker: form.ticker.toUpperCase(), quantity: Number(form.quantity), purchasePrice: Number(form.purchasePrice), currentPrice: Number(form.currentPrice), incomePerShare: Number(form.incomePerShare) || 0 }); }}><div className="field-row"><label>Código do ativo<input autoFocus required value={form.ticker} onChange={(event) => setForm({ ...form, ticker: event.target.value })} placeholder="Ex.: PETR4" /></label><label>Nome<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Empresa ou fundo" /></label></div><div className="field-row"><label>Categoria<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Ações</option><option>FII</option><option>ETF</option><option>Renda fixa</option><option>Outro</option></select></label><label>Quantidade<input required min="0.0001" step="0.0001" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label></div><div className="field-row"><label>Preço de compra<input required min="0" step="0.01" type="number" value={form.purchasePrice} onChange={(event) => setForm({ ...form, purchasePrice: event.target.value })} /></label><label>Preço atual<input required min="0" step="0.01" type="number" value={form.currentPrice} onChange={(event) => setForm({ ...form, currentPrice: event.target.value })} /></label></div><div className="field-row"><label>Forma de lucro<select value={form.incomeType} onChange={(event) => setForm({ ...form, incomeType: event.target.value })}><option>Dividendos</option><option>Juros sobre capital</option><option>Rendimentos</option><option>Outro</option></select></label><label>Valor por ação/cota <small>Opcional</small><input min="0" step="0.01" type="number" value={form.incomePerShare} onChange={(event) => setForm({ ...form, incomePerShare: event.target.value })} /></label></div><label>Periodicidade<select value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value as Frequency })}><option value="monthly">Mensal</option><option value="bimonthly">Bimestral</option><option value="quarterly">Trimestral</option><option value="semiannual">Semestral</option><option value="annual">Anual</option><option value="eventual">Eventual</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button compact">Adicionar ativo</button></div></form></ModalShell>;
}
