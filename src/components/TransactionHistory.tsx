import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Briefcase,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  currency: string;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  categories: string[];
  settings?: any;
}

export default function TransactionHistory({ transactions, currency, onAddTransaction, categories, settings }: TransactionHistoryProps) {
  const getAssetLabel = (categoryName: string) => {
    if (categoryName === 'Stocks') return settings?.assetNames?.stocks || 'Stocks & ETFs';
    if (categoryName === 'Cash') return settings?.assetNames?.cash || 'Cash / High-Yield Savings';
    if (categoryName === 'Crypto') return settings?.assetNames?.crypto || 'Crypto & Alternatives';
    if (categoryName === 'Bonds') return settings?.assetNames?.bonds || 'Bonds & Treasuries';
    if (categoryName === 'Real Estate') return settings?.assetNames?.realEstate || 'Real Estate / Land';
    return categoryName;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'contribution' | 'withdrawal' | 'gain' | 'loss'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Manual transaction form
  const [isAdding, setIsAdding] = useState(false);
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'contribution' | 'withdrawal' | 'gain' | 'loss'>('contribution');
  const [formCategory, setFormCategory] = useState('Emergency Cushion');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getTransactionIcon = (type: Transaction['type']) => {
    switch(type) {
      case 'contribution':
        return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal':
        return <ArrowDownRight className="w-4 h-4 text-rose-400" />;
      case 'gain':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'loss':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTransactionTypeStyle = (type: Transaction['type']) => {
    switch(type) {
      case 'contribution':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
      case 'withdrawal':
        return 'bg-rose-950/40 text-rose-400 border-rose-900/30';
      case 'gain':
        return 'bg-blue-950/40 text-blue-400 border-blue-900/30';
      case 'loss':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formDescription || Number(formAmount) <= 0) return;

    onAddTransaction({
      amount: Number(formAmount),
      description: formDescription,
      type: formType,
      category: formCategory,
    });

    // Reset Form
    setFormAmount('');
    setFormDescription('');
    setIsAdding(false);
  };

  return (
    <div className="bg-[#0B0B0E] p-6 rounded-2xl border border-zinc-900 shadow-md space-y-6" id="ledger-section">
      
      {/* Header with quick creation toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-500" />
          Local Transaction Ledger & Activity
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isAdding 
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700' 
              : 'bg-amber-500 text-black border border-amber-600 hover:bg-amber-400'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdding ? 'Close Ledger Form' : 'Log Wealth Event'}
        </button>
      </div>

      {/* Inline transaction logger form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-[#0D0D11] rounded-xl border border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Description</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Dividend reinvestment"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Amount ({currency})</label>
            <input 
              type="number" 
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="contribution" className="bg-[#0D0D11]">Contribution (Deposit)</option>
              <option value="withdrawal" className="bg-[#0D0D11]">Withdrawal (Expense)</option>
              <option value="gain" className="bg-[#0D0D11]">Market Gain (Profit)</option>
              <option value="loss" className="bg-[#0D0D11]">Market Loss (Decline)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Destination Category</label>
            <div className="flex gap-2">
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="grow px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                {/* Seed Categories + Custom Existing ones */}
                <optgroup label="Goal Cushions" className="bg-[#0D0D11] text-zinc-400">
                  {categories.filter(c => !['Stocks', 'Crypto', 'Cash', 'Bonds', 'Real Estate'].includes(c)).map(cat => (
                    <option key={cat} value={cat} className="bg-[#0D0D11] text-zinc-100">{cat}</option>
                  ))}
                </optgroup>
                <optgroup label="Primary Asset Classes" className="bg-[#0D0D11] text-zinc-400">
                  <option value="Stocks" className="bg-[#0D0D11] text-zinc-100">{getAssetLabel('Stocks')}</option>
                  <option value="Cash" className="bg-[#0D0D11] text-zinc-100">{getAssetLabel('Cash')}</option>
                  <option value="Crypto" className="bg-[#0D0D11] text-zinc-100">{getAssetLabel('Crypto')}</option>
                  <option value="Bonds" className="bg-[#0D0D11] text-zinc-100">{getAssetLabel('Bonds')}</option>
                  <option value="Real Estate" className="bg-[#0D0D11] text-zinc-100">{getAssetLabel('Real Estate')}</option>
                </optgroup>
              </select>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shadow-md shrink-0 cursor-pointer"
              >
                Log Entry
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filters and Search toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer font-medium pr-1"
            >
              <option value="all" className="bg-[#0D0D11] text-zinc-100">All Types</option>
              <option value="contribution" className="bg-[#0D0D11] text-zinc-100">Contributions</option>
              <option value="withdrawal" className="bg-[#0D0D11] text-zinc-100">Withdrawals</option>
              <option value="gain" className="bg-[#0D0D11] text-zinc-100">Gains</option>
              <option value="loss" className="bg-[#0D0D11] text-zinc-100">Losses</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-zinc-300 focus:outline-none cursor-pointer font-medium pr-1"
            >
              <option value="all" className="bg-[#0D0D11] text-zinc-100">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0D0D11] text-zinc-100">{getAssetLabel(cat)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="overflow-x-auto rounded-xl border border-zinc-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/40 border-b border-zinc-900 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-4 font-semibold">Ledger Entry</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Asset Class / Destination</th>
              <th className="py-3 px-4 font-semibold text-right">Value Change</th>
              <th className="py-3 px-4 font-semibold text-center">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-xs">
            {filteredTransactions.map((t) => {
              const sign = (t.type === 'contribution' || t.type === 'gain') ? '+' : '-';
              const valueColor = (t.type === 'contribution' || t.type === 'gain') ? 'text-emerald-400' : 'text-rose-400';
              const dateStr = new Date(t.date).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              });
              const timeStr = new Date(t.date).toLocaleTimeString(undefined, { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              });

              return (
                <tr key={t.id} className="hover:bg-zinc-950/20 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-zinc-200">
                    {t.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium font-mono ${getTransactionTypeStyle(t.type)}`}>
                      {getTransactionIcon(t.type)}
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-medium">
                    {getAssetLabel(t.category)}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-mono font-bold ${valueColor}`}>
                    {sign}{currency}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </td>
                  <td className="py-3.5 px-4 text-center text-zinc-500 font-mono text-[10px]">
                    <div>{dateStr}</div>
                    <div className="text-[9px] opacity-75">{timeStr}</div>
                  </td>
                </tr>
              );
            })}

            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500 text-xs font-medium">
                  No transaction ledger logs match your filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
