"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  calculateLoanScenarios,
  type LoanCalculationInput,
  type LoanScenarioResult,
  type RepaymentStrategy,
} from "@/lib/calculations";
import type { Dictionary, Locale } from "@/lib/i18n";

type OneTimePaymentField = {
  id: number;
  month: number;
  amount: number;
};

type FormValues = {
  principal: number;
  months: number;
  annualRate: number;
  commission: number;
  insurance: number;
  hasExtraPayments: boolean;
  recurringEnabled: boolean;
  recurringAmount: number;
  recurringStart: number;
  recurringEnd: number | "";
  oneTimePayments: OneTimePaymentField[];
  strategy: RepaymentStrategy;
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
  hasExtraPayments: false,
  recurringEnabled: false,
  recurringAmount: 100,
  recurringStart: 1,
  recurringEnd: "",
  oneTimePayments: [],
  strategy: "compare",
};

function formatCurrency(value: number): string {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  const [integer, decimals] = rounded.toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const fraction = decimals === "00" ? "" : `,${decimals}`;

  return `${grouped}${fraction} AZN`;
}

function toCalculationInput(values: FormValues): LoanCalculationInput {
  return {
    principal: values.principal,
    annualRate: values.annualRate,
    months: values.months,
    commissionPercent: values.commission,
    insuranceAmount: values.insurance,
    hasExtraPayments: values.hasExtraPayments,
    recurringExtraPayment: {
      enabled: values.hasExtraPayments && values.recurringEnabled,
      amount: values.recurringAmount,
      startMonth: values.recurringStart,
      endMonth: values.recurringEnd === "" ? null : values.recurringEnd,
    },
    oneTimeExtraPayments: values.hasExtraPayments
      ? values.oneTimePayments.map(({ month, amount }) => ({ month, amount }))
      : [],
    strategy: values.strategy,
  };
}

function findScenario(
  scenarios: LoanScenarioResult[],
  key: LoanScenarioResult["key"]
) {
  return scenarios.find((scenario) => scenario.key === key) ?? scenarios[0];
}

