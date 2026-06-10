export const locales = ["az", "ru"] as const;

export type Locale = (typeof locales)[number];

const dictionaries = {
  az: {
    pageTitle: "Kredit kalkulyatoru",
    pageDescription:
      "Aylıq ödənişi hesablayın və kredit üzrə ətraflı ödəniş cədvəlini görün.",
    formTitle: "Kredit şərtləri",
    fields: {
      principal: "Kredit məbləği",
      months: "Müddət, ay",
      annualRate: "İllik faiz dərəcəsi, %",
      commission: "Komissiya, %",
      insurance: "Sığorta, AZN",
    },
    calculate: "Hesabla",
    resultsTitle: "Hesablama nəticələri",
    results: {
      monthlyPayment: "Aylıq ödəniş",
      totalPayment: "Ümumi ödəniş",
      overpayment: "Artıq ödəniş",
      commissionAmount: "Komissiya məbləği",
      insuranceAmount: "Sığorta məbləği",
    },
    scheduleTitle: "Ödəniş cədvəli",
    schedule: {
      month: "Ay",
      payment: "Ödəniş",
      principalPart: "Əsas borc",
      interestPart: "Faiz",
      remainingBalance: "Qalıq borc",
    },
    errors: {
      principal: "Kredit məbləği 0-dan böyük olmalıdır.",
      months: "Müddət 0-dan böyük olmalıdır.",
      annualRate: "İllik faiz dərəcəsi 0-dan az ola bilməz.",
      commission: "Komissiya 0-dan az ola bilməz.",
      insurance: "Sığorta məbləği 0-dan az ola bilməz.",
    },
    languageLabel: "Dil",
  },
  ru: {
    pageTitle: "Кредитный калькулятор",
    pageDescription:
      "Рассчитайте ежемесячный платеж и посмотрите подробный график выплат по кредиту.",
    formTitle: "Условия кредита",
    fields: {
      principal: "Сумма кредита",
      months: "Срок, месяцев",
      annualRate: "Годовая ставка, %",
      commission: "Комиссия, %",
      insurance: "Страховка, AZN",
    },
    calculate: "Рассчитать",
    resultsTitle: "Результаты расчета",
    results: {
      monthlyPayment: "Ежемесячный платеж",
      totalPayment: "Общая выплата",
      overpayment: "Переплата",
      commissionAmount: "Сумма комиссии",
      insuranceAmount: "Сумма страховки",
    },
    scheduleTitle: "График платежей",
    schedule: {
      month: "Месяц",
      payment: "Платеж",
      principalPart: "Основной долг",
      interestPart: "Проценты",
      remainingBalance: "Остаток долга",
    },
    errors: {
      principal: "Сумма кредита должна быть больше 0.",
      months: "Срок должен быть больше 0.",
      annualRate: "Годовая ставка не может быть меньше 0.",
      commission: "Комиссия не может быть меньше 0.",
      insurance: "Страховка не может быть меньше 0.",
    },
    languageLabel: "Язык",
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
