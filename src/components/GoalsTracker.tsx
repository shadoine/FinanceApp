import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Shield, 
  Home, 
  Car, 
  Compass, 
  Heart, 
  Plus, 
  Minus, 
  Calendar, 
  Trash2, 
  Sparkles,
  ChevronRight,
  PlusCircle,
  X
} from 'lucide-react';
import { SavingsGoal, GoalCategory, Transaction } from '../types';

interface GoalsTrackerProps {
  goals: SavingsGoal[];
  currency: string;
  onAddGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalFunds: (id: string, amount: number, isContribution: boolean, goalName: string) => void;
}

const CATEGORIES: { value: GoalCategory; icon: any; label: string }[] = [
  { value: 'Emergency', icon: Shield, label: 'Emergency Fund' },
  { value: 'Housing', icon: Home, label: 'Housing & Property' },
  { value: 'Vehicle', icon: Car, label: 'Car & Transport' },
  { value: 'Travel', icon: Compass, label: 'Travel & Trips' },
  { value: 'Retirement', icon: Heart, label: 'Retirement / Future' },
  { value: 'Other', icon: Target, label: 'Other Special Goal' },
];

const COLORS = [
  { name: 'emerald', class: 'bg-emerald-500 text-emerald-50 border-emerald-100 hover:bg-emerald-600', hex: '#10b981' },
  { name: 'blue', class: 'bg-blue-500 text-blue-50 border-blue-100 hover:bg-blue-600', hex: '#3b82f6' },
  { name: 'indigo', class: 'bg-indigo-500 text-indigo-50 border-indigo-100 hover:bg-indigo-600', hex: '#6366f1' },
  { name: 'amber', class: 'bg-amber-500 text-amber-50 border-amber-100 hover:bg-amber-600', hex: '#f59e0b' },
  { name: 'rose', class: 'bg-rose-500 text-rose-50 border-rose-100 hover:bg-rose-600', hex: '#f43f5e' },
  { name: 'violet', class: 'bg-violet-500 text-violet-50 border-violet-100 hover:bg-violet-600', hex: '#8b5cf6' },
];

