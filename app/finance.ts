export type Expense = {
  id: string;
  name: string;
  category: string;
  amount: number;
  kind: "fixed" | "extra";
  dueDay?: number;
  paid: boolean;
};

export type Frequency =
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "semiannual"
  | "annual"
  | "eventual";

export type Asset = {
  id: string;
  ticker: string;
  name: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  incomeType: string;
  incomePerShare: number;
  frequency: Frequency;
};

export type Profile = {
  name: string;
  salary: number;
  extraIncome: number;
  payday?: number;
  pinHash: string;
  pinSalt: string;
};

const frequencyMultiplier: Record<Frequency, number> = {
  monthly: 12,
  bimonthly: 6,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
  eventual: 0,
};

export const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

export function calculateExpenseMetrics(profile: Profile, expenses: Expense[]) {
  const income = profile.salary + profile.extraIncome;
  const total = sum(expenses.map((expense) => expense.amount));
  const fixed = sum(
    expenses
      .filter((expense) => expense.kind === "fixed")
      .map((expense) => expense.amount),
  );
  const extras = total - fixed;
  const balance = income - total;

  return {
    income,
    total,
    fixed,
    extras,
    balance,
    commitment: income > 0 ? (total / income) * 100 : 0,
    savingsRate: income > 0 ? (balance / income) * 100 : 0,
    paid: sum(
      expenses.filter((expense) => expense.paid).map((expense) => expense.amount),
    ),
  };
}

export function calculatePortfolioMetrics(assets: Asset[]) {
  const invested = sum(
    assets.map((asset) => asset.quantity * asset.purchasePrice),
  );
  const current = sum(assets.map((asset) => asset.quantity * asset.currentPrice));
  const annualIncome = sum(
    assets.map(
      (asset) =>
        asset.quantity *
        asset.incomePerShare *
        frequencyMultiplier[asset.frequency],
    ),
  );
  const largestPosition = assets.reduce(
    (largest, asset) =>
      Math.max(largest, asset.quantity * asset.currentPrice),
    0,
  );

  return {
    invested,
    current,
    profit: current - invested,
    profitability: invested > 0 ? ((current - invested) / invested) * 100 : 0,
    annualIncome,
    monthlyIncome: annualIncome / 12,
    concentration: current > 0 ? (largestPosition / current) * 100 : 0,
  };
}

export function buildProjection(
  profile: Profile,
  expenses: Expense[],
  language: "pt" | "en" = "pt",
) {
  const { balance } = calculateExpenseMetrics(profile, expenses);
  const formatter = new Intl.DateTimeFormat(
    language === "pt" ? "pt-BR" : "en-US",
    { month: "short" },
  );
  const now = new Date();

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    return {
      month: formatter.format(date).replace(".", ""),
      value: balance * (index + 1),
    };
  });
}

export type Recommendation = {
  tone: "positive" | "attention" | "neutral";
  title: string;
  description: string;
};

export function buildRecommendations(
  profile: Profile,
  expenses: Expense[],
  assets: Asset[],
  language: "pt" | "en" = "pt",
): Recommendation[] {
  const expense = calculateExpenseMetrics(profile, expenses);
  const portfolio = calculatePortfolioMetrics(assets);
  const recommendations: Recommendation[] = [];

  if (expense.commitment > 80) {
    recommendations.push({
      tone: "attention",
      title: language === "pt" ? "Orçamento no limite" : "Budget at its limit",
      description:
        language === "pt"
          ? `${expense.commitment.toFixed(0)}% da sua renda já está comprometida neste mês.`
          : `${expense.commitment.toFixed(0)}% of your income is already committed this month.`,
    });
  } else if (expense.savingsRate >= 20) {
    recommendations.push({
      tone: "positive",
      title: language === "pt" ? "Boa margem mensal" : "Healthy monthly margin",
      description:
        language === "pt"
          ? `Você preserva ${expense.savingsRate.toFixed(0)}% da renda após as despesas registradas.`
          : `You keep ${expense.savingsRate.toFixed(0)}% of your income after registered expenses.`,
    });
  } else {
    recommendations.push({
      tone: "neutral",
      title: language === "pt" ? "Meta de reserva" : "Savings goal",
      description:
        language === "pt"
          ? "Busque manter ao menos 20% da renda livre para metas e imprevistos."
          : "Aim to keep at least 20% of your income available for goals and emergencies.",
    });
  }

  if (expense.income > 0 && expense.fixed / expense.income > 0.5) {
    recommendations.push({
      tone: "attention",
      title: language === "pt" ? "Custos fixos elevados" : "High fixed costs",
      description:
        language === "pt"
          ? "Seus gastos fixos superam 50% da renda mensal."
          : "Your fixed expenses exceed 50% of your monthly income.",
    });
  }

  if (assets.length > 1 && portfolio.concentration > 50) {
    recommendations.push({
      tone: "attention",
      title: language === "pt" ? "Carteira concentrada" : "Concentrated portfolio",
      description:
        language === "pt"
          ? `${portfolio.concentration.toFixed(0)}% do patrimônio está em uma única posição.`
          : `${portfolio.concentration.toFixed(0)}% of your portfolio is held in a single position.`,
    });
  } else if (assets.length > 0) {
    recommendations.push({
      tone: "positive",
      title: language === "pt" ? "Renda projetada" : "Projected income",
      description:
        language === "pt"
          ? `Os rendimentos cadastrados projetam ${formatBRL(portfolio.annualIncome)} em 12 meses.`
          : `Registered income projects ${formatBRL(portfolio.annualIncome)} over 12 months.`,
    });
  }

  return recommendations.slice(0, 3);
}

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
