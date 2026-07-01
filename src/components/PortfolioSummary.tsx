import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  Coins, 
  ShieldCheck, 
  Building2, 
  PieChart as PieIcon, 
  RefreshCw, 
  Plus, 
  ArrowUpRight, 
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Portfolio, Transaction } from '../types';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  currency: string;
  onUpdatePortfolio: (updatedPortfolio: Portfolio, transaction?: Omit<Transaction, 'id' | 'date'>) => void;
  settings?: any;
  onUpdateSettings?: (updatedSettings: any) => void;
}

export default function PortfolioSummary({ portfolio, currency, onUpdatePortfolio, settings, onUpdateSettings }: PortfolioSummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    cash: portfolio.cash,
    stocks: portfolio.stocks,
    crypto: portfolio.crypto,
    bonds: portfolio.bonds,
    realEstate: portfolio.realEstate,
    targetCash: portfolio.targetAllocation.cash,
    targetStocks: portfolio.targetAllocation.stocks,
    targetCrypto: portfolio.targetAllocation.crypto,
    targetBonds: portfolio.targetAllocation.bonds,
    targetRealEstate: portfolio.targetAllocation.realEstate,
    nameCash: settings?.assetNames?.cash || 'Cash / High-Yield Savings',
    nameStocks: settings?.assetNames?.stocks || 'Stocks & ETFs',
    nameCrypto: settings?.assetNames?.crypto || 'Crypto & Alternatives',
    nameBonds: settings?.assetNames?.bonds || 'Bonds & Treasuries',
    nameRealEstate: settings?.assetNames?.realEstate || 'Real Estate / Land',
  });

  useEffect(() => {
    if (isEditing) {
      setEditForm({
        cash: portfolio.cash,
        stocks: portfolio.stocks,
        crypto: portfolio.crypto,
        bonds: portfolio.bonds,
        realEstate: portfolio.realEstate,
        targetCash: portfolio.targetAllocation.cash,
        targetStocks: portfolio.targetAllocation.stocks,
        targetCrypto: portfolio.targetAllocation.crypto,
        targetBonds: portfolio.targetAllocation.bonds,
        targetRealEstate: portfolio.targetAllocation.realEstate,
        nameCash: settings?.assetNames?.cash || 'Cash / High-Yield Savings',
        nameStocks: settings?.assetNames?.stocks || 'Stocks & ETFs',
        nameCrypto: settings?.assetNames?.crypto || 'Crypto & Alternatives',
        nameBonds: settings?.assetNames?.bonds || 'Bonds & Treasuries',
        nameRealEstate: settings?.assetNames?.realEstate || 'Real Estate / Land',
      });
    }
  }, [isEditing, portfolio, settings]);

  const totalValue = portfolio.cash + portfolio.stocks + portfolio.crypto + portfolio.bonds + portfolio.realEstate;

  // Asset configurations for rendering
  const assetTypes = [
    { key: 'stocks', name: settings?.assetNames?.stocks || 'Stocks & ETFs', value: portfolio.stocks, icon: TrendingUp, color: '#10b981', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' },
    { key: 'cash', name: settings?.assetNames?.cash || 'Cash / High-Yield Savings', value: portfolio.cash, icon: DollarSign, color: '#3b82f6', bg: 'bg-blue-950/40 text-blue-400 border-blue-900/30' },
    { key: 'bonds', name: settings?.assetNames?.bonds || 'Bonds & Treasuries', value: portfolio.bonds, icon: ShieldCheck, color: '#8b5cf6', bg: 'bg-violet-950/40 text-violet-400 border-violet-900/30' },
    { key: 'crypto', name: settings?.assetNames?.crypto || 'Crypto & Alternatives', value: portfolio.crypto, icon: Coins, color: '#f59e0b', bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30' },
    { key: 'realEstate', name: settings?.assetNames?.realEstate || 'Real Estate / Land', value: portfolio.realEstate, icon: Building2, color: '#ec4899', bg: 'bg-pink-950/40 text-pink-400 border-pink-900/30' },
  ] as const;

  // Chart data formatting
  const chartData = assetTypes
    .filter(asset => asset.value > 0)
    .map(asset => ({
      name: asset.name,
      value: asset.value,
      percentage: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
      color: asset.color
    }));

  // Target allocations formatting
  const targetChartData = [
    { name: settings?.assetNames?.stocks || 'Stocks & ETFs', value: portfolio.targetAllocation.stocks, color: '#10b981' },
    { name: settings?.assetNames?.cash || 'Cash', value: portfolio.targetAllocation.cash, color: '#3b82f6' },
    { name: settings?.assetNames?.bonds || 'Bonds & Treasuries', value: portfolio.targetAllocation.bonds, color: '#8b5cf6' },
    { name: settings?.assetNames?.crypto || 'Crypto & Alts', value: portfolio.targetAllocation.crypto, color: '#f59e0b' },
    { name: settings?.assetNames?.realEstate || 'Real Estate', value: portfolio.targetAllocation.realEstate, color: '#ec4899' },
  ].filter(t => t.value > 0);

  // Calculation of overweight / underweight assets for advisor
  const rebalanceSuggestions = assetTypes.map(asset => {
    const targetPct = portfolio.targetAllocation[asset.key as keyof typeof portfolio.targetAllocation] || 0;
    const currentPct = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
    const diffPct = currentPct - targetPct;
    const diffVal = (diffPct / 100) * totalValue;

    return {
      ...asset,
      currentPct,
      targetPct,
      diffPct,
      diffVal
    };
  }).filter(item => Math.abs(item.diffPct) > 2); // Only suggest if deviation is > 2%

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check total target allocation sum is roughly 100%
    const totalTarget = 
      Number(editForm.targetCash) + 
      Number(editForm.targetStocks) + 
      Number(editForm.targetCrypto) + 
      Number(editForm.targetBonds) + 
      Number(editForm.targetRealEstate);

    if (totalTarget !== 100) {
      alert(`Target allocations must sum to 100%. Current total is ${totalTarget}%.`);
      return;
    }

    // Determine changes to log a transaction
    const diffStocks = Number(editForm.stocks) - portfolio.stocks;
    const diffCrypto = Number(editForm.crypto) - portfolio.crypto;
    const diffBonds = Number(editForm.bonds) - portfolio.bonds;
    const diffReal = Number(editForm.realEstate) - portfolio.realEstate;
    const diffCash = Number(editForm.cash) - portfolio.cash;

    // Create a generic transaction log if values increased/decreased significantly
    let logTransaction: Omit<Transaction, 'id' | 'date'> | undefined;
    const totalChange = Math.abs(diffStocks) + Math.abs(diffCrypto) + Math.abs(diffBonds) + Math.abs(diffReal) + Math.abs(diffCash);
    
    if (totalChange > 10) {
      const descriptions: string[] = [];
      const labelStocks = editForm.nameStocks || 'Stocks';
      const labelCrypto = editForm.nameCrypto || 'Crypto';
      const labelBonds = editForm.nameBonds || 'Bonds';
      const labelReal = editForm.nameRealEstate || 'Real Estate';
      const labelCash = editForm.nameCash || 'Cash';

      if (diffStocks !== 0) descriptions.push(`${labelStocks}: ${diffStocks > 0 ? '+' : ''}${diffStocks}`);
      if (diffCrypto !== 0) descriptions.push(`${labelCrypto}: ${diffCrypto > 0 ? '+' : ''}${diffCrypto}`);
      if (diffBonds !== 0) descriptions.push(`${labelBonds}: ${diffBonds > 0 ? '+' : ''}${diffBonds}`);
      if (diffReal !== 0) descriptions.push(`${labelReal}: ${diffReal > 0 ? '+' : ''}${diffReal}`);
      if (diffCash !== 0) descriptions.push(`${labelCash}: ${diffCash > 0 ? '+' : ''}${diffCash}`);

      logTransaction = {
        type: totalChange > 0 ? 'contribution' : 'withdrawal',
        amount: Math.abs(totalChange),
        description: `Manual Portfolio Adjustment (${descriptions.slice(0, 2).join(', ')}${descriptions.length > 2 ? '...' : ''})`,
        category: 'Portfolio Update'
      };
    }

    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        assetNames: {
          cash: editForm.nameCash,
          stocks: editForm.nameStocks,
          crypto: editForm.nameCrypto,
          bonds: editForm.nameBonds,
          realEstate: editForm.nameRealEstate
        }
      });
    }

    const updated: Portfolio = {
      cash: Number(editForm.cash),
      stocks: Number(editForm.stocks),
      crypto: Number(editForm.crypto),
      bonds: Number(editForm.bonds),
      realEstate: Number(editForm.realEstate),
      targetAllocation: {
        cash: Number(editForm.targetCash),
        stocks: Number(editForm.targetStocks),
        crypto: Number(editForm.targetCrypto),
        bonds: Number(editForm.targetBonds),
        realEstate: Number(editForm.targetRealEstate)
      }
    };

    onUpdatePortfolio(updated, logTransaction);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8" id="portfolio-section">
      {/* Header Cards & Net Worth */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Total Holdings Balance</span>
          <h2 className="text-4xl font-display font-bold text-zinc-100 tracking-tight mt-1 flex items-baseline">
            <span className="text-2xl text-zinc-500 mr-1 font-sans font-light">{currency}</span>
            <span className="font-mono text-zinc-100">{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </h2>
        </div>
        <button
          id="btn-edit-assets"
          onClick={() => {
            setEditForm({
              cash: portfolio.cash,
              stocks: portfolio.stocks,
              crypto: portfolio.crypto,
              bonds: portfolio.bonds,
              realEstate: portfolio.realEstate,
              targetCash: portfolio.targetAllocation.cash,
              targetStocks: portfolio.targetAllocation.stocks,
              targetCrypto: portfolio.targetAllocation.crypto,
              targetBonds: portfolio.targetAllocation.bonds,
              targetRealEstate: portfolio.targetAllocation.realEstate,
            });
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors shadow-md"
        >
          <RefreshCw className="w-4 h-4 text-amber-200" />
          Manage Allocation & Values
        </button>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="asset-grid">
        {assetTypes.map((asset) => {
          const Icon = asset.icon;
          const percentage = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
          return (
            <motion.div
              key={asset.key}
              whileHover={{ y: -2, borderColor: '#3f3f46' }}
              className="bg-[#0B0B0E] p-5 rounded-2xl border border-zinc-900 shadow-md flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{asset.name}</span>
                <div className={`p-2 rounded-xl border ${asset.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xl font-mono font-bold text-zinc-100">
                  {currency}{asset.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: asset.color
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-medium whitespace-nowrap">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts & Rebalancing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Allocation Pie Charts */}
        <div className="lg:col-span-8 bg-[#0B0B0E] p-6 rounded-2xl border border-zinc-900 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-zinc-500" />
              Allocation Analysis
            </h3>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Current</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span> Target</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[240px]">
            {/* Current Allocation Chart */}
            <div className="relative h-full">
              <span className="absolute top-0 left-0 text-xs font-semibold text-zinc-400">Current Distribution</span>
              {totalValue > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="55%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => [`${currency}${val.toLocaleString()}`, 'Value']}
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5', fontFamily: 'monospace' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-zinc-500">No assets funded yet</div>
              )}
            </div>

            {/* Target Allocation Chart */}
            <div className="relative h-full border-l border-zinc-900 pl-4 md:pl-6">
              <span className="absolute top-0 left-0 text-xs font-semibold text-zinc-400">Desired Target Allocation</span>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={targetChartData}
                    cx="50%"
                    cy="55%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {targetChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [`${val}%`, 'Target Allocation']}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#f4f4f5', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Smart Rebalancing Advisor */}
        <div className="lg:col-span-4 bg-[#0B0B0E] p-6 rounded-2xl border border-zinc-900 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-amber-400 animate-pulse" />
              Rebalancing Advisor
            </h3>

            <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1">
              {rebalanceSuggestions.length > 0 ? (
                rebalanceSuggestions.map((item, idx) => {
                  const isOver = item.diffPct > 0;
                  return (
                    <div key={idx} className="flex gap-3 text-xs">
                      <div className="mt-0.5">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-md font-mono text-[10px] font-semibold ${isOver ? 'bg-amber-950/60 text-amber-300 border border-amber-900/40' : 'bg-blue-950/60 text-blue-300 border border-blue-900/40'}`}>
                          {isOver ? 'OVER' : 'UNDER'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-medium text-zinc-300">{item.name}</span>
                        <p className="text-zinc-500 text-[11px] leading-relaxed">
                          Currently at <span className="font-mono text-zinc-400">{item.currentPct.toFixed(1)}%</span> vs target of <span className="font-mono text-zinc-400">{item.targetPct}%</span>. 
                          {isOver ? ' Reallocate ' : ' Invest '} 
                          <span className="font-mono text-zinc-300 font-semibold">{currency}{Math.abs(item.diffVal).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> to optimize.
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <span className="text-xs font-semibold text-zinc-300">Perfectly Balanced!</span>
                  <p className="text-[11px] text-zinc-500 max-w-[200px] mt-1">Your assets perfectly align with your target allocations. Excellent discipline!</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4 mt-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">Investment Principles</span>
            <p className="text-[11px] text-zinc-500 leading-normal mt-1">Rebalancing minimizes emotional trading. Maintain targets consistently over time.</p>
          </div>
        </div>
      </div>

      {/* Allocation Management Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D11] rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-900">
                <h3 className="font-semibold text-zinc-100 text-lg">Manage Portfolio Allocations & Values</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                  
                  {/* Live Holdings */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-4">Holdings Values & Custom Labels ({currency})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Stocks */}
                      <div>
                        <div className="flex flex-col gap-1.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Asset Label</label>
                            <input
                              type="text"
                              value={editForm.nameStocks ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, nameStocks: e.target.value })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              placeholder="Stocks & ETFs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Value ({currency})</label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.stocks ?? 0}
                              onChange={(e) => setEditForm({ ...editForm, stocks: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cash */}
                      <div>
                        <div className="flex flex-col gap-1.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Asset Label</label>
                            <input
                              type="text"
                              value={editForm.nameCash ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, nameCash: e.target.value })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              placeholder="Cash / High-Yield Savings"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Value ({currency})</label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.cash ?? 0}
                              onChange={(e) => setEditForm({ ...editForm, cash: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bonds */}
                      <div>
                        <div className="flex flex-col gap-1.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Asset Label</label>
                            <input
                              type="text"
                              value={editForm.nameBonds ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, nameBonds: e.target.value })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              placeholder="Bonds & Treasuries"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Value ({currency})</label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.bonds ?? 0}
                              onChange={(e) => setEditForm({ ...editForm, bonds: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Crypto */}
                      <div>
                        <div className="flex flex-col gap-1.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Asset Label</label>
                            <input
                              type="text"
                              value={editForm.nameCrypto ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, nameCrypto: e.target.value })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              placeholder="Crypto & Alternatives"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Value ({currency})</label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.crypto ?? 0}
                              onChange={(e) => setEditForm({ ...editForm, crypto: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Real Estate */}
                      <div className="md:col-span-2">
                        <div className="flex flex-col gap-1.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Asset Label</label>
                            <input
                              type="text"
                              value={editForm.nameRealEstate ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, nameRealEstate: e.target.value })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                              placeholder="Real Estate / Land"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Value ({currency})</label>
                            <input
                              type="number"
                              min="0"
                              value={editForm.realEstate ?? 0}
                              onChange={(e) => setEditForm({ ...editForm, realEstate: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Target Allocation Adjuster */}
                  <div className="border-t border-zinc-900 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300">Target Allocations (%)</h4>
                      <span className="text-xs font-mono text-zinc-400">
                        Total:{' '}
                        <span className={`font-bold ${
                          Number(editForm.targetCash) + 
                          Number(editForm.targetStocks) + 
                          Number(editForm.targetCrypto) + 
                          Number(editForm.targetBonds) + 
                          Number(editForm.targetRealEstate) === 100 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {Number(editForm.targetCash) + 
                           Number(editForm.targetStocks) + 
                           Number(editForm.targetCrypto) + 
                           Number(editForm.targetBonds) + 
                           Number(editForm.targetRealEstate)}%
                        </span> / 100%
                      </span>
                    </div>

                     <div className="space-y-3">
                      {/* Stocks */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-zinc-400 w-32 truncate">{editForm.nameStocks || 'Stocks'}</span>
                        <input 
                          type="range" min="0" max="100" step="5"
                          value={editForm.targetStocks ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, targetStocks: Number(e.target.value) })}
                          className="grow h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-xs font-mono text-zinc-300 w-10 text-right">{editForm.targetStocks ?? 0}%</span>
                      </div>
                      {/* Cash */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-zinc-400 w-32 truncate">{editForm.nameCash || 'Cash'}</span>
                        <input 
                          type="range" min="0" max="100" step="5"
                          value={editForm.targetCash ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, targetCash: Number(e.target.value) })}
                          className="grow h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-xs font-mono text-zinc-300 w-10 text-right">{editForm.targetCash ?? 0}%</span>
                      </div>
                      {/* Bonds */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-zinc-400 w-32 truncate">{editForm.nameBonds || 'Bonds'}</span>
                        <input 
                          type="range" min="0" max="100" step="5"
                          value={editForm.targetBonds ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, targetBonds: Number(e.target.value) })}
                          className="grow h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-xs font-mono text-zinc-300 w-10 text-right">{editForm.targetBonds ?? 0}%</span>
                      </div>
                      {/* Crypto */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-zinc-400 w-32 truncate">{editForm.nameCrypto || 'Crypto'}</span>
                        <input 
                          type="range" min="0" max="100" step="5"
                          value={editForm.targetCrypto ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, targetCrypto: Number(e.target.value) })}
                          className="grow h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-xs font-mono text-zinc-300 w-10 text-right">{editForm.targetCrypto ?? 0}%</span>
                      </div>
                      {/* Real Estate */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-zinc-400 w-32 truncate">{editForm.nameRealEstate || 'Real Estate'}</span>
                        <input 
                          type="range" min="0" max="100" step="5"
                          value={editForm.targetRealEstate ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, targetRealEstate: Number(e.target.value) })}
                          className="grow h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-xs font-mono text-zinc-300 w-10 text-right">{editForm.targetRealEstate ?? 0}%</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-5 border-t border-zinc-900 bg-zinc-950/40 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 text-sm font-medium rounded-lg hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors shadow-md"
                  >
                    Apply Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
