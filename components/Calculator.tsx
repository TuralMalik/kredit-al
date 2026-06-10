"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  calculateAnnuityPayment,
  generatePaymentSchedule,
} from "@/lib/calculations";
import type { Dictionary, Locale } from "@/lib/i18n";

type FormValues = {
  principal: number;
  months: number;
  annualRate: number;
  commission: number;
  insurance: number;
};

type CalculatorProps = {
  locale: Locale;
  dictionary: Dictionary;
};

const initialValues: FormValues = {
  principal: 20000,
  months: 36,
  annualRate: 15,
  commission: 0,
  insurance: 0,
};

function formatCurrency(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  const [integer, decimals] = rounded.toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const fraction = decimals === "00" ? "" : `,${decimals}`;

  return `${grouped}${fraction} AZN`;
}

function calculateResults(values: FormValues) {
  const monthlyPayment = calculateAnnuityPayment(
    values.principal,
    values.annualRate,
    values.months
  );
  const schedule = generatePaymentSchedule(
    values.principal,
    values.annualRate,
    values.months
  );
  const loanPayments = schedule.reduce((sum, item) => sum + item.payment, 0);
  const commissionAmount = (values.principal * values.commission) / 100;
  const totalPayment = loanPayments + commissionAmount + values.insurance;

  return {
    monthlyPayment,
    totalPayment,
    overpayment: totalPayment - values.principal,
    commissionAmount,
    insuranceAmount: values.insurance,
    schedule,
  };
}

export default function Calculator({
  locale,
  dictionary,
}: CalculatorProps) {
  const [formValues, setFormValues] = useState(initialValues);
  const [calculatedValues, setCalculatedValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>(
    {}
  );

  const results = useMemo(
    () => calculateResults(calculatedValues),
    [calculatedValues]
  );

  function setField(field: keyof FormValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value === "" ? Number.NaN : Number(value),
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};

    if (!Number.isFinite(formValues.principal) || formValues.principal <= 0) {
      nextErrors.principal = dictionary.errors.principal;
    }
    if (
      !Number.isInteger(formValues.months) ||
      !Number.isFinite(formValues.months) ||
      formValues.months <= 0
    ) {
      nextErrors.months = dictionary.errors.months;
    }
    if (
      !Number.isFinite(formValues.annualRate) ||
      formValues.annualRate < 0
    ) {
      nextErrors.annualRate = dictionary.errors.annualRate;
    }
    if (
      !Number.isFinite(formValues.commission) ||
      formValues.commission < 0
    ) {
      nextErrors.commission = dictionary.errors.commission;
    }
    if (!Number.isFinite(formValues.insurance) || formValues.insurance < 0) {
      nextErrors.insurance = dictionary.errors.insurance;
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setCalculatedValues(formValues);
  }

  const fields: Array<{
    key: keyof FormValues;
    step: string;
    min: number;
  }> = [
    { key: "principal", step: "100", min: 0 },
    { key: "months", step: "1", min: 1 },
    { key: "annualRate", step: "0.1", min: 0 },
    { key: "commission", step: "0.1", min: 0 },
    { key: "insurance", step: "1", min: 0 },
  ];

  const resultCards = [
    ["monthlyPayment", results.monthlyPayment],
    ["totalPayment", results.totalPayment],
    ["overpayment", results.overpayment],
    ["commissionAmount", results.commissionAmount],
    ["insuranceAmount", results.insuranceAmount],
  ] as const;

  return (
    <main className="page-shell">
      <header className="hero">
        <nav className="language-switcher" aria-label={dictionary.languageLabel}>
          <Link
            href="/az/calculator"
            className={locale === "az" ? "active" : ""}
          >
            AZ
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href="/ru/calculator"
            className={locale === "ru" ? "active" : ""}
          >
            RU
          </Link>
        </nav>
        <p className="eyebrow">AZN</p>
        <h1>{dictionary.pageTitle}</h1>
        <p className="hero-description">{dictionary.pageDescription}</p>
      </header>

      <section className="calculator-layout">
        <form className="calculator-form" onSubmit={handleSubmit} noValidate>
          <h2>{dictionary.formTitle}</h2>
          <div className="fields-grid">
            {fields.map(({ key, step, min }) => {
              const error = errors[key];
              return (
                <div className="field" key={key}>
                  <label htmlFor={key}>{dictionary.fields[key]}</label>
                  <input
                    id={key}
                    type="number"
                    min={min}
                    step={step}
                    value={
                      Number.isNaN(formValues[key]) ? "" : formValues[key]
                    }
                    onChange={(event) => setField(key, event.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${key}-error` : undefined}
                  />
                  {error && (
                    <p className="field-error" id={`${key}-error`}>
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button type="submit">{dictionary.calculate}</button>
        </form>

        <section className="results-section" aria-live="polite">
          <h2>{dictionary.resultsTitle}</h2>
          <div className="results-grid">
            {resultCards.map(([key, value], index) => (
              <article
                className={`result-card ${index === 0 ? "featured" : ""}`}
                key={key}
              >
                <p>{dictionary.results[key]}</p>
                <strong>{formatCurrency(value)}</strong>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="schedule-section">
        <h2>{dictionary.scheduleTitle}</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{dictionary.schedule.month}</th>
                <th>{dictionary.schedule.payment}</th>
                <th>{dictionary.schedule.principalPart}</th>
                <th>{dictionary.schedule.interestPart}</th>
                <th>{dictionary.schedule.remainingBalance}</th>
              </tr>
            </thead>
            <tbody>
              {results.schedule.map((item) => (
                <tr key={item.month}>
                  <td>{item.month}</td>
                  <td>{formatCurrency(item.payment)}</td>
                  <td>{formatCurrency(item.principalPart)}</td>
                  <td>{formatCurrency(item.interestPart)}</td>
                  <td>{formatCurrency(item.remainingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