export default function GoalsTracker({ goals, currency, onAddGoal, onDeleteGoal, onUpdateGoalFunds }: GoalsTrackerProps) {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [fundingGoalId, setFundingGoalId] = useState<string | null>(null);
  const [fundingType, setFundingType] = useState<'add' | 'withdraw'>('add');
  const [fundingAmount, setFundingAmount] = useState<string>('');

  // New goal form fields
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('0');
  const [newCategory, setNewCategory] = useState<GoalCategory>('Emergency');
  const [newDeadline, setNewDeadline] = useState('');
  const [newColor, setNewColor] = useState('emerald');

  const getCategoryIcon = (category: GoalCategory) => {
    const found = CATEGORIES.find(c => c.value === category);
    return found ? found.icon : Target;
  };

  const getGoalColorClass = (color: string) => {
    const found = COLORS.find(c => c.name === color);
    return found ? found.class : 'bg-emerald-500 text-emerald-50';
  };

  const calculateDaysRemaining = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTarget || !newDeadline) return;

    const goal: SavingsGoal = {
      id: `g-${Date.now()}`,
      name: newName,
      target: Number(newTarget),
      current: Number(newCurrent) || 0,
      category: newCategory,
      deadline: newDeadline,
      color: newColor,
    };

    onAddGoal(goal);
    setIsAddingGoal(false);
    
    // Reset Form
    setNewName('');
    setNewTarget('');
    setNewCurrent('0');
    setNewCategory('Emergency');
    setNewDeadline('');
    setNewColor('emerald');
  };

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundingGoalId || !fundingAmount || Number(fundingAmount) <= 0) return;

    const amount = Number(fundingAmount);
    const goal = goals.find(g => g.id === fundingGoalId);
    if (!goal) return;

    onUpdateGoalFunds(fundingGoalId, amount, fundingType === 'add', goal.name);
    
    // Reset
    setFundingGoalId(null);
    setFundingAmount('');
  };

  return (
    <div className="space-y-6" id="goals-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Savings & Investment Goals</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Track and fund your specific life goals and emergency cushions.</p>
        </div>
        <button
          id="btn-new-goal"
          onClick={() => setIsAddingGoal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-md cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="goal-cards-grid">
        {goals.map((goal) => {
          const CatIcon = getCategoryIcon(goal.category);
          const percentage = Math.min((goal.current / goal.target) * 100, 100);
          const daysLeft = calculateDaysRemaining(goal.deadline);
          const colorObj = COLORS.find(c => c.name === goal.color) || COLORS[0];

          return (
            <motion.div
              key={goal.id}
              whileHover={{ y: -3, borderColor: '#3f3f46' }}
              className="bg-[#0B0B0E] rounded-2xl border border-zinc-900 p-6 shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-200 text-sm leading-tight">{goal.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">{goal.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    className="p-1 text-zinc-500 hover:text-red-400 rounded-md hover:bg-red-950/40 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Details */}
                <div className="space-y-1 mt-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-mono font-bold text-zinc-100">
                      {currency}{goal.current.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      of {currency}{goal.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  {/* Elegant Custom Progress Bar */}
                  <div className="relative w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colorObj.hex
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      {percentage.toFixed(0)}% Completed
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Target date reached'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center gap-2 border-t border-zinc-900 pt-4 mt-6">
                <button
                  onClick={() => {
                    setFundingGoalId(goal.id);
                    setFundingType('add');
                  }}
                  className="grow inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Fund Goal
                </button>
                <button
                  onClick={() => {
                    setFundingGoalId(goal.id);
                    setFundingType('withdraw');
                  }}
                  className="grow inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                  Withdraw
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Empty state prompt for goals */}
        {goals.length === 0 && (
          <div className="col-span-full bg-[#0B0B0E] border border-dashed border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Sparkles className="w-10 h-10 text-zinc-600 animate-pulse mb-3" />
            <h4 className="font-bold text-zinc-300 text-sm">Create your first wealth goal</h4>
            <p className="text-xs text-zinc-500 max-w-[280px] mt-1.5">Build compound assets by partitioning funds specifically for real milestones.</p>
            <button
              onClick={() => setIsAddingGoal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* Inline Funding Adjuster Slideover/Modal */}
      <AnimatePresence>
        {fundingGoalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D11] rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-sm p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                <h3 className="font-semibold text-zinc-100 text-base">
                  {fundingType === 'add' ? 'Fund Goal' : 'Withdraw Funds'}
                </h3>
                <button
                  onClick={() => setFundingGoalId(null)}
                  className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFundSubmit} className="space-y-4">
                <div>
                  <span className="text-[11px] text-zinc-500 block font-mono">GOAL TARGET</span>
                  <span className="text-sm font-semibold text-zinc-200 block mt-0.5">
                    {goals.find(g => g.id === fundingGoalId)?.name}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Amount to {fundingType === 'add' ? 'Contribute' : 'Withdraw'} ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-500 text-sm">
                      {currency}
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="0.00"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      autoFocus
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    *This is logged in your local ledger as a financial event.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFundingGoalId(null)}
                    className="grow py-2 px-4 border border-zinc-800 text-zinc-400 text-xs font-semibold rounded-lg hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="grow py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors shadow-md"
                  >
                    Confirm Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Goal Slideover/Modal */}
      <AnimatePresence>
        {isAddingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D11] rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-900">
                <h3 className="font-semibold text-zinc-100 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  Define a Saving Goal
                </h3>
                <button
                  onClick={() => setIsAddingGoal(false)}
                  className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4 p-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Goal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dream Trip to Japan, Emergency Shield"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Target Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">{currency}</span>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="10000"
                        value={newTarget}
                        onChange={(e) => setNewTarget(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Initial Deposited</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newCurrent}
                        onChange={(e) => setNewCurrent(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-[#0D0D11]">{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Target Deadline</label>
                    <input
                      type="date"
                      required
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Theme Accent</label>
                  <div className="flex gap-2.5">
                    {COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setNewColor(col.name)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          newColor === col.name ? 'scale-110 shadow-md border-zinc-100' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-5 border-t border-zinc-900 bg-zinc-950/40 flex justify-end gap-3 -mx-6 -mb-6 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 text-sm font-medium rounded-lg hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors shadow-md"
                  >
                    Create Goal
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
