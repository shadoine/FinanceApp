import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  History, 
  Calculator, 
  Settings, 
  RotateCcw,
  User,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { AppState, Portfolio, SavingsGoal, Transaction } from './types';
import PortfolioSummary from './components/PortfolioSummary';
import GoalsTracker from './components/GoalsTracker';
import ProjectionCalculator from './components/ProjectionCalculator';
import TransactionHistory from './components/TransactionHistory';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'goals' | 'projections' | 'ledger'>('portfolio');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Fetch local database state on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to load local finance data');
        }
        const data = await response.json();
        setState(data);
        if (data.settings?.currency) {
          setCurrencySymbol(data.settings.currency);
        }
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error syncing with local database');
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Sync state changes back to Express db.json
  const persistState = async (updatedState: AppState) => {
    setState(updatedState);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedState)
      });
      if (!response.ok) {
        throw new Error('Failed to save to local database');
      }
    } catch (err) {
      console.error('Database write error:', err);
    }
  };

  // 1. Portfolio Updates (Manual holdings adjustment)
  const handleUpdatePortfolio = (updatedPortfolio: Portfolio, logTransaction?: Omit<Transaction, 'id' | 'date'>) => {
    if (!state) return;

    let updatedTransactions = [...state.transactions];
    if (logTransaction) {
      const newTx: Transaction = {
        ...logTransaction,
        id: `t-${Date.now()}`,
        date: new Date().toISOString()
      };
      updatedTransactions = [newTx, ...updatedTransactions];
    }

    const updatedState: AppState = {
      ...state,
      portfolio: updatedPortfolio,
      transactions: updatedTransactions
    };

    persistState(updatedState);
  };

  // 1b. Update Financial Settings (e.g. Asset custom labels)
  const handleUpdateSettings = (updatedSettings: any) => {
    if (!state) return;
    const updatedState: AppState = {
      ...state,
      settings: updatedSettings
    };
    persistState(updatedState);
  };

  // 2. Goal Creation
  const handleAddGoal = (newGoal: SavingsGoal) => {
    if (!state) return;

    let updatedCash = state.portfolio.cash;
    let updatedTransactions = [...state.transactions];

    // If goal starts with funding, transfer that amount out of general Cash
    if (newGoal.current > 0) {
      updatedCash = Math.max(0, updatedCash - newGoal.current);
      
      const newTx: Transaction = {
        id: `t-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'contribution',
        amount: newGoal.current,
        description: `Funded initial cushion for ${newGoal.name}`,
        category: newGoal.name
      };
      updatedTransactions = [newTx, ...updatedTransactions];
    }

    const updatedState: AppState = {
      ...state,
      portfolio: {
        ...state.portfolio,
        cash: updatedCash
      },
      goals: [...state.goals, newGoal],
      transactions: updatedTransactions
    };

    persistState(updatedState);
  };

  // 3. Goal Deletion
  const handleDeleteGoal = (goalId: string) => {
    if (!state) return;

    const goalToRemove = state.goals.find(g => g.id === goalId);
    let updatedCash = state.portfolio.cash;
    let updatedTransactions = [...state.transactions];

    // If goal had balance, liquidate it back into general Cash!
    if (goalToRemove && goalToRemove.current > 0) {
      updatedCash += goalToRemove.current;
      
      const newTx: Transaction = {
        id: `t-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'withdrawal',
        amount: goalToRemove.current,
        description: `Goal closed: liquidated remaining balance of ${goalToRemove.name}`,
        category: 'Cash'
      };
      updatedTransactions = [newTx, ...updatedTransactions];
    }

    const updatedState: AppState = {
      ...state,
      portfolio: {
        ...state.portfolio,
        cash: updatedCash
      },
      goals: state.goals.filter(g => g.id !== goalId),
      transactions: updatedTransactions
    };

    persistState(updatedState);
  };

  // 4. Goal Funding & Withdrawals (Smarter auto-transfer with portfolio Cash)
  const handleUpdateGoalFunds = (goalId: string, amount: number, isContribution: boolean, goalName: string) => {
    if (!state) return;

    const updatedGoals = state.goals.map((g) => {
      if (g.id === goalId) {
        const nextCurrent = isContribution 
          ? g.current + amount 
          : Math.max(0, g.current - amount);
        return { ...g, current: nextCurrent };
      }
      return g;
    });

    // Realistically update general Cash!
    // Depositing into a goal subtracts from liquid Cash.
    // Withdrawing from a goal transfers funds back to liquid Cash.
    let updatedCash = state.portfolio.cash;
    if (isContribution) {
      updatedCash = Math.max(0, updatedCash - amount);
    } else {
      updatedCash += amount;
    }

    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      type: isContribution ? 'contribution' : 'withdrawal',
      amount: amount,
      description: isContribution 
        ? `Allocated cash reserves to goal: ${goalName}`
        : `Withdrew savings from goal back to cash: ${goalName}`,
      category: goalName
    };

    const updatedState: AppState = {
      ...state,
      portfolio: {
        ...state.portfolio,
        cash: updatedCash
      },
      goals: updatedGoals,
      transactions: [newTx, ...state.transactions]
    };

    persistState(updatedState);
  };

  // 5. Manual Logging from Transaction History (Updates Ledger + Assets dynamically!)
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'date'>) => {
    if (!state) return;

    const newTx: Transaction = {
      ...newTxData,
      id: `t-${Date.now()}`,
      date: new Date().toISOString()
    };

    // Keep Asset distribution values in sync with ledger logs automatically!
    const updatedPortfolio = { ...state.portfolio };
    const amount = newTxData.amount;
    const cat = newTxData.category;
    const isIncrease = newTxData.type === 'contribution' || newTxData.type === 'gain';

    if (cat === 'Stocks') {
      updatedPortfolio.stocks = isIncrease 
        ? updatedPortfolio.stocks + amount 
        : Math.max(0, updatedPortfolio.stocks - amount);
    } else if (cat === 'Crypto') {
      updatedPortfolio.crypto = isIncrease 
        ? updatedPortfolio.crypto + amount 
        : Math.max(0, updatedPortfolio.crypto - amount);
    } else if (cat === 'Bonds') {
      updatedPortfolio.bonds = isIncrease 
        ? updatedPortfolio.bonds + amount 
        : Math.max(0, updatedPortfolio.bonds - amount);
    } else if (cat === 'Real Estate') {
      updatedPortfolio.realEstate = isIncrease 
        ? updatedPortfolio.realEstate + amount 
        : Math.max(0, updatedPortfolio.realEstate - amount);
    } else {
      // Default / Cash or Goal category updates Cash reserves
      updatedPortfolio.cash = isIncrease 
        ? updatedPortfolio.cash + amount 
        : Math.max(0, updatedPortfolio.cash - amount);
    }

    const updatedState: AppState = {
      ...state,
      portfolio: updatedPortfolio,
      transactions: [newTx, ...state.transactions]
    };

    persistState(updatedState);
  };

  // 6. Reset Local Database
  const handleResetDatabase = async () => {
    if (confirm('Are you sure you want to reset your finance dashboard to default demo data? All custom entries will be lost.')) {
      try {
        const response = await fetch('/api/reset', { method: 'POST' });
        if (!response.ok) throw new Error('Reset failed');
        const result = await response.json();
        setState(result.data);
        setCurrencySymbol(result.data.settings.currency);
        setActiveTab('portfolio');
      } catch (err) {
        console.error('Resetting error:', err);
      }
    }
  };

  const handleCurrencyChange = (sym: string) => {
    if (!state) return;
    setCurrencySymbol(sym);
    persistState({
      ...state,
      settings: {
        ...state.settings,
        currency: sym
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
          <span className="text-xs text-amber-200/70">Aurelius Ledger is reading database...</span>
        </div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center p-4">
        <div className="bg-[#0D0D11] p-8 rounded-2xl border border-zinc-800 shadow-xl max-w-md text-center space-y-4">
          <div className="text-rose-400 text-3xl font-bold">⚠️ Connection Lost</div>
          <p className="text-zinc-400 text-sm">Failed to connect to your local desktop finance database. Please refresh or reboot the server.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium rounded-lg text-xs transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Categories list for ledger filters
  const goalNames = state.goals.map((g) => g.name);
  const ledgerCategories = [...new Set(['Stocks', 'Crypto', 'Cash', 'Bonds', 'Real Estate', ...goalNames])];

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black antialiased">
      
      {/* Premium Swiss Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 border border-zinc-800 text-amber-300 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wide text-amber-300 uppercase">Aurelius Ledger</span>
              <h1 className="text-sm font-display font-medium text-zinc-100 tracking-tight leading-none mt-0.5">
                Investments & Goal Dashboard
              </h1>
            </div>
          </div>

          {/* Time & User Metadata Profile (Strict human presentation, no artificial logs) */}
          <div className="flex items-center gap-6 text-xs font-mono text-zinc-500">
            <div className="hidden md:flex flex-col items-end gap-0.5">
              <span className="text-[10px] text-zinc-500">BOARD ACCOUNT</span>
              <span className="font-semibold text-zinc-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                vivienvonarb
              </span>
            </div>

            {/* Currency Customizer & Reset Controls */}
            <div className="flex items-center gap-2 border-l border-zinc-800/80 pl-6">
              <select
                value={currencySymbol}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium px-2 py-1 rounded-md cursor-pointer transition-colors"
                title="Change Currency symbol"
              >
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="CHF">CHF</option>
              </select>

              <button
                onClick={handleResetDatabase}
                className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-md transition-colors"
                title="Reset Database to default demo data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Wrapper Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Aesthetic Navigational Tab Pills */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3" id="navigation-rail">
          <nav className="flex space-x-1 bg-zinc-950/60 border border-zinc-800/60 p-1 rounded-xl">
            {[
              { id: 'portfolio', label: 'Holdings Portfolio', icon: TrendingUp },
              { id: 'goals', label: 'Savings Milestones', icon: Target },
              { id: 'projections', label: 'Compound Projections', icon: Calculator },
              { id: 'ledger', label: 'Activity Ledger', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-zinc-800/95 text-amber-200 shadow-md border border-zinc-700/60' 
                      : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Net worth header mini snippet */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-zinc-950/60 border border-zinc-800/80 py-1.5 px-3 rounded-xl shadow-md">
            <span className="text-zinc-500 font-medium">TOTAL ASSETS:</span>
            <span className="font-bold text-emerald-400">
              {currencySymbol}
              {(state.portfolio.cash + state.portfolio.stocks + state.portfolio.crypto + state.portfolio.bonds + state.portfolio.realEstate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Selected Component Render View */}
        <div className="transition-all duration-300">
          {activeTab === 'portfolio' && (
            <PortfolioSummary 
              portfolio={state.portfolio} 
              currency={currencySymbol} 
              onUpdatePortfolio={handleUpdatePortfolio} 
              settings={state.settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsTracker 
              goals={state.goals} 
              currency={currencySymbol} 
              onAddGoal={handleAddGoal} 
              onDeleteGoal={handleDeleteGoal} 
              onUpdateGoalFunds={handleUpdateGoalFunds} 
            />
          )}

          {activeTab === 'projections' && (
            <ProjectionCalculator 
              currency={currencySymbol}
              defaultInitial={state.portfolio.cash + state.portfolio.stocks + state.portfolio.crypto + state.portfolio.bonds}
              defaultMonthly={state.settings.monthlySavingTarget}
              defaultReturn={state.settings.expectedAnnualReturn}
            />
          )}

          {activeTab === 'ledger' && (
            <TransactionHistory 
              transactions={state.transactions} 
              currency={currencySymbol} 
              onAddTransaction={handleAddTransaction}
              categories={ledgerCategories}
              settings={state.settings}
            />
          )}
        </div>

        {/* Footer info banner */}
        <footer className="border-t border-zinc-800/80 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-zinc-500">
          <div>
            <span>Desktop Application Instance • Storage: local_fs(db.json)</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-zinc-300 transition-colors">Target: Steady Accumulation</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition-colors">Compound Yields Beat Timing</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
