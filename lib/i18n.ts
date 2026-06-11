export const locales = ["az", "ru"] as const;

export type Locale = (typeof locales)[number];

const dictionaries = {
  az: {
    pageTitle: "Kredit kalkulyatoru",
    pageDescription:
      "Adi kredit ödənişini hesablayın, erkən ödənişləri planlaşdırın və qənaəti müqayisə edin.",
    formTitle: "Kredit şərtləri",
    fields: {
      principal: "Kredit məbləği",
      months: "Müddət, ay",
      annualRate: "İllik faiz dərəcəsi, %",
      commission: "Komissiya, %",
      insurance: "Sığorta, AZN",
    },
    extra: {
      question: "Əlavə ödənişlər planlaşdırırsınız?",
      no: "Xeyr",
      yes: "Bəli",
      recurringTitle: "Daimi əlavə ödəniş",
      recurringEnabled: "Daimi əlavə ödəniş istifadə edilsin?",
      recurringAmount: "Aylıq əlavə ödəniş məbləği",
      recurringStart: "Hansı aydan başlasın",
      recurringEnd: "Hansı aya qədər davam etsin",
      recurringEndHint: "Kredit bitənə qədərdirsə, boş saxlayın",
      oneTimeTitle: "Birdəfəlik əlavə ödənişlər",
      paymentMonth: "Ödəniş ayı",
      paymentAmount: "Ödəniş məbləği",
      addPayment: "Ödəniş əlavə et",
      remove: "Sil",
      strategyQuestion: "Əlavə ödənişdən sonra nə azalsın?",
      strategies: {
        reduce_term: "Müddəti azalt",
        reduce_payment: "Aylıq ödənişi azalt",
        compare: "Hər iki variantı müqayisə et",
      },
    },
    calculate: "Hesabla",
    resultsTitle: "Hesablama nəticələri",
    results: {
      monthlyPayment: "İlk aylıq ödəniş",
      finalTerm: "Yekun müddət",
      monthsUnit: "ay",
      totalPayment: "Ümumi ödəniş",
      totalInterest: "Faizlər",
      overpayment: "Artıq ödəniş",
      commissionAmount: "Komissiya məbləği",
      insuranceAmount: "Sığorta məbləği",
      savings: "Faizlərə qənaət",
    },
    comparisonTitle: "Ssenarilərin müqayisəsi",
    comparison: {
      scenario: "Ssenari",
      firstPayment: "İlk ödəniş",
      lastPayment: "Son ödəniş",
      finalTerm: "Yekun müddət",
      totalPaid: "Ümumi ödəniş",
      interest: "Faizlər",
      savings: "Qənaət",
    },
    scenarioLabels: {
      base: "Əlavə ödənişsiz",
      reduce_term: "Müddəti azalt",
      reduce_payment: "Aylıq ödənişi azalt",
    },
    recommendationTitle: "Tövsiyə",
    recommendationTerm:
      "Daxil etdiyiniz məlumatlara görə müddətin azaldılması faiz xərclərinə daha çox qənaət edir. Əgər əvvəlki aylıq ödənişi saxlamaq sizin üçün rahatdırsa, bu variant adətən daha sərfəlidir.",
    recommendationPayment:
      "Aylıq ödənişin azaldılması kredit yükünü aşağı salır. Əgər sizin üçün əsas məqsəd maksimum qənaət yox, aylıq büdcəni rahatlaşdırmaqdırsa, bu variant daha uyğun ola bilər.",
    scheduleTitle: "Ödəniş cədvəli",
    schedule: {
      month: "Ay",
      regularPayment: "Plan üzrə ödəniş",
      extraPayment: "Əlavə ödəniş",
      totalPayment: "Ümumi ödəniş",
      principalPart: "Əsas borc",
      interest: "Faiz",
      endingBalance: "Qalıq",
    },
    errors: {
      principal: "Kredit məbləği 0-dan böyük olmalıdır.",
      months: "Müddət tam ədəd və 0-dan böyük olmalıdır.",
      annualRate: "İllik faiz dərəcəsi 0-dan az ola bilməz.",
      commission: "Komissiya 0-dan az ola bilməz.",
      insurance: "Sığorta məbləği 0-dan az ola bilməz.",
      recurringAmount: "Aylıq əlavə ödəniş 0 və ya daha böyük olmalıdır.",
      recurringStart: "Başlanğıc ayı kredit müddəti daxilində olmalıdır.",
      recurringEnd:
        "Son ay boş olmalı və ya başlanğıc ayından az olmamalıdır.",
      oneTimeMonth: "Ödəniş ayı kredit müddəti daxilində olmalıdır.",
      oneTimeAmount: "Birdəfəlik ödəniş 0-dan böyük olmalıdır.",
    },
    languageLabel: "Dil",
  },
  ru: {
    pageTitle: "Кредитный калькулятор",
    pageDescription:
      "Рассчитайте обычный кредит, запланируйте досрочные платежи и сравните экономию.",
    formTitle: "Условия кредита",
    fields: {
      principal: "Сумма кредита",
      months: "Срок, месяцев",
      annualRate: "Годовая ставка, %",
      commission: "Комиссия, %",
      insurance: "Страховка, AZN",
    },
    extra: {
      question: "Планируете дополнительные платежи?",
      no: "Нет",
      yes: "Да",
      recurringTitle: "Постоянный дополнительный платеж",
      recurringEnabled: "Использовать постоянный доп. платеж?",
      recurringAmount: "Сумма доп. платежа в месяц",
      recurringStart: "С какого месяца начать",
      recurringEnd: "До какого месяца платить",
      recurringEndHint: "Оставьте пустым, если до конца кредита",
      oneTimeTitle: "Единоразовые дополнительные платежи",
      paymentMonth: "Месяц платежа",
      paymentAmount: "Сумма платежа",
      addPayment: "Добавить платеж",
      remove: "Удалить",
      strategyQuestion: "Что уменьшать после досрочного платежа?",
      strategies: {
        reduce_term: "Уменьшить срок",
        reduce_payment: "Уменьшить ежемесячный платеж",
        compare: "Сравнить оба варианта",
      },
    },
    calculate: "Рассчитать",
    resultsTitle: "Результаты расчета",
    results: {
      monthlyPayment: "Первый ежемесячный платеж",
      finalTerm: "Итоговый срок",
      monthsUnit: "мес.",
      totalPayment: "Всего выплачено",
      totalInterest: "Проценты",
      overpayment: "Переплата",
      commissionAmount: "Сумма комиссии",
      insuranceAmount: "Сумма страховки",
      savings: "Экономия на процентах",
    },
    comparisonTitle: "Сравнение сценариев",
    comparison: {
      scenario: "Сценарий",
      firstPayment: "Первый платеж",
      lastPayment: "Последний платеж",
      finalTerm: "Итоговый срок",
      totalPaid: "Всего выплачено",
      interest: "Проценты",
      savings: "Экономия",
    },
    scenarioLabels: {
      base: "Без доп. платежей",
      reduce_term: "Уменьшить срок",
      reduce_payment: "Уменьшить платеж",
    },
    recommendationTitle: "Рекомендация",
    recommendationTerm:
      "При ваших данных уменьшение срока дает большую экономию на процентах. Этот вариант обычно выгоднее, если вам комфортно сохранять прежний ежемесячный платеж.",
    recommendationPayment:
      "Уменьшение ежемесячного платежа снижает кредитную нагрузку. Этот вариант может быть удобнее, если для вас важнее свободный ежемесячный бюджет, а не максимальная экономия.",
    scheduleTitle: "График платежей",
    schedule: {
      month: "Месяц",
      regularPayment: "Плановый платеж",
      extraPayment: "Доп. платеж",
      totalPayment: "Общий платеж",
      principalPart: "Основной долг",
      interest: "Проценты",
      endingBalance: "Остаток",
    },
    errors: {
      principal: "Сумма кредита должна быть больше 0.",
      months: "Срок должен быть целым числом больше 0.",
      annualRate: "Годовая ставка не может быть меньше 0.",
      commission: "Комиссия не может быть меньше 0.",
      insurance: "Страховка не может быть меньше 0.",
      recurringAmount: "Ежемесячный дополнительный платеж должен быть не меньше 0.",
      recurringStart: "Месяц начала должен находиться в пределах срока кредита.",
      recurringEnd:
        "Месяц окончания должен быть пустым или не раньше месяца начала.",
      oneTimeMonth: "Месяц платежа должен находиться в пределах срока кредита.",
      oneTimeAmount: "Сумма единоразового платежа должна быть больше 0.",
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
