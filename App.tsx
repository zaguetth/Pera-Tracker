import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  Bot, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Store,
  BookOpen,
  ChevronRight,
  ShoppingCart,
  Users,
  Megaphone,
  CloudRain,
  Sun,
  Utensils,
  RefreshCw,
  Calendar,
  History,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

import { Transaction, FinancialState, AiAnalysisResult, Debt } from './types';
import { StatCard } from './components/StatCard';
import { TransactionTable } from './components/TransactionTable';
import { AddModal } from './components/AddModal';
import { DebtPaymentModal } from './components/DebtPaymentModal';
import { analyzeFinances, generateWeeklyArticle } from './services/geminiService';

// Constants
const VIEWS = {
  DASHBOARD: 'dashboard',
  TRANSACTIONS: 'transactions',
  DEBTS: 'debts',
  WEALTH_GROWTH: 'wealth_growth',
  AI_ADVISOR: 'ai_advisor',
  GAME: 'tycoon_game'
};

// --- Utilities ---
const getWeekNumber = (d: Date = new Date()) => {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
};

// Initial Data - PH Context
const INITIAL_STATE: FinancialState = {
  transactions: [
    { id: '1', date: '2023-10-25', description: 'BPO Salary (Oct 15-30)', amount: 25000, type: 'income', category: 'Salary' },
    { id: '2', date: '2023-10-26', description: 'Meralco Bill', amount: 3500, type: 'expense', category: 'Bills' },
    { id: '3', date: '2023-10-27', description: 'GrabFood (Jollibee)', amount: 450, type: 'expense', category: 'Food' },
    { id: '4', date: '2023-10-28', description: 'Angkas to Office', amount: 180, type: 'expense', category: 'Transpo' },
    { id: '5', date: '2023-10-29', description: 'Shopee Sale', amount: 1200, type: 'expense', category: 'Luho' },
    { id: '6', date: '2023-10-30', description: 'Globe Postpaid', amount: 1799, type: 'expense', category: 'Load/Data' },
    { id: '7', date: '2023-10-31', description: 'Condo Share Rent', amount: 8000, type: 'expense', category: 'Housing' },
  ],
  debts: [
    { 
      id: 'd1', 
      name: 'BDO Credit Card', 
      balance: 15400, 
      initialBalance: 25000, 
      apr: 36, 
      minPayment: 800, 
      type: 'credit_card',
      payments: [] 
    },
    { 
      id: 'd2', 
      name: 'Home Credit (iPhone)', 
      balance: 22000, 
      initialBalance: 35000, 
      apr: 18, 
      minPayment: 1800, 
      type: 'loan',
      payments: [
        { id: 'p_hist_1', date: '2023-09-15', amount: 1800, remainingBalance: 23800 },
        { id: 'p_hist_2', date: '2023-10-15', amount: 1800, remainingBalance: 22000 }
      ]
    },
  ],
  savingsBalance: 42000
};

