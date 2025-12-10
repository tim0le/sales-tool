import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, User, TrendingUp, DollarSign, Target, ChevronRight, AlertCircle, CheckCircle2, Phone, Mail, Calendar, BarChart3, Users, FileText, Zap, Shield, Heart, Home, Car, Briefcase, PiggyBank, Umbrella, ArrowUpRight, Star, Bell, Settings, X, MapPin, Wallet, Activity, Upload, Download, Filter, Plane, Scale, Smartphone, Gavel, Lock, Award, Clock, TrendingDown } from 'lucide-react';

// Load SheetJS library dynamically with timeout
const loadXLSX = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.XLSX !== 'undefined') {
      resolve(window.XLSX);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout loading XLSX library'));
    }, 10000);
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => {
      clearTimeout(timeoutId);
      resolve(window.XLSX);
    };
    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load XLSX library from CDN'));
    };
    document.head.appendChild(script);
  });
};

// Sales Rep Configuration with monthly targets
const SALES_REP_CONFIG = {
  monthlyTargets: {
    commission: 5000,      // €5,000 monthly target
    policies: 15,          // 15 new policies per month
    conversion: 0.25       // 25% conversion rate target
  },
  workingDays: 20,         // ~20 working days per month
  baseSalary: 2500         // €2,500 base salary
};

// Utility functions
const getCategoryIcon = (category) => {
  const icons = { 
    Health: Heart, Life: Shield, Retirement: PiggyBank, Home: Home, 
    Car: Car, Liability: Umbrella, Income: Briefcase, Travel: Plane,
    Accident: Activity, Pet: Heart, Electronics: Smartphone, Legal: Gavel, Cyber: Lock
  };
  return icons[category] || Shield;
};

const getPersonaColor = (persona) => {
  const colors = {
    'Young Professional': 'from-cyan-500 to-blue-500',
    'Growing Family': 'from-emerald-500 to-teal-500',
    'Established Household': 'from-violet-500 to-purple-500',
    'Pre-Retiree': 'from-amber-500 to-orange-500',
    'Retiree': 'from-rose-500 to-pink-500',
    'High Net Worth': 'from-yellow-500 to-amber-500',
    'Business Owner': 'from-slate-600 to-slate-800'
  };
  return colors[persona] || 'from-gray-500 to-gray-600';
};

const getScoreColor = (score) => {
  if (score >= 95) return 'text-emerald-400';
  if (score >= 85) return 'text-cyan-400';
  if (score >= 75) return 'text-amber-400';
  return 'text-slate-400';
};

