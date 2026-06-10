export type PaymentScheduleItem = {
  month: number;
  payment: number;
  principalPart: number;
  interestPart: number;
  remainingBalance: number;
};

export function calculateAnnuityPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 100 / 12;

  if (annualRate === 0) {
    return principal / months;
  }

  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return payment;
}

export function generatePaymentSchedule(
  principal: number,
  annualRate: number,
  months: number
): PaymentScheduleItem[] {
  const monthlyRate = annualRate / 100 / 12;
  const regularPayment = calculateAnnuityPayment(principal, annualRate, months);
  let remainingBalance = principal;

  return Array.from({ length: months }, (_, index) => {
    const interestPart = remainingBalance * monthlyRate;
    const principalPart =
      index === months - 1
        ? remainingBalance
        : Math.min(regularPayment - interestPart, remainingBalance);
    const payment = principalPart + interestPart;

    remainingBalance = Math.max(0, remainingBalance - principalPart);

    return {
      month: index + 1,
      payment,
      principalPart,
      interestPart,
      remainingBalance,
    };
  });
}
