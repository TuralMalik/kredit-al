export type RepaymentStrategy = "reduce_term" | "reduce_payment" | "compare";

export type OneTimeExtraPayment = {
  month: number;
  amount: number;
};

export type RecurringExtraPayment = {
  enabled: boolean;
  amount: number;
  startMonth: number;
  endMonth?: number | null;
};

export type LoanCalculationInput = {
  principal: number;
  annualRate: number;
  months: number;
  commissionPercent: number;
  insuranceAmount: number;
  hasExtraPayments: boolean;
  recurringExtraPayment?: RecurringExtraPayment;
  oneTimeExtraPayments?: OneTimeExtraPayment[];
  strategy: RepaymentStrategy;
};

export type PaymentScheduleRow = {
  month: number;
  beginningBalance: number;
  regularPayment: number;
  interest: number;
  principalPart: number;
  recurringExtra: number;
  oneTimeExtra: number;
  extraPayment: number;
  totalPayment: number;
  endingBalance: number;
};

export type LoanSummary = {
  monthsCount: number;
  firstRegularPayment: number;
  lastRegularPayment: number;
  totalRegularPayments: number;
  totalExtraPayments: number;
  totalInterest: number;
  totalPaid: number;
  overpayment: number;
};

export type LoanScenarioResult = {
  key: "base" | "reduce_term" | "reduce_payment";
  label: string;
  schedule: PaymentScheduleRow[];
  summary: LoanSummary;
};

export function calculateAnnuityPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0 || principal <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;

  if (annualRate === 0) {
    return principal / months;
  }

  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

export function getRecurringExtraPayment(
  month: number,
  input: LoanCalculationInput
): number {
  const recurring = input.recurringExtraPayment;

  if (!input.hasExtraPayments || !recurring?.enabled) return 0;
  if (month < recurring.startMonth) return 0;
  if (recurring.endMonth && month > recurring.endMonth) return 0;

  return recurring.amount;
}

export function getOneTimeExtraPayment(
  month: number,
  input: LoanCalculationInput
): number {
  if (!input.hasExtraPayments) return 0;

  return (input.oneTimeExtraPayments ?? [])
    .filter((payment) => payment.month === month)
    .reduce((sum, payment) => sum + payment.amount, 0);
}

function makeScheduleRow(
  month: number,
  balance: number,
  monthlyRate: number,
  plannedPayment: number,
  requestedRecurringExtra: number,
  requestedOneTimeExtra: number
): PaymentScheduleRow {
  const interest = balance * monthlyRate;
  const regularPayment = Math.min(plannedPayment, balance + interest);
  const principalPart = Math.max(0, regularPayment - interest);
  const availableForExtra = Math.max(0, balance - principalPart);
  const requestedExtra = requestedRecurringExtra + requestedOneTimeExtra;
  const extraPayment = Math.min(requestedExtra, availableForExtra);
  const recurringExtra =
    requestedExtra > 0
      ? extraPayment * (requestedRecurringExtra / requestedExtra)
      : 0;
  const oneTimeExtra = extraPayment - recurringExtra;
  const endingBalance = Math.max(
    0,
    balance - principalPart - extraPayment
  );

  return {
    month,
    beginningBalance: balance,
    regularPayment,
    interest,
    principalPart,
    recurringExtra,
    oneTimeExtra,
    extraPayment,
    totalPayment: regularPayment + extraPayment,
    endingBalance,
  };
}

export function calculateScheduleBase(
  input: LoanCalculationInput
): PaymentScheduleRow[] {
  const monthlyRate = input.annualRate / 100 / 12;
  const regularPayment = calculateAnnuityPayment(
    input.principal,
    input.annualRate,
    input.months
  );
  const schedule: PaymentScheduleRow[] = [];
  let balance = input.principal;

  for (let month = 1; month <= input.months && balance > 0; month += 1) {
    const row = makeScheduleRow(
      month,
      balance,
      monthlyRate,
      regularPayment,
      0,
      0
    );
    schedule.push(row);
    balance = row.endingBalance;
  }

  return schedule;
}

