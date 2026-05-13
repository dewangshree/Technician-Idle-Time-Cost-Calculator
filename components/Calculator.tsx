"use client";

import React, { useState, useMemo } from "react";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

interface ResultCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function SliderInput({ label, value, min, max, step, unit, onChange }: SliderInputProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-14 bg-transparent text-right text-sm font-semibold text-gray-800 outline-none"
          />
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6B21E8 0%, #6B21E8 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
        }}
      />
      <div className="mt-0.5 flex justify-between text-[10px] text-gray-300">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ResultCard({ label, value, sub, accent }: ResultCardProps) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-purple-200 bg-purple-600 text-white" : "border-gray-200 bg-white text-gray-800"}`}>
      <p className={`text-xs font-medium ${accent ? "text-purple-200" : "text-gray-400"}`}>{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${accent ? "text-white" : "text-gray-900"}`}>{value}</p>
      {sub && <p className={`mt-0.5 text-xs ${accent ? "text-purple-200" : "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <span className="h-0.5 w-4 rounded-full bg-[#6B21E8]" />
      <span className="text-xs font-bold uppercase tracking-widest text-[#6B21E8]">{children}</span>
    </div>
  );
}

const fmt = (n: number): string =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}k`
  : `$${Math.round(n).toLocaleString()}`;

export default function Calculator() {
  const [numTechs,            setNumTechs]            = useState(10);
  const [idleHoursPerDay,     setIdleHoursPerDay]     = useState(2);
  const [dailyCostPerTech,    setDailyCostPerTech]    = useState(280);
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState(22);
  const [billableRate,        setBillableRate]        = useState(95);
  const [idleReduction,       setIdleReduction]       = useState(60);

  const r = useMemo(() => {
    const hourlyRate             = dailyCostPerTech / 8;
    const monthlyIdleCostPerTech = idleHoursPerDay * hourlyRate * workingDaysPerMonth;
    const fleetAnnualIdleCost    = monthlyIdleCostPerTech * numTechs * 12;
    const potentialAnnualRevenue = idleHoursPerDay * billableRate * numTechs * workingDaysPerMonth * 12;
    const totalUpside            = (fleetAnnualIdleCost + potentialAnnualRevenue) * (idleReduction / 100);
    return {
      monthlyIdleCostPerTech: fmt(monthlyIdleCostPerTech),
      fleetMonthlyIdleCost:   fmt(monthlyIdleCostPerTech * numTechs),
      fleetAnnualIdleCost:    fmt(fleetAnnualIdleCost),
      potentialAnnualRevenue: fmt(potentialAnnualRevenue),
      recoverableRevenue:     fmt(potentialAnnualRevenue * (idleReduction / 100)),
      totalUpside:            fmt(totalUpside),
      idlePercent:            ((idleHoursPerDay / 8) * 100).toFixed(0),
      idleReduction,
    };
  }, [numTechs, idleHoursPerDay, dailyCostPerTech, workingDaysPerMonth, billableRate, idleReduction]);

  const verdict = `Your fleet wastes ${r.fleetAnnualIdleCost}/yr in idle time. Recovering ${r.idleReduction}% with Starlly unlocks ${r.totalUpside} in cost savings and revenue.`;

  return (
    <section id="calculator" className="pb-20">
      <div className="mx-auto max-w-6xl px-6">

        <div className="mb-10 flex items-center gap-3">
          <span className="h-0.5 w-6 rounded-full bg-[#6B21E8]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B21E8]">Tool 02</span>
          <span className="text-xs text-gray-400">Technician Idle Time Cost Calculator</span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            <SectionLabel>Your Fleet</SectionLabel>
            <h3 className="mb-6 text-lg font-bold text-gray-900">Current workforce setup</h3>
            <div className="space-y-6">
              <SliderInput label="Number of technicians"     value={numTechs}            min={1}   max={100}  step={1}   unit=" techs"  onChange={setNumTechs} />
              <SliderInput label="Average idle time per day" value={idleHoursPerDay}     min={0.5} max={8}    step={0.5} unit=" hrs"    onChange={setIdleHoursPerDay} />
              <SliderInput label="Daily cost per technician" value={dailyCostPerTech}    min={100} max={1000} step={10}  unit=" $/day"  onChange={setDailyCostPerTech} />
              <SliderInput label="Working days per month"    value={workingDaysPerMonth} min={15}  max={26}   step={1}   unit=" days"   onChange={setWorkingDaysPerMonth} />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            <SectionLabel>Revenue Potential</SectionLabel>
            <h3 className="mb-6 text-lg font-bold text-gray-900">Billable opportunity and recovery</h3>
            <div className="space-y-6">
              <SliderInput label="Average billable job rate"        value={billableRate}  min={30} max={300} step={5} unit=" $/hr" onChange={setBillableRate} />
              <SliderInput label="Idle time reduction with Starlly" value={idleReduction} min={10} max={90}  step={5} unit="%"     onChange={setIdleReduction} />
            </div>
            <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Per-Technician Breakdown</p>
              <div className="space-y-2">
                {[
                  { label: "Idle time as % of workday",  val: `${r.idlePercent}%` },
                  { label: "Monthly idle cost / tech",   val: r.monthlyIdleCostPerTech },
                  { label: "Fleet monthly idle cost",    val: r.fleetMonthlyIdleCost },
                  { label: "Recoverable revenue / tech", val: r.recoverableRevenue },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{row.label}</span>
                    <span className="text-sm font-bold text-gray-900">{row.val}</span>
                  </div>
                ))}
                <div className="mt-2 border-t border-gray-200 pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Fleet annual idle cost</span>
                  <span className="text-sm font-bold text-red-500">{r.fleetAnnualIdleCost}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm flex-1">
              <SectionLabel>Output</SectionLabel>
              <h3 className="mb-5 text-lg font-bold text-gray-900">Your savings snapshot</h3>
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Monthly idle cost / tech"  value={r.monthlyIdleCostPerTech} sub="Salary + vehicle + overhead" />
                <ResultCard label="Fleet annual idle cost"    value={r.fleetAnnualIdleCost}    sub="All technicians, full year" />
                <ResultCard label="Annual revenue upside"     value={r.potentialAnnualRevenue} sub="If idle time becomes billable" accent />
                <ResultCard label="Recoverable with Starlly" value={r.totalUpside}            sub={`At ${r.idleReduction}% idle reduction`} />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-purple-50 px-4 py-3">
                <span className="text-xs font-medium text-purple-700">Idle time as % of working day</span>
                <span className="text-sm font-bold text-purple-800">{r.idlePercent}% wasted</span>
              </div>
            </div>

            <div className="rounded-3xl p-6 bg-[#1A1523] text-white">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-purple-500 text-white">
                  &#10003;
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Recommendation</span>
              </div>
              <button
  onClick={() => {}}
  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold transition-all bg-[#6B21E8] text-white hover:bg-purple-500"
>
  See how Starlly optimises technician dispatch
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2 6.5h9M8 3.5L11 6.5 8 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</button>
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}