import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, User, TrendingUp, DollarSign, Target, ChevronRight, AlertCircle, CheckCircle2, Phone, Mail, Calendar, BarChart3, Users, FileText, Zap, Shield, Heart, Home, Car, Briefcase, PiggyBank, Umbrella, ArrowUpRight, Star, Bell, Settings, X, MapPin, Wallet, Activity, Upload, Download, Filter, Plane, Scale, Smartphone, Gavel, Lock, Award, Clock, TrendingDown, PartyPopper, Package, Copy, ExternalLink, Check, Info } from 'lucide-react';

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl
            animate-slide-in-right
            ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : ''}
            ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-100' : ''}
            ${toast.type === 'info' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100' : ''}
            ${toast.type === 'warning' ? 'bg-amber-500/20 border-amber-500/50 text-amber-100' : ''}
          `}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:bg-white/10 rounded-lg p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Load SheetJS library dynamically with timeout and retry
const loadXLSX = (retryCount = 0) => {
  return new Promise((resolve, reject) => {
    if (typeof window.XLSX !== 'undefined') {
      resolve(window.XLSX);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (retryCount < 3) {
        console.log(`Retry ${retryCount + 1}/3 loading XLSX library...`);
        loadXLSX(retryCount + 1).then(resolve).catch(reject);
      } else {
        reject(new Error('Timeout loading XLSX library after 3 retries'));
      }
    }, 10000);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => {
      clearTimeout(timeoutId);
      resolve(window.XLSX);
    };
    script.onerror = () => {
      clearTimeout(timeoutId);
      if (retryCount < 3) {
        console.log(`Retry ${retryCount + 1}/3 loading XLSX library...`);
        loadXLSX(retryCount + 1).then(resolve).catch(reject);
      } else {
        reject(new Error('Failed to load XLSX library from CDN after 3 retries'));
      }
    };
    document.head.appendChild(script);
  });
};

// Sales Rep Configuration
const SALES_REP_CONFIG = {
  monthlyTargets: {
    commission: 5000,
    policies: 15,
    conversion: 0.25
  },
  workingDays: 20,
  baseSalary: 2500
};

// Helper to get income value from band
const getIncomeValue = (incomeBand) => {
  const incomeMap = {
    '150k+': 150000,
    '100k-150k': 125000,
    '75k-100k': 87500,
    '50k-75k': 62500,
    '35k-50k': 42500,
    '20k-35k': 27500,
    '<20k': 15000
  };
  return incomeMap[incomeBand] || 15000;
};

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

// ============================================================================
// LIFE EVENT DETECTION SYSTEM (Feature 2.1)
// ============================================================================

const detectLifeEvents = (client, clientPolicies) => {
  const events = [];
  const today = new Date();

  // Age-based life events
  if (client.Age >= 25 && client.Age <= 35) {
    const hasLife = clientPolicies.some(p => p.Category === 'Life');
    if (!hasLife) {
      events.push({
        type: 'careerStart',
        icon: Briefcase,
        label: 'Career Establishment',
        relevantCategories: ['Life', 'Income'],
        urgency: 'medium'
      });
    }
  }

  if (client.Age >= 30 && client.Age <= 45) {
    events.push({
      type: 'familyFormation',
      icon: Heart,
      label: 'Family Building Years',
      relevantCategories: ['Life', 'Home', 'Income'],
      urgency: 'high'
    });
  }

  if (client.Age >= 55) {
    events.push({
      type: 'retirementPlanning',
      icon: PiggyBank,
      label: 'Retirement Preparation',
      relevantCategories: ['Retirement', 'Health'],
      urgency: 'high'
    });
  }

  // Recent policy additions suggest life changes
  const recentPolicies = clientPolicies.filter(p => {
    const policyDate = new Date(p.ContractStartDate);
    const monthsOld = (today - policyDate) / (1000 * 60 * 60 * 24 * 30);
    return monthsOld <= 6;
  });

  if (recentPolicies.some(p => p.Category === 'Home')) {
    events.push({
      type: 'homePurchase',
      icon: Home,
      label: 'Recent Home Purchase',
      relevantCategories: ['Home', 'Liability', 'Life'],
      urgency: 'high'
    });
  }

  if (recentPolicies.some(p => p.Category === 'Car')) {
    events.push({
      type: 'vehiclePurchase',
      icon: Car,
      label: 'New Vehicle',
      relevantCategories: ['Car', 'Liability'],
      urgency: 'medium'
    });
  }

  // Income-based events
  const incomeValue = getIncomeValue(client.IncomeBandEUR);
  if (incomeValue >= 100000 && clientPolicies.length < 5) {
    events.push({
      type: 'wealthAccumulation',
      icon: TrendingUp,
      label: 'Wealth Growth Phase',
      relevantCategories: ['Retirement', 'Liability', 'Cyber'],
      urgency: 'medium'
    });
  }

  return events;
};

// ============================================================================
// PERSONA CLASSIFICATION & GAP ANALYSIS
// ============================================================================

const classifyPersona = (age, income, numberOfPolicies) => {
  const incomeValue = getIncomeValue(income);

  if (incomeValue > 100000) return 'High Net Worth';
  if (age >= 65) return 'Retiree';
  if (age >= 55) return 'Pre-Retiree';
  if (age >= 45) return 'Established Household';
  if (age >= 30) return 'Growing Family';
  return 'Young Professional';
};

const performGapAnalysis = (client, clientPolicies, allProducts, commissionRules) => {
  try {
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
  } catch (error) {
    console.error(`Error in gap analysis for client ${client.ClientID}:`, error);
    return { persona: 'Young Professional', opportunities: [] };
  }
};

// ============================================================================
// OPPORTUNITY SCORING WITH LIFE EVENT BOOST
// ============================================================================

const calculateOpportunityScore = (opportunity, client, isRenewal = false, lifeEvents = []) => {
  try {
    const { needScore, product, commission } = opportunity;

    const incomeValue = getIncomeValue(client.IncomeBandEUR);
    const avgPremium = (product.BaseAnnualPremiumMinEUR + product.BaseAnnualPremiumMaxEUR) / 2;
    const affordabilityRatio = avgPremium / incomeValue;

    let fitScore = 100;
    if (affordabilityRatio > 0.02) {
      fitScore = Math.max(20, 100 - (affordabilityRatio - 0.02) * 2000);
    }

    const commissionScore = Math.min(100, commission.CommissionRatePct * 6.67);
    const customerBenefitScore = needScore * (fitScore / 100);
    const conversionScore = Math.min(100, 50 + (client.NumberOfPolicies || 0) * 10);
    const balanceScore = Math.sqrt(commissionScore * customerBenefitScore);

    let totalScore = (needScore * 0.30) + (fitScore * 0.25) + (balanceScore * 0.30) + (conversionScore * 0.15);

    // Life event boost
    const hasRelevantLifeEvent = lifeEvents.some(e =>
      e.relevantCategories.includes(opportunity.category)
    );
    if (hasRelevantLifeEvent) {
      totalScore *= 1.20; // +20% boost
    }

    // Renewal boost
    if (isRenewal) {
      totalScore *= 1.15; // +15% boost
    }

    return {
      score: Math.round(totalScore * 10) / 10,
      needScore,
      fitScore: Math.round(fitScore),
      commissionScore: Math.round(commissionScore),
      conversionScore: Math.round(conversionScore),
      balanceScore: Math.round(balanceScore),
      estimatedPremium: Math.round(avgPremium),
      estimatedCommission: Math.round(avgPremium * commission.CommissionRatePct / 100),
      hasLifeEventBoost: hasRelevantLifeEvent
    };
  } catch (error) {
    console.error('Error calculating opportunity score:', error);
    return {
      score: 0,
      needScore: 0,
      fitScore: 0,
      commissionScore: 0,
      conversionScore: 0,
      balanceScore: 0,
      estimatedPremium: 0,
      estimatedCommission: 0,
      hasLifeEventBoost: false
    };
  }
};

// Check for renewal opportunities
const checkRenewalOpportunities = (client, clientPolicies, allProducts, commissionRules) => {
  const renewalOpps = [];
  const today = new Date();

  try {
    clientPolicies.forEach(policy => {
      const contractDate = new Date(policy.ContractStartDate);
      const monthsOld = (today - contractDate) / (1000 * 60 * 60 * 24 * 30);

      if (monthsOld >= 12) {
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
            needScore: 90,
            commission: commission || { CommissionRatePct: 8 },
            existingPolicy: policy
          });
        });
      }
    });
  } catch (error) {
    console.error('Error checking renewal opportunities:', error);
  }

  return renewalOpps;
};

// ============================================================================
// OBJECTION PREDICTION ENGINE (Feature 2.3)
// ============================================================================

const predictLikelyObjections = (client, opportunity) => {
  const objections = [];
  const incomeValue = getIncomeValue(client.IncomeBandEUR);
  const affordabilityRatio = opportunity.estimatedPremium / incomeValue;

  // Persona-based predictions
  if (client.Persona === 'Young Professional') {
    objections.push({
      objection: 'price',
      likelihood: 'high',
      response: `I understand budget is important. At €${Math.round(opportunity.estimatedPremium/12)}/month, this is less than a daily coffee - but it protects your entire ${opportunity.category.toLowerCase()} situation. Can we talk about what fits your budget?`
    });
  }

  if (client.Persona === 'High Net Worth') {
    objections.push({
      objection: 'service_quality',
      likelihood: 'medium',
      response: `You deserve premium service, and that's exactly what we provide. You'll have direct access to me, 24/7 claims support, and white-glove service. Our high-net-worth clients appreciate the personalized attention.`
    });
  }

  // Affordability-based
  if (affordabilityRatio > 0.05) {
    objections.push({
      objection: 'affordability',
      likelihood: 'high',
      response: `Let's look at payment options. We can structure this to fit your budget, and remember - one incident without coverage could cost 10-20x this annual premium. What monthly amount feels comfortable for you?`
    });
  }

  // Existing coverage
  if ((client.NumberOfPolicies || 0) > 5) {
    objections.push({
      objection: 'already_covered',
      likelihood: 'high',
      response: `I'm glad you're already well-protected! Many of my best clients had extensive coverage when we met. May I do a quick gap analysis? I often find coverage holes even well-insured clients don't know exist.`
    });
  }

  // Category-specific
  if (opportunity.category === 'Cyber' || opportunity.category === 'Legal') {
    objections.push({
      objection: 'not_necessary',
      likelihood: 'medium',
      response: `I hear this often, and I understand - it's hard to insure against something that hasn't happened. But did you know [stat about category risks]? The cost of being wrong is significant. Can we discuss what protection makes sense for your situation?`
    });
  }

  return objections.slice(0, 3); // Return top 3
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export default function InsuranceSalesTool() {
  // State management
  const [currentView, setCurrentView] = useState('upload');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRep, setSelectedRep] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPersona, setFilterPersona] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showMeetingPrep, setShowMeetingPrep] = useState(false);
  const [showTieredProposal, setShowTieredProposal] = useState(false);
  const [selectedTier, setSelectedTier] = useState('recommended');
  const [contactedOpportunities, setContactedOpportunities] = useState(new Set());

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [commissionRules, setCommissionRules] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [lifeEventsMap, setLifeEventsMap] = useState(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const [xlsxError, setXlsxError] = useState(null);
  const [goalExpanded, setGoalExpanded] = useState(false);

  const { toasts, showToast, removeToast } = useToast();
  const searchInputRef = useRef(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load XLSX library
  useEffect(() => {
    console.log('Attempting to load XLSX library...');
    loadXLSX()
      .then(() => {
        console.log('✅ XLSX library loaded successfully');
        setXlsxLoaded(true);
        setXlsxError(null);
        showToast('Excel library loaded successfully', 'success', 2000);
      })
      .catch(err => {
        console.error('❌ Failed to load XLSX library:', err);
        setXlsxError(err.message);
        showToast('Failed to load Excel library. Click Retry.', 'error', 5000);
      });
  }, []);

  const retryLoadXLSX = () => {
    setXlsxError(null);
    setXlsxLoaded(false);
    showToast('Retrying library load...', 'info', 2000);
    loadXLSX()
      .then(() => {
        setXlsxLoaded(true);
        setXlsxError(null);
        showToast('Excel library loaded successfully', 'success');
      })
      .catch(err => {
        setXlsxError(err.message);
        showToast('Failed to load Excel library. Please check your connection.', 'error');
      });
  };

  // File upload handler with comprehensive error handling
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      showToast('Please upload a valid Excel file (.xlsx or .xls)', 'error');
      return;
    }

    setIsProcessing(true);
    showToast('Processing Excel file...', 'info', 2000);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (typeof window.XLSX === 'undefined') {
          throw new Error('XLSX library not loaded. Please retry loading the library.');
        }

        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });

        // Validate required sheets
        const requiredSheets = ['Clients', 'Products', 'Policies', 'SalesReps', 'CommissionRules'];
        const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));

        if (missingSheets.length > 0) {
          throw new Error(`Missing required sheets: ${missingSheets.join(', ')}. Please ensure your Excel file contains all required sheets.`);
        }

        // Read all sheets
        const clientsData = window.XLSX.utils.sheet_to_json(workbook.Sheets['Clients']);
        const productsData = window.XLSX.utils.sheet_to_json(workbook.Sheets['Products']);
        const policiesData = window.XLSX.utils.sheet_to_json(workbook.Sheets['Policies']);
        const salesRepsData = window.XLSX.utils.sheet_to_json(workbook.Sheets['SalesReps']);
        const commissionRulesData = window.XLSX.utils.sheet_to_json(workbook.Sheets['CommissionRules']);

        // Validate data is not empty
        if (clientsData.length === 0) {
          throw new Error('Clients sheet is empty. Please add client data.');
        }
        if (productsData.length === 0) {
          throw new Error('Products sheet is empty. Please add product data.');
        }

        // Store data
        setClients(clientsData);
        setProducts(productsData);
        setPolicies(policiesData);
        setSalesReps(salesRepsData);
        setCommissionRules(commissionRulesData);

        // Generate opportunities
        const result = generateOpportunities(clientsData, productsData, policiesData, commissionRulesData);

        setCurrentView('dashboard');
        setIsProcessing(false);
        showToast(`✅ Successfully loaded ${clientsData.length} clients and generated ${result.opportunityCount} opportunities`, 'success', 4000);

      } catch (error) {
        console.error('Error reading Excel file:', error);
        showToast(`Error: ${error.message}`, 'error', 5000);
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      showToast('Error reading file. Please try again.', 'error');
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Generate opportunities with life event detection
  const generateOpportunities = useCallback((clientsData, productsData, policiesData, commissionRulesData) => {
    const allOpportunities = [];
    const activePolicies = policiesData.filter(p => p.Status === 'Active');
    const eventsMap = new Map();

    let processedClients = 0;
    let totalOpportunities = 0;

    clientsData.forEach(client => {
      try {
        const clientPolicies = activePolicies.filter(p => p.ClientID === client.ClientID);
        const { persona, opportunities: clientOpps } = performGapAnalysis(
          client,
          clientPolicies,
          productsData,
          commissionRulesData
        );

        client.Persona = persona;

        // Detect life events
        const lifeEvents = detectLifeEvents(client, clientPolicies);
        eventsMap.set(client.ClientID, lifeEvents);

        // Check renewals
        const renewalOpportunities = checkRenewalOpportunities(client, clientPolicies, productsData, commissionRulesData);

        // Process new coverage opportunities
        clientOpps.forEach(opp => {
          const scores = calculateOpportunityScore(opp, client, false, lifeEvents);

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
            isRenewal: false,
            lifeEvents: lifeEvents.filter(e => e.relevantCategories.includes(opp.category))
          });
        });

        // Process renewal opportunities
        renewalOpportunities.forEach(opp => {
          const scores = calculateOpportunityScore(opp, client, true, lifeEvents);

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
            reason: `Renewal opportunity - existing policy could be upgraded or re-priced for better value`,
            lifeEvents: lifeEvents.filter(e => e.relevantCategories.includes(opp.category))
          });
        });

        processedClients++;
        totalOpportunities = allOpportunities.length;

      } catch (error) {
        console.error(`Error processing client ${client.ClientID}:`, error);
      }
    });

    // Sort by score
    allOpportunities.sort((a, b) => b.score - a.score);

    // Apply ethical filters
    const ethicalOpportunities = allOpportunities.filter(opp => {
      if (opp.needScore < 30) return false;

      const incomeValue = getIncomeValue(opp.income);
      if (opp.estimatedPremium / incomeValue > 0.15) return false;

      return true;
    });

    setOpportunities(ethicalOpportunities);
    setLifeEventsMap(eventsMap);

    console.log(`✅ Processed ${processedClients} clients, generated ${ethicalOpportunities.length} ethical opportunities`);

    return {
      clientCount: processedClients,
      opportunityCount: ethicalOpportunities.length
    };
  }, []);

  // Filtered opportunities with debounced search
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = debouncedSearch === '' ||
        opp.clientName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        opp.productName.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = filterCategory === 'all' || opp.category === filterCategory;
      const matchesPersona = filterPersona === 'all' || opp.persona === filterPersona;
      const matchesRep = !selectedRep || opp.salesRepId === selectedRep;

      const matchesPriority = filterPriority === 'all' ||
        (filterPriority === 'critical' && opp.score >= 95) ||
        (filterPriority === 'high' && opp.score >= 85 && opp.score < 95) ||
        (filterPriority === 'medium' && opp.score >= 75 && opp.score < 85);

      return matchesSearch && matchesCategory && matchesPersona && matchesRep && matchesPriority;
    });
  }, [opportunities, debouncedSearch, filterCategory, filterPersona, selectedRep, filterPriority]);

  // KPIs calculation
  const kpis = useMemo(() => {
    const topOpps = filteredOpportunities.slice(0, 30);
    const totalOpps = topOpps.length;
    const totalPotentialCommission = topOpps.reduce((sum, o) => sum + (o.estimatedCommission || 0), 0);
    const avgScore = totalOpps > 0 ? topOpps.reduce((sum, o) => sum + (o.score || 0), 0) / totalOpps : 0;
    const criticalCount = topOpps.filter(o => o.score >= 95).length;
    const highCount = topOpps.filter(o => o.score >= 85 && o.score < 95).length;

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

  // ============================================================================
  // QUICK ACTIONS - NOW FULLY FUNCTIONAL (BUG FIX)
  // ============================================================================

  const handleCallClient = useCallback((client) => {
    // Option 1: If phone number is available, use tel: link
    if (client.phone) {
      window.location.href = `tel:${client.phone}`;
      showToast(`Calling ${client.clientName}...`, 'info');
    } else {
      // Option 2: Show modal with instructions
      showToast(`📞 Call ${client.clientName} - Phone lookup needed`, 'info', 4000);
      // In a real app, this would open a CRM integration or phone system
    }

    // Log the interaction
    console.log(`Call initiated for client: ${client.clientName}`);
  }, [showToast]);

  const handleScheduleMeeting = useCallback((client) => {
    // Option 1: Open default calendar with pre-filled event
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Tomorrow
    startDate.setHours(10, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(10, 30, 0, 0);

    const title = encodeURIComponent(`Sales Call: ${client.clientName} - ${client.productName}`);
    const details = encodeURIComponent(`Discuss ${client.category} insurance opportunity\nScore: ${client.score}\nEstimated Commission: €${client.estimatedCommission}`);
    const dates = `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

    // Google Calendar link
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;

    window.open(calendarUrl, '_blank');
    showToast(`📅 Calendar opened for ${client.clientName}`, 'success');

    console.log(`Meeting scheduled for client: ${client.clientName}`);
  }, [showToast]);

  const handleMarkContacted = useCallback((client) => {
    const oppKey = `${client.clientId}-${client.category}`;

    setContactedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(oppKey)) {
        newSet.delete(oppKey);
        showToast(`Unmarked ${client.clientName} as contacted`, 'info');
        return newSet;
      } else {
        newSet.add(oppKey);
        showToast(`✓ Marked ${client.clientName} as contacted`, 'success');
        return newSet;
      }
    });

    console.log(`Contact status toggled for: ${client.clientName}`);
  }, [showToast]);

  const handleSendEmail = useCallback((client) => {
    const emailTemplate = generateEmailTemplate(client);

    // Option 1: Copy to clipboard
    navigator.clipboard.writeText(emailTemplate)
      .then(() => {
        showToast('✓ Email template copied to clipboard!', 'success');
      })
      .catch(() => {
        // Fallback: Open in default email client
        const subject = encodeURIComponent(`${client.category} Coverage Recommendation`);
        const body = encodeURIComponent(emailTemplate);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        showToast('Email client opened', 'info');
      });

    console.log(`Email template generated for: ${client.clientName}`);
  }, [showToast]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterPersona('all');
    setFilterPriority('all');
    setSelectedRep(null);
    showToast('Filters cleared', 'info', 2000);
  }, [showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // "/" to focus search
      if (e.key === '/' && currentView === 'dashboard') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // "Escape" to clear search or go back
      if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        } else if (currentView === 'client') {
          setCurrentView('dashboard');
          setSelectedClient(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentView, searchQuery]);

  // Continue in next part...
