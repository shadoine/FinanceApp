import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  ArrowUpRight, 
  HelpCircle, 
  TrendingUp, 
  PiggyBank, 
  Coins 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface ProjectionCalculatorProps {
  currency: string;
  defaultInitial: number;
  defaultMonthly: number;
  defaultReturn: number;
}

export default function ProjectionCalculator({ currency, defaultInitial, defaultMonthly, defaultReturn }: ProjectionCalculatorProps) {
  const [initialAmount, setInitialAmount] = useState<number>(defaultInitial);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(defaultMonthly);
  const [annualReturn, setAnnualReturn] = useState<number>(defaultReturn);
  const [years, setYears] = useState<number>(15);

  const projectionData = useMemo(() => {
    const data = [];
    const monthlyRate = annualReturn / 100 / 12;
    let balance = initialAmount;
    let totalContributed = initialAmount;

    // Add starting year 0
    data.push({
      year: 'Year 0',
      totalSaved: Math.round(balance),
      contributions: Math.round(totalContributed),
      interest: 0,
    });

    for (let year = 1; year <= years; year++) {
      // Calculate month by month compounding
      for (let month = 1; month <= 12; month++) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
        totalContributed += monthlyContribution;
      }
      
      const interestEarned = balance - totalContributed;

      data.push({
        year: `Year ${year}`,
        totalSaved: Math.round(balance),
        contributions: Math.round(totalContributed),
        interest: Math.round(interestEarned > 0 ? interestEarned : 0),
      });
    }
    return data;
  }, [initialAmount, monthlyContribution, annualReturn, years]);

  const finalYearData = projectionData[projectionData.length - 1];
  const finalTotal = finalYearData.totalSaved;
  const finalContributed = finalYearData.contributions;
  const finalInterest = finalYearData.interest;
  
  const interestPercentage = finalTotal > 0 ? (finalInterest / finalTotal) * 100 : 0;

  return (
    <div className="bg-[#0B0B0E] p-6 rounded-2xl border border-zinc-900 shadow-md space-y-6" id="projection-section">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-zinc-500" />
          Interactive Wealth Compound Projections
        </h3>
        <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-900/40 px-2 py-0.5 rounded-md font-semibold">
          COMPOUND INTEREST
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Control Panel */}
        <div className="lg:col-span-4 space-y-5">
          {/* Slider 1: Initial Principle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-zinc-400">Starting Portfolio Principal</label>
              <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-850 focus-within:border-amber-500/50 transition-colors">
                <span className="text-[10px] font-mono text-zinc-500">{currency}</span>
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  value={initialAmount ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setInitialAmount(Math.min(10000000, val));
                  }}
                  className="w-20 bg-transparent text-right font-mono text-xs font-bold text-zinc-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <input 
              type="range" min="0" max="10000000" step="5000"
              value={initialAmount ?? 0}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>{currency}0</span>
              <span>{currency}10M</span>
            </div>
          </div>

          {/* Slider 2: Monthly Contributions */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-zinc-400">Monthly Target Savings</label>
              <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-850 focus-within:border-amber-500/50 transition-colors">
                <span className="text-[10px] font-mono text-zinc-500">{currency}</span>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={monthlyContribution ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setMonthlyContribution(Math.min(100000, val));
                  }}
                  className="w-16 bg-transparent text-right font-mono text-xs font-bold text-zinc-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] font-mono text-zinc-500">/mo</span>
              </div>
            </div>
            <input 
              type="range" min="0" max="10000" step="100"
              value={monthlyContribution ?? 0}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>{currency}0</span>
              <span>{currency}10k / mo</span>
            </div>
          </div>

          {/* Slider 3: Expected Annual Return */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-zinc-400">Expected Annual Return</label>
              <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-850 focus-within:border-amber-500/50 transition-colors">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={annualReturn ?? 0}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setAnnualReturn(Math.min(50, val));
                  }}
                  className="w-12 bg-transparent text-right font-mono text-xs font-bold text-zinc-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] font-mono text-zinc-500">%</span>
              </div>
            </div>
            <input 
              type="range" min="1" max="20" step="0.5"
              value={annualReturn ?? 1}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>1% (Defensive)</span>
              <span>20% (Aggressive)</span>
            </div>
          </div>

          {/* Slider 4: Time Horizon */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-zinc-400">Time Horizon</label>
              <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-850 focus-within:border-amber-500/50 transition-colors">
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={years ?? 1}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 1 : Number(e.target.value);
                    setYears(Math.min(50, Math.max(1, val)));
                  }}
                  className="w-10 bg-transparent text-right font-mono text-xs font-bold text-zinc-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] font-mono text-zinc-500">Yrs</span>
              </div>
            </div>
            <input 
              type="range" min="1" max="40" step="1"
              value={years ?? 1}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>1 Year</span>
              <span>40 Years</span>
            </div>
          </div>
        </div>

        {/* Chart & Results Display */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-905 p-4 rounded-xl border border-zinc-900">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 uppercase">Projected Net Worth</span>
              <div className="text-lg font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {currency}{finalTotal.toLocaleString()}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 uppercase">Total Contributed</span>
              <div className="text-lg font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-blue-400" />
                {currency}{finalContributed.toLocaleString()}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 uppercase">Compound Earnings</span>
              <div className="text-lg font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                {currency}{finalInterest.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Area Chart with Gradient Fills */}
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorContributed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f23" />
                <XAxis 
                  dataKey="year" 
                  tickLine={false}
                  stroke="#52525b"
                  style={{ fontSize: '10px', fontFamily: 'monospace' }} 
                />
                <YAxis 
                  tickLine={false}
                  stroke="#52525b"
                  style={{ fontSize: '10px', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${currency}${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${currency}${value.toLocaleString()}`]}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5', fontFamily: 'monospace' }}
                />
                <Area 
                  type="monotone" 
                  name="Projected Total"
                  dataKey="totalSaved" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSavings)" 
                />
                <Area 
                  type="monotone" 
                  name="Contributions Only"
                  dataKey="contributions" 
                  stroke="#a1a1aa" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorContributed)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Custom projection text report */}
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans border-l-2 border-amber-500 pl-3">
            Investing discipline projection: Over a <span className="font-semibold text-zinc-200">{years}-year</span> span, 
            investing <span className="font-mono font-semibold text-zinc-200">{currency}{monthlyContribution.toLocaleString()}/mo</span> on 
            top of your <span className="font-mono font-semibold text-zinc-200">{currency}{initialAmount.toLocaleString()}</span> principal yields 
            a terminal net worth of <span className="font-mono font-bold text-amber-400">{currency}{finalTotal.toLocaleString()}</span> (at {annualReturn}% ARR). 
            Compound gains account for <span className="font-bold text-zinc-200 font-mono">{interestPercentage.toFixed(0)}%</span> of your total holdings, totaling <span className="font-mono font-semibold text-amber-400">{currency}{finalInterest.toLocaleString()}</span> in free interest!
          </p>
        </div>
      </div>
    </div>
  );
}