export default function Calculator({
  locale,
  dictionary,
}: CalculatorProps) {
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [calculatedInput, setCalculatedInput] = useState<LoanCalculationInput>(
    toCalculationInput(initialValues)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nextPaymentId, setNextPaymentId] = useState(1);
  const [scheduleTab, setScheduleTab] =
    useState<LoanScenarioResult["key"]>("reduce_term");

  const scenarios = useMemo(
    () => calculateLoanScenarios(calculatedInput),
    [calculatedInput]
  );
  const baseScenario = findScenario(scenarios, "base");
  const reduceTermScenario = findScenario(scenarios, "reduce_term");
  const reducePaymentScenario = findScenario(scenarios, "reduce_payment");
  const activeScenarioKey: LoanScenarioResult["key"] =
    !calculatedInput.hasExtraPayments
      ? "base"
      : calculatedInput.strategy === "compare"
        ? scheduleTab
        : calculatedInput.strategy;
  const activeScenario = findScenario(scenarios, activeScenarioKey);
  const commissionAmount =
    (calculatedInput.principal * calculatedInput.commissionPercent) / 100;
  const interestSavings = Math.max(
    0,
    baseScenario.summary.totalInterest - activeScenario.summary.totalInterest
  );
  const termSavings =
    baseScenario.summary.totalInterest -
    reduceTermScenario.summary.totalInterest;
  const paymentSavings =
    baseScenario.summary.totalInterest -
    reducePaymentScenario.summary.totalInterest;

  function setNumberField(
    field:
      | "principal"
      | "months"
      | "annualRate"
      | "commission"
      | "insurance"
      | "recurringAmount"
      | "recurringStart",
    value: string
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value === "" ? Number.NaN : Number(value),
    }));
    clearError(field);
  }

  function clearError(key: string) {
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function updateOneTimePayment(
    id: number,
    field: "month" | "amount",
    value: string
  ) {
    setFormValues((current) => ({
      ...current,
      oneTimePayments: current.oneTimePayments.map((payment) =>
        payment.id === id
          ? {
              ...payment,
              [field]: value === "" ? Number.NaN : Number(value),
            }
          : payment
      ),
    }));
    clearError(`oneTime-${id}-${field}`);
  }

  function addOneTimePayment() {
    setFormValues((current) => ({
      ...current,
      oneTimePayments: [
        ...current.oneTimePayments,
        { id: nextPaymentId, month: 1, amount: 100 },
      ],
    }));
    setNextPaymentId((current) => current + 1);
  }

  function removeOneTimePayment(id: number) {
    setFormValues((current) => ({
      ...current,
      oneTimePayments: current.oneTimePayments.filter(
        (payment) => payment.id !== id
      ),
    }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

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

    if (formValues.hasExtraPayments && formValues.recurringEnabled) {
      if (
        !Number.isFinite(formValues.recurringAmount) ||
        formValues.recurringAmount < 0
      ) {
        nextErrors.recurringAmount = dictionary.errors.recurringAmount;
      }
      if (
        !Number.isInteger(formValues.recurringStart) ||
        formValues.recurringStart < 1 ||
        formValues.recurringStart > formValues.months
      ) {
        nextErrors.recurringStart = dictionary.errors.recurringStart;
      }
      if (
        formValues.recurringEnd !== "" &&
        (!Number.isInteger(formValues.recurringEnd) ||
          formValues.recurringEnd < formValues.recurringStart ||
          formValues.recurringEnd > formValues.months)
      ) {
        nextErrors.recurringEnd = dictionary.errors.recurringEnd;
      }
    }

    if (formValues.hasExtraPayments) {
      formValues.oneTimePayments.forEach((payment) => {
        if (
          !Number.isInteger(payment.month) ||
          payment.month < 1 ||
          payment.month > formValues.months
        ) {
          nextErrors[`oneTime-${payment.id}-month`] =
            dictionary.errors.oneTimeMonth;
        }
        if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
          nextErrors[`oneTime-${payment.id}-amount`] =
            dictionary.errors.oneTimeAmount;
        }
      });
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
    setCalculatedInput(toCalculationInput(formValues));
    setScheduleTab(
      formValues.strategy === "reduce_payment"
        ? "reduce_payment"
        : "reduce_term"
    );
  }

  const mainFields = [
    { key: "principal" as const, step: "100", min: 0 },
    { key: "months" as const, step: "1", min: 1 },
    { key: "annualRate" as const, step: "0.1", min: 0 },
    { key: "commission" as const, step: "0.1", min: 0 },
    { key: "insurance" as const, step: "1", min: 0 },
  ];

  const resultCards = [
    {
      key: "monthlyPayment",
      value: formatCurrency(activeScenario.summary.firstRegularPayment),
    },
    {
      key: "finalTerm",
      value: `${activeScenario.summary.monthsCount} ${dictionary.results.monthsUnit}`,
    },
    {
      key: "totalPayment",
      value: formatCurrency(activeScenario.summary.totalPaid),
    },
    {
      key: "totalInterest",
      value: formatCurrency(activeScenario.summary.totalInterest),
    },
    {
      key: "commissionAmount",
      value: formatCurrency(commissionAmount),
    },
    {
      key: "insuranceAmount",
      value: formatCurrency(calculatedInput.insuranceAmount),
    },
    {
      key: "overpayment",
      value: formatCurrency(activeScenario.summary.overpayment),
    },
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

      <form className="calculator-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <h2>{dictionary.formTitle}</h2>
          <div className="fields-grid">
            {mainFields.map(({ key, step, min }) => (
              <NumberField
                key={key}
                id={key}
                label={dictionary.fields[key]}
                value={formValues[key]}
                min={min}
                step={step}
                error={errors[key]}
                onChange={(value) => setNumberField(key, value)}
              />
            ))}
          </div>
        </section>

        <section className="form-section extra-section">
          <div className="section-heading-row">
            <h2>{dictionary.extra.question}</h2>
            <div className="segmented-control">
              <button
                type="button"
                className={!formValues.hasExtraPayments ? "selected" : ""}
                onClick={() =>
                  setFormValues((current) => ({
                    ...current,
                    hasExtraPayments: false,
                  }))
                }
              >
                {dictionary.extra.no}
              </button>
              <button
                type="button"
                className={formValues.hasExtraPayments ? "selected" : ""}
                onClick={() =>
                  setFormValues((current) => ({
                    ...current,
                    hasExtraPayments: true,
                  }))
                }
              >
                {dictionary.extra.yes}
              </button>
            </div>
          </div>

          {formValues.hasExtraPayments && (
            <div className="extra-options">
              <article className="option-card">
                <h3>{dictionary.extra.recurringTitle}</h3>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={formValues.recurringEnabled}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        recurringEnabled: event.target.checked,
                      }))
                    }
                  />
                  <span>{dictionary.extra.recurringEnabled}</span>
                </label>

                {formValues.recurringEnabled && (
                  <div className="compact-grid">
                    <NumberField
                      id="recurringAmount"
                      label={dictionary.extra.recurringAmount}
                      value={formValues.recurringAmount}
                      min={0}
                      step="10"
                      error={errors.recurringAmount}
                      onChange={(value) =>
                        setNumberField("recurringAmount", value)
                      }
                    />
                    <NumberField
                      id="recurringStart"
                      label={dictionary.extra.recurringStart}
                      value={formValues.recurringStart}
                      min={1}
                      step="1"
                      error={errors.recurringStart}
                      onChange={(value) =>
                        setNumberField("recurringStart", value)
                      }
                    />
                    <div className="field">
                      <label htmlFor="recurringEnd">
                        {dictionary.extra.recurringEnd}
                      </label>
                      <input
                        id="recurringEnd"
                        type="number"
                        min="1"
                        step="1"
                        value={formValues.recurringEnd}
                        onChange={(event) => {
                          setFormValues((current) => ({
                            ...current,
                            recurringEnd:
                              event.target.value === ""
                                ? ""
                                : Number(event.target.value),
                          }));
                          clearError("recurringEnd");
                        }}
                        aria-invalid={Boolean(errors.recurringEnd)}
                      />
                      <small>{dictionary.extra.recurringEndHint}</small>
                      {errors.recurringEnd && (
                        <p className="field-error">{errors.recurringEnd}</p>
                      )}
                    </div>
                  </div>
                )}
              </article>

              <article className="option-card">
                <h3>{dictionary.extra.oneTimeTitle}</h3>
                <div className="one-time-list">
                  {formValues.oneTimePayments.map((payment) => (
                    <div className="one-time-row" key={payment.id}>
                      <NumberField
                        id={`oneTime-${payment.id}-month`}
                        label={dictionary.extra.paymentMonth}
                        value={payment.month}
                        min={1}
                        step="1"
                        error={errors[`oneTime-${payment.id}-month`]}
                        onChange={(value) =>
                          updateOneTimePayment(payment.id, "month", value)
                        }
                      />
                      <NumberField
                        id={`oneTime-${payment.id}-amount`}
                        label={dictionary.extra.paymentAmount}
                        value={payment.amount}
                        min={0}
                        step="100"
                        error={errors[`oneTime-${payment.id}-amount`]}
                        onChange={(value) =>
                          updateOneTimePayment(payment.id, "amount", value)
                        }
                      />
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeOneTimePayment(payment.id)}
                      >
                        {dictionary.extra.remove}
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="add-button"
                  onClick={addOneTimePayment}
                >
                  + {dictionary.extra.addPayment}
                </button>
              </article>

              <fieldset className="strategy-fieldset">
                <legend>{dictionary.extra.strategyQuestion}</legend>
                <div className="strategy-grid">
                  {(
                    [
                      "reduce_term",
                      "reduce_payment",
                      "compare",
                    ] as RepaymentStrategy[]
                  ).map((strategy) => (
                    <label
                      className={`strategy-card ${
                        formValues.strategy === strategy ? "selected" : ""
                      }`}
                      key={strategy}
                    >
                      <input
                        type="radio"
                        name="strategy"
                        value={strategy}
                        checked={formValues.strategy === strategy}
                        onChange={() =>
                          setFormValues((current) => ({
                            ...current,
                            strategy,
                          }))
                        }
                      />
                      <span>{dictionary.extra.strategies[strategy]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        </section>

        <button type="submit" className="calculate-button">
          {dictionary.calculate}
        </button>
      </form>

      <section className="results-section" aria-live="polite">
        <h2>{dictionary.resultsTitle}</h2>
        <div className="results-grid">
          {resultCards.map(({ key, value }, index) => (
            <article
              className={`result-card ${index === 0 ? "featured" : ""}`}
              key={key}
            >
              <p>{dictionary.results[key]}</p>
              <strong>{value}</strong>
            </article>
          ))}
          {calculatedInput.hasExtraPayments && (
            <article className="result-card savings-card">
              <p>{dictionary.results.savings}</p>
              <strong>{formatCurrency(interestSavings)}</strong>
            </article>
          )}
        </div>
      </section>

      {calculatedInput.hasExtraPayments && (
        <>
          <section className="comparison-section">
            <h2>{dictionary.comparisonTitle}</h2>
            <div className="table-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>{dictionary.comparison.scenario}</th>
                    <th>{dictionary.comparison.firstPayment}</th>
                    <th>{dictionary.comparison.lastPayment}</th>
                    <th>{dictionary.comparison.finalTerm}</th>
                    <th>{dictionary.comparison.totalPaid}</th>
                    <th>{dictionary.comparison.interest}</th>
                    <th>{dictionary.comparison.savings}</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario) => (
                    <tr key={scenario.key}>
                      <td>{dictionary.scenarioLabels[scenario.key]}</td>
                      <td>
                        {formatCurrency(scenario.summary.firstRegularPayment)}
                      </td>
                      <td>
                        {formatCurrency(scenario.summary.lastRegularPayment)}
                      </td>
                      <td>
                        {scenario.summary.monthsCount}{" "}
                        {dictionary.results.monthsUnit}
                      </td>
                      <td>{formatCurrency(scenario.summary.totalPaid)}</td>
                      <td>{formatCurrency(scenario.summary.totalInterest)}</td>
                      <td>
                        {formatCurrency(
                          Math.max(
                            0,
                            baseScenario.summary.totalInterest -
                              scenario.summary.totalInterest
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="recommendation-card">
            <div>
              <p className="eyebrow">{dictionary.recommendationTitle}</p>
              <p>
                {calculatedInput.strategy === "reduce_payment" ||
                (calculatedInput.strategy === "compare" &&
                  paymentSavings > termSavings)
                  ? dictionary.recommendationPayment
                  : dictionary.recommendationTerm}
              </p>
            </div>
            <strong>{formatCurrency(Math.max(termSavings, paymentSavings))}</strong>
          </aside>
        </>
      )}

      <section className="schedule-section">
        <div className="schedule-heading">
          <h2>{dictionary.scheduleTitle}</h2>
          {calculatedInput.hasExtraPayments &&
            calculatedInput.strategy === "compare" && (
              <div className="schedule-tabs" role="tablist">
                {(
                  ["base", "reduce_term", "reduce_payment"] as const
                ).map((key) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={scheduleTab === key}
                    className={scheduleTab === key ? "selected" : ""}
                    onClick={() => setScheduleTab(key)}
                    key={key}
                  >
                    {dictionary.scenarioLabels[key]}
                  </button>
                ))}
              </div>
            )}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{dictionary.schedule.month}</th>
                <th>{dictionary.schedule.regularPayment}</th>
                <th>{dictionary.schedule.extraPayment}</th>
                <th>{dictionary.schedule.totalPayment}</th>
                <th>{dictionary.schedule.principalPart}</th>
                <th>{dictionary.schedule.interest}</th>
                <th>{dictionary.schedule.endingBalance}</th>
              </tr>
            </thead>
            <tbody>
              {activeScenario.schedule.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{formatCurrency(row.regularPayment)}</td>
                  <td>{formatCurrency(row.extraPayment)}</td>
                  <td>{formatCurrency(row.totalPayment)}</td>
                  <td>{formatCurrency(row.principalPart)}</td>
                  <td>{formatCurrency(row.interest)}</td>
                  <td>{formatCurrency(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

type NumberFieldProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  step: string;
  error?: string;
  onChange: (value: string) => void;
};

function NumberField({
  id,
  label,
  value,
  min,
  step,
  error,
  onChange,
}: NumberFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={Number.isNaN(value) ? "" : value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