// --- E-Book Content ---
const STATIC_CHAPTERS = [
  {
    title: "1. The Mindset Shift",
    subtitle: "Stop acting rich, start getting rich.",
    content: (
      <div className="space-y-6 text-zinc-300 leading-relaxed">
        <h3 className="text-2xl font-bold text-white mb-4">The "Pasikat" Trap</h3>
        <p>
          The biggest enemy of wealth in the Philippines is the "Pasikat" culture. You buy the latest iPhone on a 24-month installment plan while eating sardines? That's not success, that's financial suicide.
        </p>
        <div className="bg-zinc-800 p-6 border-l-4 border-indigo-500 my-6">
          <p className="font-bold text-white mb-2">Rule #1: The 2x Rule</p>
          <p className="text-sm">If you can't buy it in cash twice, you can't afford it. Installments are only for assets (things that put money in your pocket), not liabilities.</p>
        </div>
        <p>
          Your salary is not your wealth. Your <strong>Net Worth</strong> (Assets - Liabilities) is your wealth. Stop focusing on income, start focusing on what you keep.
        </p>
      </div>
    )
  },
  {
    title: "2. The Fortress (EF)",
    subtitle: "Why you need an Emergency Fund.",
    content: (
      <div className="space-y-6 text-zinc-300 leading-relaxed">
        <h3 className="text-2xl font-bold text-white mb-4">Build the Fortress First</h3>
        <p>
          Before you invest in crypto, stocks, or a business, do you have an Emergency Fund? If not, you are one hospital bill away from poverty.
        </p>
        <ul className="list-disc pl-5 space-y-4 my-6">
          <li>
            <strong className="text-white">What is it?</strong> 3 to 6 months of living expenses in cash.
          </li>
          <li>
            <strong className="text-white">Where to put it?</strong> NOT under the mattress. Put it in High Yield Savings Accounts (Digital Banks) so it counters inflation.
          </li>
          <li>
            <strong className="text-white">Why?</strong> Because life happens. Typhoons, job loss, health issues. This fund prevents you from getting into bad debt when crisis strikes.
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "3. Low Risk: Digital Banks & MP2",
    subtitle: "The 'Lazy' Millionaire Strategy.",
    content: (
      <div className="space-y-6 text-zinc-300 leading-relaxed">
        <h3 className="text-2xl font-bold text-white mb-4">Make Your Sleeping Money Work</h3>
        <p>
          Stop leaving money in traditional big banks earning 0.0625% interest. Inflation is 4-6%. You are losing purchasing power every single day.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-zinc-800 p-4 rounded border border-zinc-700">
            <h4 className="font-bold text-emerald-400 mb-2">Digital Banks</h4>
            <p className="text-sm mb-2">Seabank, Maya, GoTyme, CIMB.</p>
            <p className="text-xs text-zinc-400">Yield: 4% to 12% p.a.<br/>Liquidity: High (Daily)<br/>Risk: Low (PDIC Insured)</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded border border-zinc-700">
            <h4 className="font-bold text-blue-400 mb-2">PAG-IBIG MP2</h4>
            <p className="text-sm mb-2">Government savings program.</p>
            <p className="text-xs text-zinc-400">Yield: 6% to 8% p.a.<br/>Liquidity: Low (5 Year Maturity)<br/>Risk: Very Low (Gov't Guaranteed)</p>
          </div>
        </div>
        <p>
          <strong>Strategy:</strong> Put your Emergency Fund in Digital Banks for access. Put your long-term savings (house fund, car fund) in MP2 for tax-free compounding.
        </p>
      </div>
    )
  }
];

// Topics for weekly rotation
const WEEKLY_TOPICS = [
  "Recovering from Holiday Spending",
  "How to ask for a Raise in the Philippines",
  "Is VUL Insurance a Scam?",
  "Foreclosed Properties: Good Deal?",
  "Side Hustles for Introverts",
  "Surviving 'Petsa de Peligro'",
  "Credit Card Hacking (Points & Miles)",
  "Co-Maker Horror Stories",
  "Retiring Early in the Province",
  "Minimalism: Saving Money by Caring Less"
];

// --- Strategy Game Logic ---

type MarketingType = 'none' | 'flyers' | 'social' | 'influencer';
type GamePhase = 'prep' | 'result';

interface GameTheme {
  name: string;
  product: string;
  material: string;
  baseCostRange: [number, number];
  basePrice: number;
  weatherBias: 'sunny' | 'rainy' | 'neutral';
}

// Themes that rotate weekly
const GAME_THEMES: GameTheme[] = [
  {
    name: "Tapsi King",
    product: "Silog",
    material: "Meat & Rice",
    baseCostRange: [35, 55],
    basePrice: 85,
    weatherBias: 'neutral'
  },
  {
    name: "Boba Boi Tea",
    product: "Milk Tea",
    material: "Tea & Pearls",
    baseCostRange: [25, 40],
    basePrice: 90,
    weatherBias: 'sunny'
  },
  {
    name: "Ihaw-Ihaw Republic",
    product: "BBQ Stick",
    material: "Pork Skewers",
    baseCostRange: [10, 20],
    basePrice: 35,
    weatherBias: 'neutral'
  },
  {
    name: "Halo-Halo Crush",
    product: "Halo-Halo",
    material: "Ice & Fruits",
    baseCostRange: [30, 45],
    basePrice: 80,
    weatherBias: 'sunny'
  },
  {
    name: "Laundry Lord",
    product: "Wash Load",
    material: "Detergent",
    baseCostRange: [15, 25],
    basePrice: 150, // Service business
    weatherBias: 'rainy' // Rain makes people lazy to dry clothes manually
  }
];

interface DayResult {
  day: number;
  weather: string;
  customers: number;
  sold: number;
  revenue: number;
  stockCost: number;
  marketingCost: number;
  profit: number;
  eventMessage?: string;
}

const MARKETING_OPTS: Record<MarketingType, { label: string, cost: number, boost: number }> = {
  none: { label: 'None', cost: 0, boost: 0 },
  flyers: { label: 'Flyers (Local)', cost: 500, boost: 1.2 },
  social: { label: 'FB/Tiktok Ads', cost: 1500, boost: 1.5 },
  influencer: { label: 'Vlogger Shoutout', cost: 5000, boost: 2.5 },
};

const WEATHER_TYPES = [
  { type: 'Sunny', label: 'Mainit', demandMod: 1.0, icon: <Sun size={20} className="text-yellow-500"/> },
  { type: 'Rainy', label: 'Maulan', demandMod: 0.6, icon: <CloudRain size={20} className="text-blue-400"/> },
  { type: 'Normal', label: 'Maaliwalas', demandMod: 1.0, icon: <Sun size={20} className="text-zinc-400"/> }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [financialData, setFinancialData] = useState<FinancialState>(INITIAL_STATE);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Debt Payment State
  const [isDebtPaymentModalOpen, setIsDebtPaymentModalOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

  // AI Advisor State
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Ebook State
  const [activeChapter, setActiveChapter] = useState(0);
  const [weeklyChapter, setWeeklyChapter] = useState<{title: string, subtitle: string, content: any} | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // --- Game State (Strategy) ---
  // Determine theme based on week number
  const currentWeek = getWeekNumber();
  const themeIndex = currentWeek % GAME_THEMES.length;
  const activeTheme = GAME_THEMES[themeIndex];

  const [gamePhase, setGamePhase] = useState<GamePhase>('prep');
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(5000);
  const [stock, setStock] = useState(0);
  const [reputation, setReputation] = useState(10); // 0 to 100
  
  // Daily Controls
  const [buyQty, setBuyQty] = useState(0);
  const [price, setPrice] = useState(activeTheme.basePrice); 
  const [marketing, setMarketing] = useState<MarketingType>('none');
  const [ingredientCost, setIngredientCost] = useState(activeTheme.baseCostRange[0]); 
  const [todayWeather, setTodayWeather] = useState(WEATHER_TYPES[0]);
  
  // Results
  const [lastResult, setLastResult] = useState<DayResult | null>(null);

  // Load Weekly Article on mount/view change
  useEffect(() => {
    if (currentView === VIEWS.WEALTH_GROWTH && !weeklyChapter && !loadingWeekly) {
      const fetchWeekly = async () => {
        setLoadingWeekly(true);
        try {
          const topic = WEEKLY_TOPICS[currentWeek % WEEKLY_TOPICS.length];
          const article = await generateWeeklyArticle(topic, currentWeek);
          setWeeklyChapter({
            title: article.title,
            subtitle: article.subtitle,
            content: <div dangerouslySetInnerHTML={{ __html: article.content }} className="space-y-4 text-zinc-300 leading-relaxed" />
          });
        } catch (e) {
          console.error("Failed to load weekly article", e);
        } finally {
          setLoadingWeekly(false);
        }
      };
      fetchWeekly();
    }
  }, [currentView, currentWeek]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const totalIncome = financialData.transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalExpenses = financialData.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalDebt = financialData.debts.reduce((acc, curr) => acc + curr.balance, 0);
    const netWorth = financialData.savingsBalance - totalDebt;
    
    // Group by category for chart
    const categoryData: Record<string, number> = {};
    financialData.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const label = t.category === 'Luho' ? 'Wants' : t.category;
        categoryData[label] = (categoryData[label] || 0) + t.amount;
      });

    const pieData = Object.keys(categoryData).map(key => ({
      name: key,
      value: categoryData[key]
    }));

    return { totalIncome, totalExpenses, totalDebt, netWorth, pieData };
  }, [financialData]);

  // Handlers
  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const t: Transaction = {
      ...newTransaction,
      id: Math.random().toString(36).substr(2, 9)
    };
    setFinancialData(prev => ({
      ...prev,
      transactions: [t, ...prev.transactions]
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    setFinancialData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeFinances(financialData);
      setAiAnalysis(result);
    } catch (err) {
      setAnalysisError("Failed to generate analysis. Check API Key or try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDebtPayment = (amount: number, date: string) => {
    if (!selectedDebtId) return;
    
    setFinancialData(prev => {
      const updatedDebts = prev.debts.map(debt => {
        if (debt.id === selectedDebtId) {
          const newBalance = Math.max(0, debt.balance - amount);
          const paymentRecord = {
            id: Math.random().toString(36).substr(2, 9),
            date,
            amount,
            remainingBalance: newBalance
          };
          return {
            ...debt,
            balance: newBalance,
            payments: [paymentRecord, ...debt.payments]
          };
        }
        return debt;
      });
      return { ...prev, debts: updatedDebts };
    });
  };

  // --- Game Handlers ---
  const handleBuyStock = () => {
    const cost = buyQty * ingredientCost;
    if (cash >= cost) {
      setCash(prev => prev - cost);
      setStock(prev => prev + buyQty);
      setBuyQty(0);
    }
  };

  const startDay = () => {
    // 1. Calculate Demand
    let baseDemand = 20 + (reputation * 0.5);
    const priceDiff = activeTheme.basePrice - price;
    baseDemand += (priceDiff / 5); 
    
    // Apply Marketing
    baseDemand *= MARKETING_OPTS[marketing].boost;

    // Apply Weather
    // Logic: If theme hates rain (sunny bias) and it's rainy -> lower demand
    if (activeTheme.weatherBias === 'sunny' && todayWeather.type === 'Rainy') {
       baseDemand *= 0.5;
    } else if (activeTheme.weatherBias === 'rainy' && todayWeather.type === 'Sunny') {
       baseDemand *= 0.7; // e.g. Laundry business slightly slower on sunny? or opposite. 
    } else if (activeTheme.weatherBias === 'rainy' && todayWeather.type === 'Rainy') {
       baseDemand *= 1.2;
    } else {
       // Generic weather impact
       baseDemand *= todayWeather.demandMod;
    }

    // Random daily variance (+- 20%)
    const variance = 0.8 + (Math.random() * 0.4);
    let demand = Math.floor(baseDemand * variance);
    
    if (demand < 0) demand = 0;

    // 2. Calculate Sales
    const sold = Math.min(stock, demand);
    const revenue = sold * price;
    const marketingCost = MARKETING_OPTS[marketing].cost;
    const cogsOfSold = sold * ingredientCost; 
    const dailyProfit = revenue - cogsOfSold - marketingCost;

    // 3. Update State
    setCash(prev => prev + revenue - marketingCost);
    setStock(prev => prev - sold);

    // Reputation update
    let repChange = 0;
    if (demand > stock) repChange -= 2;
    else if (price < activeTheme.basePrice * 0.9) repChange += 2; 
    else if (price > activeTheme.basePrice * 1.2) repChange -= 1; 
    
    const newRep = Math.max(0, Math.min(100, reputation + repChange));
    setReputation(newRep);

    // Event
    let eventMsg = "Just a normal day.";
    if (demand > stock) eventMsg = "Sold Out! Sayang ang kita.";
    else if (sold < 5) eventMsg = "Matumal. Marketing pa more?";
    else if (marketing !== 'none' && dailyProfit > 0) eventMsg = "Marketing boosted your sales!";

    setLastResult({
      day,
      weather: todayWeather.label,
      customers: demand,
      sold,
      revenue,
      stockCost: cogsOfSold,
      marketingCost,
      profit: dailyProfit,
      eventMessage: eventMsg
    });

    setGamePhase('result');
  };

  const nextDay = () => {
    setDay(prev => prev + 1);
    setGamePhase('prep');
    
    // Randomize next day stats
    const weatherRoll = Math.random();
    if (weatherRoll > 0.8) setTodayWeather(WEATHER_TYPES[1]); // Rainy
    else if (weatherRoll > 0.5) setTodayWeather(WEATHER_TYPES[0]); // Sunny
    else setTodayWeather(WEATHER_TYPES[2]);

    // Fluctuate ingredient cost
    const [min, max] = activeTheme.baseCostRange;
    const newCost = Math.floor(min + Math.random() * (max - min));
    setIngredientCost(newCost);
    setMarketing('none'); 
  };

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#d946ef'];

  // Render Functions
  const renderSidebar = () => (
    <div className="w-20 lg:w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col fixed h-full z-10 transition-all duration-300">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-none flex items-center justify-center font-bold text-white mr-0 lg:mr-3">
          P
        </div>
        <span className="hidden lg:block font-bold text-lg tracking-tight text-white">Pera Tracker</span>
      </div>

      <nav className="flex-1 py-6 space-y-2">
        {[
          { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { id: VIEWS.TRANSACTIONS, label: 'Transactions', icon: <Wallet size={20} /> },
          { id: VIEWS.DEBTS, label: 'Debts & Credit', icon: <CreditCard size={20} /> },
          { id: VIEWS.WEALTH_GROWTH, label: 'Wealth Guide', icon: <BookOpen size={20} /> },
          { id: VIEWS.AI_ADVISOR, label: 'AI Real Talk', icon: <Bot size={20} /> },
          { id: VIEWS.GAME, label: 'Business Game', icon: <Store size={20} /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center justify-center lg:justify-start px-0 lg:px-6 py-3 border-l-2 transition-colors ${
              currentView === item.id 
                ? 'border-indigo-500 bg-zinc-900 text-white' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            {item.icon}
            <span className="hidden lg:block ml-3 font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 flex items-center justify-center transition-colors"
        >
          <Plus size={20} />
          <span className="hidden lg:block ml-2 font-bold uppercase text-xs tracking-wider">New Record</span>
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Net Worth" 
          value={`₱${metrics.netWorth.toLocaleString()}`} 
          icon={<DollarSign size={20} />} 
          colorClass={metrics.netWorth >= 0 ? 'text-white' : 'text-rose-500'}
        />
        <StatCard 
          label="Monthly In" 
          value={`₱${metrics.totalIncome.toLocaleString()}`} 
          trend="+12%" trendUp={true}
          icon={<TrendingUp size={20} />} 
          colorClass="text-emerald-400"
        />
        <StatCard 
          label="Monthly Out" 
          value={`₱${metrics.totalExpenses.toLocaleString()}`} 
          trend="+5%" trendUp={false} // spending more is bad
          icon={<TrendingDown size={20} />} 
          colorClass="text-rose-400"
        />
        <StatCard 
          label="Total Debt" 
          value={`₱${metrics.totalDebt.toLocaleString()}`} 
          icon={<Target size={20} />} 
          colorClass="text-zinc-300"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6">
          <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider mb-6">Cashflow Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Income', value: metrics.totalIncome },
                { name: 'Expenses', value: metrics.totalExpenses },
                { name: 'Savings', value: Math.max(0, metrics.totalIncome - metrics.totalExpenses) }
              ]}>
                <XAxis dataKey="name" stroke="#52525b" tick={{fill: '#71717a'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" tick={{fill: '#71717a'}} axisLine={false} tickLine={false} tickFormatter={(val) => `₱${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#27272a'}}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} 
                  formatter={(value: number) => `₱${value.toLocaleString()}`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {
                     [metrics.totalIncome, metrics.totalExpenses, Math.max(0, metrics.totalIncome - metrics.totalExpenses)].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f43f5e' : '#6366f1'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider mb-6">Where did your money go?</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={metrics.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} 
                  formatter={(value: number) => `₱${value.toLocaleString()}`}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {metrics.pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs text-zinc-400">
                <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider">Recent Activity</h3>
          <button 
            onClick={() => setCurrentView(VIEWS.TRANSACTIONS)} 
            className="text-xs text-indigo-500 hover:text-indigo-400"
          >
            View All
          </button>
        </div>
        <TransactionTable 
          transactions={financialData.transactions.slice(0, 5)} 
          onDelete={handleDeleteTransaction}
        />
      </div>
    </div>
  );

  const renderDebts = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white font-mono uppercase">Debts & Liabilities Tracker</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {financialData.debts.map((debt) => {
          const progress = Math.max(0, Math.min(100, ((debt.initialBalance - debt.balance) / debt.initialBalance) * 100));
          return (
            <div key={debt.id} className="bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="px-2 py-1 bg-rose-950/30 text-rose-500 text-xs rounded border border-rose-900/50 mb-2 inline-block font-mono">
                    {debt.apr}% APR
                  </span>
                  <h3 className="text-xl font-bold text-white">{debt.name}</h3>
                  <p className="text-zinc-500 text-xs uppercase mt-1">Min Pay: ₱{debt.minPayment}/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 text-xs uppercase mb-1">Current Balance</p>
                  <p className="text-3xl font-mono font-bold text-white">₱{debt.balance.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>Progress ({progress.toFixed(0)}% paid)</span>
                  <span>Initial: ₱{debt.initialBalance.toLocaleString()}</span>
                </div>
                <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => {
                    setSelectedDebtId(debt.id);
                    setIsDebtPaymentModalOpen(true);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 uppercase text-sm tracking-wide transition-colors"
                >
                  Make Payment
                </button>
              </div>

              {/* Payment History */}
              <div className="border-t border-zinc-800 pt-4">
                <h4 className="text-xs text-zinc-500 uppercase font-bold mb-3 flex items-center">
                  <History size={12} className="mr-1"/> Recent Payments
                </h4>
                {debt.payments.length > 0 ? (
                  <div className="space-y-2">
                    {debt.payments.slice(0, 3).map(pay => (
                      <div key={pay.id} className="flex justify-between items-center text-sm font-mono p-2 bg-zinc-950/50 rounded">
                        <span className="text-zinc-400">{pay.date}</span>
                        <div className="flex items-center">
                           <span className="text-emerald-400 mr-3">+₱{pay.amount.toLocaleString()}</span>
                           <span className="text-zinc-600 flex items-center text-xs">
                             <ArrowRight size={10} className="mx-1"/> ₱{pay.remainingBalance.toLocaleString()}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600 italic">No payments recorded yet.</p>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Add New Debt Button Placeholder */}
        <button className="border-2 border-dashed border-zinc-800 rounded flex flex-col items-center justify-center p-6 text-zinc-600 hover:border-zinc-700 hover:text-zinc-500 transition-colors h-full min-h-[300px]">
          <Plus size={32} className="mb-2" />
          <span className="text-sm font-medium">Add New Loan / Credit Card</span>
        </button>
      </div>
    </div>
  );

  const renderWealthGrowth = () => {
    // Merge weekly chapter if available with static chapters
    const chapters = weeklyChapter 
      ? [{ ...weeklyChapter, isWeekly: true }, ...STATIC_CHAPTERS]
      : STATIC_CHAPTERS;

    return (
      <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row bg-zinc-900 border border-zinc-800 animate-in fade-in overflow-hidden">
        {/* Sidebar / TOC */}
        <div className="lg:w-1/3 border-r border-zinc-800 bg-zinc-950 overflow-y-auto">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white flex items-center">
              <BookOpen className="mr-3 text-emerald-400" />
              Wealth Guide
            </h2>
            <p className="text-zinc-500 text-xs mt-2 uppercase tracking-wider">Week {currentWeek} Update</p>
          </div>
          <div className="flex flex-col">
            {loadingWeekly && (
              <div className="p-4 text-xs text-zinc-500 animate-pulse flex items-center">
                <RefreshCw className="mr-2 h-3 w-3 animate-spin"/> Fetching weekly wisdom...
              </div>
            )}
            {chapters.map((chapter: any, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChapter(idx)}
                className={`text-left p-6 border-b border-zinc-900 transition-colors flex justify-between items-center group ${
                  activeChapter === idx 
                    ? 'bg-zinc-900 border-l-4 border-l-emerald-500 text-white' 
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                }`}
              >
                <div className="flex-1 pr-4">
                  <p className={`font-mono text-xs mb-1 ${activeChapter === idx ? 'text-emerald-500' : 'text-zinc-600'} ${chapter.isWeekly ? 'text-indigo-400 font-bold' : ''}`}>
                    {chapter.isWeekly ? '✨ WEEKLY SPECIAL' : `Chapter ${idx + (weeklyChapter ? 0 : 1)}`}
                  </p>
                  <h3 className="font-bold text-sm line-clamp-1">{chapter.title.replace(/^\d+\.\s/, '')}</h3>
                </div>
                {activeChapter === idx && <ChevronRight size={16} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Reading Pane */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-zinc-900 relative">
          <div className="max-w-3xl mx-auto">
            {chapters[activeChapter] && (
              <>
                <div className="mb-8 pb-8 border-b border-zinc-800">
                  <span className={`font-mono text-sm uppercase tracking-wider mb-2 block ${chapters[activeChapter].isWeekly ? 'text-indigo-500' : 'text-emerald-500'}`}>
                    {chapters[activeChapter].isWeekly ? 'Exclusive Content' : 'Fundamentals'}
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{chapters[activeChapter].title.replace(/^\d+\.\s/, '')}</h1>
                  <p className="text-xl text-zinc-400 font-serif italic">"{chapters[activeChapter].subtitle}"</p>
                </div>
                
                <div className="prose prose-invert prose-lg max-w-none">
                  {chapters[activeChapter].content}
                </div>
              </>
            )}

            <div className="mt-12 flex justify-between pt-8 border-t border-zinc-800">
              <button 
                onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                disabled={activeChapter === 0}
                className="text-zinc-500 hover:text-white disabled:opacity-0 transition-colors uppercase text-sm font-bold flex items-center"
              >
                Previous
              </button>
              <button 
                onClick={() => setActiveChapter(Math.min(chapters.length - 1, activeChapter + 1))}
                disabled={activeChapter === chapters.length - 1}
                className="text-emerald-500 hover:text-emerald-400 disabled:opacity-0 transition-colors uppercase text-sm font-bold flex items-center"
              >
                Next Chapter <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAiAdvisor = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block p-3 bg-indigo-950/30 rounded-full border border-indigo-900">
          <Bot size={32} className="text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">AI Financial Real Talk</h2>
        <p className="text-zinc-400">
          Get a direct, brutally honest assessment of your financial health powered by Gemini 2.5.
        </p>
        <button 
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 px-8 rounded-none transition-all uppercase tracking-widest text-sm"
        >
          {isAnalyzing ? 'Analyzing Data...' : 'Audit My Finances'}
        </button>
        {analysisError && (
          <p className="text-rose-500 text-sm mt-2 bg-rose-950/30 p-2 inline-block border border-rose-900">{analysisError}</p>
        )}
      </div>

      {aiAnalysis && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-8 text-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-zinc-500 uppercase text-xs tracking-[0.2em]">Financial Health Score</span>
              <div className="text-6xl font-black font-mono mt-4 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-emerald-500">
                {aiAnalysis.score}/100
              </div>
              <p className={`text-lg italic font-serif ${aiAnalysis.score > 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                "{aiAnalysis.summary}"
              </p>
            </div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600"></div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8">
            <h3 className="text-white font-bold uppercase tracking-wider mb-6 flex items-center">
              <Target size={18} className="mr-2 text-indigo-500" />
              Action Plan (Priority Order)
            </h3>
            <ul className="space-y-4">
              {aiAnalysis.actionItems.map((item, idx) => (
                <li key={idx} className="flex items-start bg-black/40 p-4 border-l-2 border-indigo-600">
                  <span className="font-mono text-indigo-500 mr-4 font-bold">0{idx + 1}</span>
                  <p className="text-zinc-300">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderGame = () => (
    <div className="space-y-6 animate-in fade-in">
      {/* Game Header / HUD */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <Store className="text-indigo-500 mr-3" size={24}/>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Game of the Week: {activeTheme.name}</h2>
            <p className="text-xs text-zinc-500 flex items-center">
              <Calendar size={12} className="mr-1"/> Week {currentWeek} • Day {day} • {todayWeather.label}
            </p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="px-4 py-2 bg-black rounded border border-zinc-800 min-w-[100px]">
            <p className="text-xs text-zinc-500 uppercase">Cash</p>
            <p className="font-mono text-emerald-400 font-bold">₱{cash.toLocaleString()}</p>
          </div>
          <div className="px-4 py-2 bg-black rounded border border-zinc-800 min-w-[100px]">
            <p className="text-xs text-zinc-500 uppercase">{activeTheme.product}</p>
            <p className="font-mono text-white font-bold">{stock} units</p>
          </div>
          <div className="px-4 py-2 bg-black rounded border border-zinc-800 min-w-[100px]">
            <p className="text-xs text-zinc-500 uppercase">Reputation</p>
            <p className="font-mono text-yellow-500 font-bold">{reputation}%</p>
          </div>
        </div>
      </div>

      {gamePhase === 'prep' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market & Inventory */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider mb-4 flex items-center">
                <ShoppingCart size={16} className="mr-2"/> Supply Market ({activeTheme.material})
              </h3>
              <div className="bg-zinc-950 p-4 rounded border border-zinc-800 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-zinc-300">Market Cost Today</span>
                  <span className="font-mono text-emerald-400">₱{ingredientCost}/unit</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-zinc-300">Weather Forecast</span>
                   <span className="flex items-center text-sm">{todayWeather.icon} <span className="ml-2">{todayWeather.label}</span></span>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-white">Buy Stock (Max: {Math.floor(cash / ingredientCost)})</label>
                <div className="flex gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max={Math.floor(cash / ingredientCost)} 
                    value={buyQty} 
                    onChange={(e) => setBuyQty(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-2"
                  />
                  <input 
                    type="number" 
                    value={buyQty}
                    onChange={(e) => setBuyQty(Math.min(Math.floor(cash / ingredientCost), Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20 bg-black border border-zinc-700 text-white p-2 text-center font-mono"
                  />
                </div>
                <button 
                  onClick={handleBuyStock}
                  disabled={buyQty === 0}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white py-2 uppercase text-sm font-bold transition-colors"
                >
                  Buy for ₱{(buyQty * ingredientCost).toLocaleString()}
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider mb-4 flex items-center">
                <Megaphone size={16} className="mr-2"/> Marketing Strategy
              </h3>
              <div className="space-y-2">
                {(Object.keys(MARKETING_OPTS) as MarketingType[]).map((mType) => {
                  const m = MARKETING_OPTS[mType];
                  return (
                    <button
                      key={mType}
                      onClick={() => setMarketing(mType)}
                      className={`w-full flex justify-between items-center p-3 border transition-all text-left ${
                        marketing === mType 
                          ? 'bg-indigo-950/30 border-indigo-500' 
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <p className={`font-bold text-sm ${marketing === mType ? 'text-indigo-400' : 'text-zinc-300'}`}>{m.label}</p>
                        <p className="text-xs text-zinc-500">Demand Boost: x{m.boost}</p>
                      </div>
                      <span className="font-mono text-xs text-zinc-400">{m.cost === 0 ? 'Free' : `₱${m.cost}`}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Operations */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider mb-4 flex items-center">
                <Utensils size={16} className="mr-2"/> Operations
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Set Menu Price (₱)</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPrice(p => Math.max(activeTheme.basePrice * 0.5, p - 5))} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded">-</button>
                  <span className="text-2xl font-mono font-bold text-white w-20 text-center">{price}</span>
                  <button onClick={() => setPrice(p => p + 5)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded">+</button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Market Avg: ₱{activeTheme.basePrice}. Higher prices reduce demand but increase margin.
                </p>
              </div>

              <div className="bg-black p-4 border border-zinc-800 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Projected Margin</span>
                  <span className="font-mono text-white">₱{price - ingredientCost} / unit</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total Stock</span>
                  <span className="font-mono text-white">{stock} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Marketing Cost</span>
                  <span className="font-mono text-rose-400">-₱{MARKETING_OPTS[marketing].cost}</span>
                </div>
              </div>

              <button 
                onClick={startDay}
                disabled={cash < MARKETING_OPTS[marketing].cost}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 text-lg uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
              >
                Start Day {day}
              </button>
              {cash < MARKETING_OPTS[marketing].cost && (
                <p className="text-center text-rose-500 text-xs mt-2">Not enough cash for marketing</p>
              )}
            </div>
          </div>
        </div>
      )}

      {gamePhase === 'result' && lastResult && (
        <div className="bg-zinc-900 border border-zinc-800 p-8 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">Day {lastResult.day} Report</h3>
            <p className="text-zinc-400 italic">"{lastResult.eventMessage}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-zinc-950 p-4 border border-zinc-800 text-center">
               <p className="text-xs text-zinc-500 uppercase">Customers</p>
               <p className="text-2xl font-bold text-white">{lastResult.customers}</p>
             </div>
             <div className="bg-zinc-950 p-4 border border-zinc-800 text-center">
               <p className="text-xs text-zinc-500 uppercase">{activeTheme.product} Sold</p>
               <p className="text-2xl font-bold text-emerald-400">{lastResult.sold}</p>
             </div>
          </div>

          <div className="space-y-3 border-t border-zinc-800 pt-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Revenue</span>
              <span className="font-mono text-emerald-400">+₱{lastResult.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Cost of Goods</span>
              <span className="font-mono text-rose-400">-₱{lastResult.stockCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Marketing</span>
              <span className="font-mono text-rose-400">-₱{lastResult.marketingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
              <span className="font-bold text-white uppercase">Net Profit</span>
              <span className={`font-mono font-bold text-xl ${lastResult.profit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {lastResult.profit >= 0 ? '+' : ''}₱{lastResult.profit.toLocaleString()}
              </span>
            </div>
          </div>

          <button 
            onClick={nextDay}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 uppercase tracking-wider"
          >
            Start Next Day
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
      {renderSidebar()}
      
      <main className="pl-20 lg:pl-64 pt-0 min-h-screen">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur sticky top-0 z-20">
          <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-400">
            {Object.values(VIEWS).find(v => v === currentView)?.toUpperCase().replace('_', ' ')}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-zinc-500 uppercase">Savings</p>
              <p className="font-mono font-bold text-emerald-500">₱{financialData.savingsBalance.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700"></div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {currentView === VIEWS.DASHBOARD && renderDashboard()}
          
          {currentView === VIEWS.TRANSACTIONS && (
            <div className="bg-zinc-900 border border-zinc-800 min-h-[600px]">
               <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-zinc-400 uppercase text-xs font-bold tracking-wider">All Transactions</h3>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 text-xs uppercase font-bold transition-colors"
                >
                  + Add
                </button>
              </div>
              <TransactionTable 
                transactions={financialData.transactions} 
                onDelete={handleDeleteTransaction}
              />
            </div>
          )}

          {currentView === VIEWS.DEBTS && renderDebts()}
          
          {currentView === VIEWS.WEALTH_GROWTH && renderWealthGrowth()}
          
          {currentView === VIEWS.AI_ADVISOR && renderAiAdvisor()}
          
          {currentView === VIEWS.GAME && renderGame()}
        </div>
      </main>

      <AddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddTransaction}
      />
      
      {selectedDebtId && (
        <DebtPaymentModal
          isOpen={isDebtPaymentModalOpen}
          onClose={() => setIsDebtPaymentModalOpen(false)}
          debtName={financialData.debts.find(d => d.id === selectedDebtId)?.name || ''}
          currentBalance={financialData.debts.find(d => d.id === selectedDebtId)?.balance || 0}
          onConfirm={handleDebtPayment}
        />
      )}
    </div>
  );
};

export default App;