export function calculateScheduleReduceTerm(
  input: LoanCalculationInput
): PaymentScheduleRow[] {
  const monthlyRate = input.annualRate / 100 / 12;
  const basePayment = calculateAnnuityPayment(
    input.principal,
    input.annualRate,
    input.months
  );
  const schedule: PaymentScheduleRow[] = [];
  let balance = input.principal;
  let month = 1;

  while (balance > 0.000001 && month <= 600) {
    const row = makeScheduleRow(
      month,
      balance,
      monthlyRate,
      basePayment,
      getRecurringExtraPayment(month, input),
      getOneTimeExtraPayment(month, input)
    );
    schedule.push(row);
    balance = row.endingBalance;
    month += 1;
  }

  return schedule;
}

export function calculateScheduleReducePayment(
  input: LoanCalculationInput
): PaymentScheduleRow[] {
  const monthlyRate = input.annualRate / 100 / 12;
  const schedule: PaymentScheduleRow[] = [];
  let balance = input.principal;
  let currentRegularPayment = calculateAnnuityPayment(
    input.principal,
    input.annualRate,
    input.months
  );

  for (let month = 1; month <= input.months && balance > 0; month += 1) {
    const row = makeScheduleRow(
      month,
      balance,
      monthlyRate,
      currentRegularPayment,
      getRecurringExtraPayment(month, input),
      getOneTimeExtraPayment(month, input)
    );
    schedule.push(row);
    balance = row.endingBalance;

    const remainingMonths = input.months - month;
    if (row.extraPayment > 0 && balance > 0 && remainingMonths > 0) {
      currentRegularPayment = calculateAnnuityPayment(
        balance,
        input.annualRate,
        remainingMonths
      );
    }
  }

  return schedule;
}

export function summarizeSchedule(
  schedule: PaymentScheduleRow[],
  principal: number,
  commissionAmount: number,
  insuranceAmount: number
): LoanSummary {
  const totalRegularPayments = schedule.reduce(
    (sum, row) => sum + row.regularPayment,
    0
  );
  const totalExtraPayments = schedule.reduce(
    (sum, row) => sum + row.extraPayment,
    0
  );
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPaid =
    totalRegularPayments +
    totalExtraPayments +
    commissionAmount +
    insuranceAmount;

  return {
    monthsCount: schedule.length,
    firstRegularPayment: schedule[0]?.regularPayment ?? 0,
    lastRegularPayment: schedule[schedule.length - 1]?.regularPayment ?? 0,
    totalRegularPayments,
    totalExtraPayments,
    totalInterest,
    totalPaid,
    overpayment: totalPaid - principal,
  };
}

export function calculateLoanScenarios(
  input: LoanCalculationInput
): LoanScenarioResult[] {
  const commissionAmount =
    (input.principal * input.commissionPercent) / 100;
  const schedules = [
    {
      key: "base" as const,
      label: "base",
      schedule: calculateScheduleBase(input),
    },
    {
      key: "reduce_term" as const,
      label: "reduce_term",
      schedule: calculateScheduleReduceTerm(input),
    },
    {
      key: "reduce_payment" as const,
      label: "reduce_payment",
      schedule: calculateScheduleReducePayment(input),
    },
  ];

  return schedules.map((scenario) => ({
    ...scenario,
    summary: summarizeSchedule(
      scenario.schedule,
      input.principal,
      commissionAmount,
      input.insuranceAmount
    ),
  }));
}

// Kept for callers that only need the classic schedule.
export function generatePaymentSchedule(
  principal: number,
  annualRate: number,
  months: number
) {
  return calculateScheduleBase({
    principal,
    annualRate,
    months,
    commissionPercent: 0,
    insuranceAmount: 0,
    hasExtraPayments: false,
    strategy: "reduce_term",
  });
}