const getPriorityBadge = (score) => {
  if (score >= 95) return { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (score >= 85) return { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  if (score >= 75) return { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
  return { label: 'Low', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
};

// Persona classification logic
const classifyPersona = (age, income, numberOfPolicies) => {
  const incomeValue = income === '150k+' ? 150000 : 
                     income === '100k-150k' ? 125000 :
                     income === '75k-100k' ? 87500 :
                     income === '50k-75k' ? 62500 :
                     income === '35k-50k' ? 42500 :
                     income === '20k-35k' ? 27500 : 15000;
  
  if (incomeValue > 100000) return 'High Net Worth';
  if (age >= 65) return 'Retiree';
  if (age >= 55) return 'Pre-Retiree';
  if (age >= 45) return 'Established Household';
  if (age >= 30) return 'Growing Family';
  return 'Young Professional';
};

// Gap analysis
const performGapAnalysis = (client, clientPolicies, allProducts, commissionRules) => {
  const persona = classifyPersona(client.Age, client.IncomeBandEUR, client.NumberOfPolicies);
  const existingCategories = new Set(clientPolicies.map(p => p.Category));
  
  const essentialCoverage = {
    'Young Professional': ['Health', 'Car', 'Liability', 'Life'],
    'Growing Family': ['Health', 'Car', 'Home', 'Life', 'Income', 'Liability'],
    'Established Household': ['Health', 'Car', 'Home', 'Life', 'Income', 'Liability', 'Retirement'],
    'Pre-Retiree': ['Health', 'Home', 'Life', 'Retirement', 'Income'],
    'Retiree': ['Health', 'Home', 'Life', 'Retirement'],
    'High Net Worth': ['Health', 'Car', 'Home', 'Life', 'Liability', 'Retirement', 'Cyber'],
    'Business Owner': ['Health', 'Car', 'Home', 'Life', 'Liability', 'Legal', 'Cyber']
  };
  
  const optionalCoverage = {
    'Young Professional': ['Travel', 'Electronics'],
    'Growing Family': ['Travel', 'Accident', 'Pet'],
    'Established Household': ['Travel', 'Legal', 'Cyber'],
    'Pre-Retiree': ['Travel', 'Legal', 'Accident'],
    'Retiree': ['Travel', 'Accident'],
    'High Net Worth': ['Travel', 'Pet', 'Electronics', 'Legal'],
    'Business Owner': ['Travel', 'Income']
  };
  
  const essential = essentialCoverage[persona] || [];
  const optional = optionalCoverage[persona] || [];
  
  const opportunities = [];
  
  essential.forEach(category => {
    if (!existingCategories.has(category)) {
      const categoryProducts = allProducts.filter(p => p.Category === category);
      const commission = commissionRules.find(r => r.Category === category);
      
      categoryProducts.forEach(product => {
        opportunities.push({
          clientId: client.ClientID,
          clientName: client.FullName,
          category,
          product,
          reason: `Missing essential ${category.toLowerCase()} coverage`,
          isEssential: true,
          needScore: 95,
          commission: commission || { CommissionRatePct: 8 }
        });
      });
    }
  });
  
  optional.forEach(category => {
    if (!existingCategories.has(category)) {
      const categoryProducts = allProducts.filter(p => p.Category === category);
      const commission = commissionRules.find(r => r.Category === category);
      
      categoryProducts.forEach(product => {
        opportunities.push({
          clientId: client.ClientID,
          clientName: client.FullName,
          category,
          product,
          reason: `High-value ${category.toLowerCase()} coverage opportunity`,
          isEssential: false,
          needScore: 70,
          commission: commission || { CommissionRatePct: 8 }
        });
      });
    }
  });
  
  return { persona, opportunities };
};

// Calculate opportunity score with balanced commission and customer benefit
const calculateOpportunityScore = (opportunity, client, isRenewal = false) => {
  const { needScore, product, commission } = opportunity;
  
  const incomeValue = client.IncomeBandEUR === '150k+' ? 150000 : 
                     client.IncomeBandEUR === '100k-150k' ? 125000 :
                     client.IncomeBandEUR === '75k-100k' ? 87500 :
                     client.IncomeBandEUR === '50k-75k' ? 62500 :
                     client.IncomeBandEUR === '35k-50k' ? 42500 :
                     client.IncomeBandEUR === '20k-35k' ? 27500 : 15000;
  
  const avgPremium = (product.BaseAnnualPremiumMinEUR + product.BaseAnnualPremiumMaxEUR) / 2;
  const affordabilityRatio = avgPremium / incomeValue;
  
  let fitScore = 100;
  if (affordabilityRatio > 0.02) fitScore = Math.max(20, 100 - (affordabilityRatio - 0.02) * 2000);
  
  // Commission score (normalized to 0-100)
  const commissionScore = commission.CommissionRatePct * 6.67;
  
  // Customer benefit score - balances commission with actual customer value
  // Higher commission categories should also provide high customer value
  const customerBenefitScore = needScore * (fitScore / 100); // Need weighted by affordability
  
  // Conversion probability
  const conversionScore = Math.min(100, 50 + client.NumberOfPolicies * 10);
  
  // BALANCED SCORING: Prioritize categories where both commission AND customer benefit are high
  // Formula emphasizes balance between earning and customer value
  const balanceScore = Math.sqrt(commissionScore * customerBenefitScore); // Geometric mean ensures both are high
  
  // Final weighted score with balanced approach
  // Need: 30%, Fit: 25%, Balance (commission+benefit): 30%, Conversion: 15%
  let totalScore = (needScore * 0.30) + (fitScore * 0.25) + (balanceScore * 0.30) + (conversionScore * 0.15);
  
  // Boost renewal opportunities - these are critical for maintaining relationships
  if (isRenewal) {
    totalScore = totalScore * 1.15; // 15% boost for renewals
  }
  
  return {
    score: Math.round(totalScore * 10) / 10,
    needScore,
    fitScore: Math.round(fitScore),
    commissionScore: Math.round(commissionScore),
    conversionScore: Math.round(conversionScore),
    balanceScore: Math.round(balanceScore),
    estimatedPremium: Math.round(avgPremium),
    estimatedCommission: Math.round(avgPremium * commission.CommissionRatePct / 100)
  };
};

// Main Application
export default function InsuranceSalesTool() {
  const [currentView, setCurrentView] = useState('upload');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRep, setSelectedRep] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPersona, setFilterPersona] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showMeetingPrep, setShowMeetingPrep] = useState(false);
  
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const [xlsxError, setXlsxError] = useState(null);
  
  useEffect(() => {
    console.log('Attempting to load XLSX library...');
    loadXLSX()
      .then(() => {
        console.log('✅ XLSX library loaded successfully');
        setXlsxLoaded(true);
        setXlsxError(null);
      })
      .catch(err => {
        console.error('❌ Failed to load XLSX library:', err);
        setXlsxError(err.message);
      });
  }, []);
  
  const retryLoadXLSX = () => {
    setXlsxError(null);
    setXlsxLoaded(false);
    loadXLSX()
      .then(() => {
        setXlsxLoaded(true);
        setXlsxError(null);
      })
      .catch(err => {
        setXlsxError(err.message);
      });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (typeof window.XLSX === 'undefined') {
          throw new Error('XLSX library not loaded');
        }
        
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        
        const requiredSheets = ['Clients', 'Products', 'Policies', 'SalesReps', 'CommissionRules'];
        const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));
        
        if (missingSheets.length > 0) {
          throw new Error(`Missing required sheets: ${missingSheets.join(', ')}`);
        }
        
        const clientsData = window.XLSX.utils.sheet_to_json(workbook.Sheets['Clients']);
        const productsData = window.XLSX.utils.sheet_to_json(workbook.Sheets['Products']);
        const policiesData = window.XLSX.utils.sheet_to_json(workbook.Sheets['Policies']);
        const salesRepsData = window.XLSX.utils.sheet_to_json(workbook.Sheets['SalesReps']);
        const commissionRulesData = window.XLSX.utils.sheet_to_json(workbook.Sheets['CommissionRules']);
        
        setClients(clientsData);
        setProducts(productsData);
        setPolicies(policiesData);
        setSalesReps(salesRepsData);
        setCommissionRules(commissionRulesData);
        
        generateOpportunities(clientsData, productsData, policiesData, commissionRulesData);
        
        setCurrentView('dashboard');
        setIsProcessing(false);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert(`Error: ${error.message}`);
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file');
      setIsProcessing(false);
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  // Generate opportunities from data
  const generateOpportunities = (clientsData, productsData, policiesData, commissionRulesData) => {
    const allOpportunities = [];
    const activePolicies = policiesData.filter(p => p.Status === 'Active');
    
    clientsData.forEach(client => {
      const clientPolicies = activePolicies.filter(p => p.ClientID === client.ClientID);
      const { persona, opportunities: clientOpps } = performGapAnalysis(
        client, 
        clientPolicies, 
        productsData, 
        commissionRulesData
      );
      
      client.Persona = persona;
      
      // Check for renewal opportunities (old contracts that could be renewed)
      const renewalOpportunities = checkRenewalOpportunities(client, clientPolicies, productsData, commissionRulesData);
      
      clientOpps.forEach(opp => {
        const scores = calculateOpportunityScore(opp, client, false);
        
        allOpportunities.push({
          ...opp,
          ...scores,
          age: client.Age,
          income: client.IncomeBandEUR,
          city: client.City,
          persona,
          salesRepId: client.SalesRepID,
          salesRepName: client.SalesRepName,
          productName: opp.product.ProductName,
          commissionPct: opp.commission.CommissionRatePct,
          isRenewal: false
        });
      });
      
      // Add renewal opportunities with boosted scores
      renewalOpportunities.forEach(opp => {
        const scores = calculateOpportunityScore(opp, client, true);
        
        allOpportunities.push({
          ...opp,
          ...scores,
          age: client.Age,
          income: client.IncomeBandEUR,
          city: client.City,
          persona,
          salesRepId: client.SalesRepID,
          salesRepName: client.SalesRepName,
          productName: opp.product.ProductName,
          commissionPct: opp.commission.CommissionRatePct,
          isRenewal: true,
          reason: `Renewal opportunity - existing policy could be upgraded or re-priced for better value`
        });
      });
    });
    
    // Sort by score descending
    allOpportunities.sort((a, b) => b.score - a.score);
    
    // Apply ethical filters
    const ethicalOpportunities = allOpportunities.filter(opp => {
      if (opp.needScore < 30) return false;
      
      const incomeValue = opp.income === '150k+' ? 150000 : 
                         opp.income === '100k-150k' ? 125000 :
                         opp.income === '75k-100k' ? 87500 :
                         opp.income === '50k-75k' ? 62500 :
                         opp.income === '35k-50k' ? 42500 :
                         opp.income === '20k-35k' ? 27500 : 15000;
      
      if (opp.estimatedPremium / incomeValue > 0.15) return false;
      
      return true;
    });
    
    setOpportunities(ethicalOpportunities);
  };

  // Check for renewal opportunities - old contracts that could be optimized
  const checkRenewalOpportunities = (client, clientPolicies, allProducts, commissionRules) => {
    const renewalOpps = [];
    const today = new Date();
    
    clientPolicies.forEach(policy => {
      // Check if policy is old enough for renewal consideration (>1 year old)
      const contractDate = new Date(policy.ContractStartDate);
      const monthsOld = (today - contractDate) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsOld >= 12) {
        // Look for better products in same category
        const betterProducts = allProducts.filter(p => 
          p.Category === policy.Category && 
          p.ProductCode !== policy.ProductCode
        );
        
        betterProducts.forEach(product => {
          const commission = commissionRules.find(r => r.Category === policy.Category);
          
          renewalOpps.push({
            clientId: client.ClientID,
            clientName: client.FullName,
            category: policy.Category,
            product: product,
            reason: `Renewal opportunity - existing ${policy.Category} policy could be upgraded`,
            isEssential: true,
            needScore: 90, // High need for renewals
            commission: commission || { CommissionRatePct: 8 },
            existingPolicy: policy
          });
        });
      }
    });
    
    return renewalOpps;
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = searchQuery === '' || 
        opp.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || opp.category === filterCategory;
      const matchesPersona = filterPersona === 'all' || opp.persona === filterPersona;
      const matchesRep = !selectedRep || opp.salesRepId === selectedRep;
      
      const matchesPriority = filterPriority === 'all' || 
        (filterPriority === 'critical' && opp.score >= 95) ||
        (filterPriority === 'high' && opp.score >= 85 && opp.score < 95) ||
        (filterPriority === 'medium' && opp.score >= 75 && opp.score < 85);
      
      return matchesSearch && matchesCategory && matchesPersona && matchesRep && matchesPriority;
    });
  }, [opportunities, searchQuery, filterCategory, filterPersona, selectedRep, filterPriority]);

  // Realistic KPIs based on top opportunities
  const kpis = useMemo(() => {
    // Focus on top 30 opportunities for realistic monthly goals
    const topOpps = filteredOpportunities.slice(0, 30);
    const totalOpps = topOpps.length;
    const totalPotentialCommission = topOpps.reduce((sum, o) => sum + (o.estimatedCommission || 0), 0);
    const avgScore = totalOpps > 0 ? topOpps.reduce((sum, o) => sum + (o.score || 0), 0) / totalOpps : 0;
    const criticalCount = topOpps.filter(o => o.score >= 95).length;
    const highCount = topOpps.filter(o => o.score >= 85 && o.score < 95).length;
    
    // Monthly targets
    const monthlyTarget = SALES_REP_CONFIG.monthlyTargets.commission;
    const targetProgress = monthlyTarget > 0 ? Math.min(100, (totalPotentialCommission / monthlyTarget) * 100) : 0;
    const policiesTarget = SALES_REP_CONFIG.monthlyTargets.policies;
    const estimatedClosedDeals = Math.round(totalOpps * SALES_REP_CONFIG.monthlyTargets.conversion);
    const dailyTarget = monthlyTarget / SALES_REP_CONFIG.workingDays;
    
    return { 
      totalOpps, 
      totalPotentialCommission: Math.round(totalPotentialCommission), 
      avgScore: Math.round(avgScore * 10) / 10, 
      criticalCount,
      highCount,
      monthlyTarget,
      targetProgress: Math.round(targetProgress * 10) / 10,
      policiesTarget,
      estimatedClosedDeals,
      dailyTarget: Math.round(dailyTarget)
    };
  }, [filteredOpportunities]);

  const [goalExpanded, setGoalExpanded] = useState(false);

  // Upload View (unchanged, keeping it simple)
  const renderUpload = () => (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/20 mx-auto mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Insurance Sales Assistant</h1>
          <p className="text-slate-400 text-base sm:text-lg">AI-powered opportunity identification</p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-6">Upload Customer Data</h2>
          
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer bg-slate-800/50 hover:bg-slate-800">
              <div className="flex flex-col items-center justify-center pt-7 pb-6 px-4">
                {xlsxError ? (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                    <p className="text-sm text-red-400 mb-2 text-center">Failed to load Excel library</p>
                    <button 
                      onClick={(e) => { e.preventDefault(); retryLoadXLSX(); }}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-white text-sm transition-colors"
                    >
                      Retry
                    </button>
                  </>
                ) : !xlsxLoaded ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-3"></div>
                    <p className="text-sm text-slate-400 text-center">Loading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="mb-2 text-sm text-slate-300 text-center">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 text-center">Excel file (.xlsx)</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isProcessing || !xlsxLoaded || xlsxError !== null}
              />
            </label>
          </div>
          
          {isProcessing && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-3"></div>
              <p className="text-slate-400">Processing...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Improved Dashboard View
  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Collapsible Goal Section with Stats */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl overflow-hidden">
        {/* Collapsed View - Just Progress Bar */}
        <div 
          onClick={() => setGoalExpanded(!goalExpanded)}
          className="cursor-pointer hover:bg-cyan-500/5 transition-colors"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">December Goal Progress</h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    €{kpis.totalPotentialCommission.toLocaleString()} of €{kpis.monthlyTarget.toLocaleString()} target • Top {kpis.totalOpps} opportunities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-bold text-cyan-400">{kpis.targetProgress}%</span>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${goalExpanded ? 'rotate-90' : ''}`} />
              </div>
            </div>
            
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, kpis.targetProgress)}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Expanded View - Detailed Stats */}
        {goalExpanded && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-cyan-500/20 space-y-4">
            {/* Primary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">Commission Target</span>
                </div>
                <div className="text-2xl font-bold text-white">€{kpis.totalPotentialCommission.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">of €{kpis.monthlyTarget.toLocaleString()} goal</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-violet-400" />
                  <span className="text-xs text-slate-400">Priority Actions</span>
                </div>
                <div className="text-2xl font-bold text-white">{kpis.criticalCount + kpis.highCount}</div>
                <div className="text-xs text-slate-500 mt-1">{kpis.criticalCount} critical, {kpis.highCount} high priority</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-400">Est. Closed Deals</span>
                </div>
                <div className="text-2xl font-bold text-white">{kpis.estimatedClosedDeals}</div>
                <div className="text-xs text-slate-500 mt-1">policies (25% conversion)</div>
              </div>
            </div>
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-slate-400">Critical</span>
                </div>
                <div className="text-xl font-bold text-red-400">{kpis.criticalCount}</div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-400">High Priority</span>
                </div>
                <div className="text-xl font-bold text-orange-400">{kpis.highCount}</div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-400">Total Opps</span>
                </div>
                <div className="text-xl font-bold text-white">{kpis.totalOpps}</div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  <span className="text-xs text-slate-400">Avg Score</span>
                </div>
                <div className="text-xl font-bold text-white">{kpis.avgScore}</div>
              </div>
            </div>
            
            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Daily target: <strong className="text-white">€{kpis.dailyTarget}</strong> • Focus on top <strong className="text-white">{kpis.totalOpps}</strong> opportunities</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none min-w-[140px]">
          <option value="all">All Priority</option>
          <option value="critical">Critical Only</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
        </select>
        
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none min-w-[140px]">
          <option value="all">All Categories</option>
          {Array.from(new Set(opportunities.map(o => o.category))).sort().map(cat => 
            <option key={cat} value={cat}>{cat}</option>
          )}
        </select>
      </div>

      {/* Focus List - Only Top 3 */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">Your Top 3 Focus</h3>
            <p className="text-xs sm:text-sm text-slate-400">Start here - highest priority opportunities</p>
          </div>
          {filteredOpportunities.length > 3 && (
            <span className="text-xs text-cyan-400 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/30">
              +{filteredOpportunities.length - 3} more
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-700/50">
          {filteredOpportunities.slice(0, 3).map((opp, index) => {
            const Icon = getCategoryIcon(opp.category);
            const priority = getPriorityBadge(opp.score);
            return (
              <div 
                key={`${opp.clientId}-${opp.category}-${index}`} 
                onClick={() => { setSelectedClient(opp); setCurrentView('client'); }} 
                className="px-4 sm:px-6 py-5 hover:bg-slate-700/20 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 text-lg font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${getPersonaColor(opp.persona)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <span className="text-white font-bold text-base sm:text-lg">
                      {opp.clientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <span className="font-semibold text-white truncate text-base">{opp.clientName}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${priority.color} flex-shrink-0 w-fit font-medium`}>
                        {priority.label}
                      </span>
                      {opp.isRenewal && (
                        <span className="px-2.5 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 flex-shrink-0 w-fit">
                          Renewal
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate font-medium">{opp.productName}</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs">{opp.income}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs hidden sm:inline">{opp.age} years</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(opp.score)}`}>
                      {opp.score}
                    </div>
                    <div className="text-xs text-slate-500">score</div>
                  </div>
                  <div className="hidden sm:block text-right flex-shrink-0 min-w-[90px]">
                    <div className="text-lg font-semibold text-emerald-400">
                      €{opp.estimatedCommission}
                    </div>
                    <div className="text-xs text-slate-500">commission</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredOpportunities.length > 3 && (
          <div className="px-4 sm:px-6 py-3 bg-slate-800/50 border-t border-slate-700/50 text-center">
            <button 
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              View all {filteredOpportunities.length} opportunities →
            </button>
          </div>
        )}
        
        {filteredOpportunities.length === 0 && (
          <div className="px-4 sm:px-6 py-12 text-center">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No opportunities match your current filters</p>
            <button 
              onClick={() => { setFilterPriority('all'); setFilterCategory('all'); setSearchQuery(''); }}
              className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Client Detail View with Consultative Sales Approach
  const renderClientDetail = () => {
    if (!selectedClient) return null;
    const Icon = getCategoryIcon(selectedClient.category);
    const priority = getPriorityBadge(selectedClient.score);
    
    // Consultative talking points based on playbook
    const talkingPoints = generateConsultativeTalkingPoints(selectedClient);
    
    const objectionHandlers = [
      { 
        objection: "I need to think about it", 
        response: "I appreciate you wanting to make an informed decision. Often when clients say this, there's a specific aspect they're uncertain about. Is it the coverage level, the premium, or perhaps how this fits with your other policies? I'd love to address any questions you have right now." 
      },
      { 
        objection: "It's too expensive", 
        response: "I understand your concern about cost. Let me break this down: at €" + Math.round(selectedClient.estimatedPremium/12) + " per month, this is protecting you from [specific risk]. Without this coverage, a single incident could cost you €" + (selectedClient.estimatedPremium * 10) + " or more. When you look at it that way, what feels expensive - the €" + Math.round(selectedClient.estimatedPremium/12) + "/month protection, or the potential €" + (selectedClient.estimatedPremium * 10) + "+ out-of-pocket?" 
      },
      { 
        objection: "I already have coverage", 
        response: "That's excellent that you're already protected! Many of my best clients had existing coverage when we met. Would you be open to a quick 10-minute coverage review? I often find gaps that clients didn't know existed - things like increased liability limits for growing families or cyber protection for high net worth individuals. At minimum, you'll have peace of mind knowing you're fully covered." 
      },
    ];

    // Email template
    const handleSendEmail = () => {
      const emailTemplate = generateEmailTemplate(selectedClient);
      // Copy to clipboard
      navigator.clipboard.writeText(emailTemplate).then(() => {
        alert('Email template copied to clipboard! Paste it into your email client.');
      }).catch(() => {
        // Fallback: show in modal
        alert('Email template:\n\n' + emailTemplate);
      });
    };

    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <button 
          onClick={() => { setCurrentView('dashboard'); setSelectedClient(null); }} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Back</span>
        </button>

        {/* Client Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${getPersonaColor(selectedClient.persona)} flex items-center justify-center shadow-xl flex-shrink-0`}>
              <span className="text-white font-bold text-xl sm:text-2xl">
                {selectedClient.clientName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{selectedClient.clientName}</h2>
                <span className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${getPersonaColor(selectedClient.persona)} text-white w-fit`}>
                  {selectedClient.persona}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{selectedClient.age} years</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Wallet className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{selectedClient.income}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{selectedClient.salesRepName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{selectedClient.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Recommended Product */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">{selectedClient.productName}</h3>
                  <p className="text-sm text-slate-400">{selectedClient.category} Insurance</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs border ${priority.color} flex-shrink-0`}>
                  {priority.label} Priority
                </span>
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(selectedClient.score)}`}>
                    {selectedClient.score}
                  </div>
                  <div className="text-xs text-slate-500">Score</div>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4 mb-4">
                <p className="text-sm sm:text-base text-slate-300">{selectedClient.reason}</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-400">{selectedClient.needScore}</div>
                  <div className="text-xs text-slate-400">Need</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-violet-400">{selectedClient.fitScore}</div>
                  <div className="text-xs text-slate-400">Fit</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-amber-400">{selectedClient.commissionPct}%</div>
                  <div className="text-xs text-slate-400">Rate</div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-400">€{selectedClient.estimatedCommission}</div>
                  <div className="text-xs text-slate-400">Commission</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/20 gap-3">
                <div>
                  <div className="text-sm text-slate-400">Annual Premium</div>
                  <div className="text-xl sm:text-2xl font-bold text-white">€{selectedClient.estimatedPremium.toLocaleString()}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-slate-400">Monthly</div>
                  <div className="text-lg sm:text-xl font-semibold text-emerald-400">€{Math.round(selectedClient.estimatedPremium/12)}</div>
                </div>
              </div>
            </div>

            {/* Consultative Talking Points */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />Consultative Approach
              </h3>
              <div className="space-y-3">
                {talkingPoints.map((point, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-slate-700/30 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-cyan-400 font-medium">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-cyan-400 font-medium mb-1">{point.stage}</div>
                      <p className="text-sm text-slate-300 leading-relaxed">{point.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Objection Handling */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />Objection Handling
              </h3>
              <div className="space-y-4">
                {objectionHandlers.map((item, i) => (
                  <div key={i} className="border border-slate-700/50 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-700/30">
                      <span className="text-amber-400 font-medium">"{item.objection}"</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-slate-300 text-sm">{item.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-white text-sm transition-colors flex items-center gap-3">
                  <Phone className="w-4 h-4 text-cyan-400" />Call Client
                </button>
                <button 
                  onClick={handleSendEmail}
                  className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-white text-sm transition-colors flex items-center gap-3"
                >
                  <Mail className="w-4 h-4 text-violet-400" />Send Email
                </button>
                <button className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-white text-sm transition-colors flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-amber-400" />Schedule
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl text-white text-sm transition-colors flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4" />Mark Contacted
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Generate consultative talking points based on playbook
  const generateConsultativeTalkingPoints = (client) => {
    return [
      {
        stage: "Build Rapport",
        text: `Start with: "Thank you for taking the time to speak with me today, ${client.clientName.split(' ')[0]}. Before we dive into coverage options, I'd love to learn a bit about your current situation. How has your experience been with insurance providers in the past?"`
      },
      {
        stage: "Discovery",
        text: `Ask: "I noticed you don't currently have ${client.category.toLowerCase()} coverage. What are your primary concerns when it comes to ${client.category.toLowerCase()} protection?" This uncovers their "why" and gives you a roadmap for your solution.`
      },
      {
        stage: "Value Positioning",
        text: `Explain: "The ${client.productName} provides ${getValueStatement(client.category)}. At €${Math.round(client.estimatedPremium/12)} per month, this fits comfortably within your budget while protecting you against [specific risk]." Focus on benefits, not just features.`
      },
      {
        stage: "Create Urgency (Not Pressure)",
        text: `${client.age >= 50 ? '"Premium rates increase with age - securing coverage now locks in your current rate and ensures you\'re protected."' : '"Building protection early means lower premiums and longer coverage. The best time to get covered is before you need it."'}`
      },
      {
        stage: "Assumptive Close",
        text: `Transition naturally: "Based on what you've shared, the ${client.productName} addresses your main concerns. Let's get you protected - I can walk you through the application right now. Do you have a few minutes?"`
      }
    ];
  };

  // Get value statement by category
  const getValueStatement = (category) => {
    const statements = {
      'Retirement': 'tax-advantaged savings and guaranteed income in retirement, giving you financial security when you need it most',
      'Life': 'financial security for your loved ones, ensuring your family can maintain their lifestyle if something happens to you',
      'Health': 'comprehensive medical coverage and peace of mind, protecting you from catastrophic healthcare costs',
      'Home': 'complete protection for your property and belongings, plus liability coverage if someone is injured on your property',
      'Car': 'coverage for accidents, theft, and liability, protecting both your vehicle and your financial security',
      'Income': 'income replacement if you become unable to work due to illness or injury, protecting your family\'s financial stability',
      'Liability': 'protection against lawsuits and claims, safeguarding your personal assets beyond your primary policy limits',
      'Travel': 'coverage for trip cancellations, medical emergencies abroad, and lost baggage, ensuring worry-free travel',
      'Cyber': 'protection against identity theft, data breaches, and cyber attacks on your personal information and finances'
    };
    return statements[category] || 'essential protection tailored to your specific needs and situation';
  };

  // Generate email template
  const generateEmailTemplate = (client) => {
    const monthlyPremium = Math.round(client.estimatedPremium / 12);
    
    return `Subject: ${client.category} Coverage Recommendation for ${client.clientName}

Hi ${client.clientName.split(' ')[0]},

It was great speaking with you today. As we discussed, I wanted to follow up with some details about the ${client.productName} that could be a strong fit for your situation.

**Why This Matters for You:**
${client.reason}

**Key Benefits:**
• ${getValueStatement(client.category)}
• Premium: €${client.estimatedPremium.toLocaleString()}/year (about €${monthlyPremium}/month)
• Tailored specifically for ${client.persona.toLowerCase()}s like yourself

**What Makes This Different:**
Unlike your typical insurance policy, this solution addresses the specific needs we identified:
- Protection against [specific risk relevant to their situation]
- Coverage that grows with your changing life circumstances
- Direct support and advocacy when you need it most

**Next Steps:**
I'd recommend we schedule a brief 15-minute call to walk through the coverage details and answer any questions. This way, you can make an informed decision that feels right for your situation.

Are you available [suggest 2-3 time slots]?

Looking forward to helping you secure the protection you need.

Best regards,
${client.salesRepName}

P.S. Remember, premium rates ${client.age >= 50 ? 'increase with age' : 'are lowest when you\'re younger and healthier'}. Locking in coverage now ensures you get the best possible rate.`;
  };

  // Main render
  if (currentView === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
        {renderUpload()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 p-4 flex flex-col z-40 hidden lg:flex">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-white">InsureCo</div>
            <div className="text-xs text-slate-400">Sales Assistant</div>
          </div>
        </div>
        
        {salesReps.length > 0 && (
          <div className="mb-6">
            <select 
              value={selectedRep || ''} 
              onChange={(e) => setSelectedRep(e.target.value ? parseInt(e.target.value) : null)} 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
            >
              <option value="">All Sales Reps</option>
              {salesReps.map(rep => (
                <option key={rep.SalesRepID} value={rep.SalesRepID}>
                  {rep.SalesRepName}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <nav className="space-y-1 flex-1">
          <button 
            onClick={() => { setCurrentView('dashboard'); setSelectedClient(null); }} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              currentView === 'dashboard' 
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />Dashboard
          </button>
          
          <button 
            onClick={() => setCurrentView('upload')} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <Upload className="w-5 h-5" />Upload Data
          </button>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 px-2">
            <div className="mb-1">{clients.length} clients</div>
            <div>{opportunities.length} opportunities</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  {currentView === 'dashboard' && 'Sales Dashboard'}
                  {currentView === 'client' && selectedClient?.clientName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 truncate">
                  {currentView === 'dashboard' && `${filteredOpportunities.length} opportunities • €${kpis.totalPotentialCommission.toLocaleString()} potential`}
                  {currentView === 'client' && selectedClient?.productName}
                </p>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <div className="text-xs sm:text-sm font-medium text-white">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            {/* Sales Rep Selector - visible on all screen sizes */}
            {salesReps.length > 0 && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <select 
                  value={selectedRep || ''} 
                  onChange={(e) => setSelectedRep(e.target.value ? parseInt(e.target.value) : null)} 
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">All Sales Reps ({salesReps.length})</option>
                  {salesReps.map(rep => (
                    <option key={rep.SalesRepID} value={rep.SalesRepID}>
                      {rep.SalesRepName} - {rep.Region}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>
        
        <main className="p-4 sm:p-8">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'client' && renderClientDetail()}
        </main>
      </div>
    </div>
  );
}
