// ============================================================================
// CONTINUED FROM PART 1
// TIERED PROPOSAL GENERATOR (Feature 2.2)
// ============================================================================

const generateTieredProposal = (opportunity, allProducts) => {
  const categoryProducts = allProducts
    .filter(p => p.Category === opportunity.category)
    .sort((a, b) => a.BaseAnnualPremiumMinEUR - b.BaseAnnualPremiumMinEUR);

  if (categoryProducts.length === 0) {
    return null;
  }

  // Essential tier: Lowest cost option
  const essential = categoryProducts[0];

  // Recommended tier: Mid-range or current product
  const recommendedIndex = Math.floor(categoryProducts.length / 2);
  const recommended = categoryProducts[recommendedIndex] || essential;

  // Premium tier: Highest coverage option
  const premium = categoryProducts[categoryProducts.length - 1];

  return {
    essential: {
      product: essential,
      tier: 'essential',
      label: 'Essential',
      description: 'Core protection at the most affordable price',
      icon: Shield,
      premium: (essential.BaseAnnualPremiumMinEUR + essential.BaseAnnualPremiumMaxEUR) / 2
    },
    recommended: {
      product: recommended,
      tier: 'recommended',
      label: 'Recommended',
      description: 'Best value - optimal coverage for your needs',
      icon: Star,
      premium: (recommended.BaseAnnualPremiumMinEUR + recommended.BaseAnnualPremiumMaxEUR) / 2,
      highlight: true
    },
    premium: {
      product: premium,
      tier: 'premium',
      label: 'Premium',
      description: 'Comprehensive protection with maximum coverage',
      icon: Award,
      premium: (premium.BaseAnnualPremiumMinEUR + premium.BaseAnnualPremiumMaxEUR) / 2
    }
  };
};

// ============================================================================
// MEETING PREPARATION GENERATOR (Feature 2.4)
// ============================================================================

const generateMeetingPrep = (client, opportunities, lifeEvents = []) => {
  const topOpportunities = opportunities.slice(0, 3);

  return {
    agenda: [
      { time: '5 min', task: 'Rapport Building', detail: 'Discuss their current situation and past insurance experiences' },
      { time: '10 min', task: 'Current Coverage Review', detail: `Walk through their ${client.NumberOfPolicies || 0} existing policies` },
      { time: '10 min', task: 'Gap Analysis Presentation', detail: `Highlight ${opportunities.length} missing coverage areas` },
      { time: '15 min', task: 'Solution Presentation', detail: 'Present top 3 recommendations with tiered options' },
      { time: '5 min', task: 'Q&A & Next Steps', detail: 'Address concerns and schedule follow-up' }
    ],
    keyTalkingPoints: [
      `Client is a ${client.Persona} - focus on ${getPersonaFocus(client.Persona)}`,
      `Missing ${opportunities.length} ${opportunities.length === 1 ? 'essential coverage area' : 'essential coverage areas'}`,
      `Top priority: ${topOpportunities[0]?.category} insurance (score: ${topOpportunities[0]?.score})`,
      lifeEvents.length > 0 ? `Life event detected: ${lifeEvents[0].label} - creates urgency` : 'No recent life events detected',
      `Total potential commission: €${topOpportunities.reduce((sum, o) => sum + (o.estimatedCommission || 0), 0)}`
    ],
    anticipatedQuestions: [
      { q: 'Why don\'t I already have this coverage?', a: 'Great question! Many policies evolve over time, and life changes create new needs. Let\'s review what\'s changed.' },
      { q: 'How does this compare to competitors?', a: 'I\'d be happy to provide a comparison. Our strength is [specific differentiator]. What specific competitors are you considering?' },
      { q: 'Can I afford this with my existing premiums?', a: `At ${Math.round((topOpportunities[0]?.estimatedPremium || 0) / (getIncomeValue(client.IncomeBandEUR) / 100))}% of your income, this fits the recommended budget. Let\'s see if we can optimize your existing coverage too.` }
    ],
    successMetrics: {
      primary: 'Get verbal commitment to move forward with top recommendation',
      secondary: 'Schedule follow-up call within 48 hours for policy application',
      minimum: 'Build rapport and trust for future conversations'
    },
    requiredMaterials: [
      'Current policy summary (bring printout)',
      'Product comparison table for top 3 categories',
      'Quick quote calculator',
      'Objection handling cheat sheet'
    ],
    clientBackground: {
      age: client.Age,
      income: client.IncomeBandEUR,
      persona: client.Persona,
      existingPolicies: client.NumberOfPolicies || 0,
      city: client.City,
      lifeEvents: lifeEvents
    }
  };
};

const getPersonaFocus = (persona) => {
  const focus = {
    'Young Professional': 'career protection and wealth building',
    'Growing Family': 'family security and home protection',
    'Established Household': 'comprehensive coverage and retirement planning',
    'Pre-Retiree': 'retirement security and healthcare',
    'Retiree': 'healthcare and estate protection',
    'High Net Worth': 'asset protection and tax optimization',
    'Business Owner': 'business continuity and liability protection'
  };
  return focus[persona] || 'comprehensive protection';
};

// ============================================================================
// ENHANCED EMAIL TEMPLATES (Feature 2.5)
// ============================================================================

const generateEmailTemplate = (client, templateType = 'initial') => {
  const monthlyPremium = Math.round(client.estimatedPremium / 12);

  const templates = {
    initial: `Subject: ${client.category} Coverage Recommendation for ${client.clientName}

Hi ${client.clientName.split(' ')[0]},

It was great speaking with you today. As we discussed, I wanted to follow up with some details about the ${client.productName} that could be a strong fit for your situation.

**Why This Matters for You:**
${client.reason}

**Key Benefits:**
• ${getValueStatement(client.category)}
• Premium: €${client.estimatedPremium.toLocaleString()}/year (about €${monthlyPremium}/month)
• Tailored specifically for ${client.persona.toLowerCase()}s like yourself

**What Makes This Different:**
Unlike typical insurance policies, this solution addresses the specific needs we identified:
- Protection against ${client.category.toLowerCase()}-specific risks in your situation
- Coverage that grows with your changing life circumstances
- Direct support and advocacy when you need it most

${client.lifeEvents && client.lifeEvents.length > 0 ? `**Timely Opportunity:**
I noticed you're in a ${client.lifeEvents[0].label.toLowerCase()} phase. This makes ${client.category} coverage especially relevant right now.

` : ''}**Next Steps:**
I'd recommend we schedule a brief 15-minute call to walk through the coverage details and answer any questions. This way, you can make an informed decision that feels right for your situation.

Are you available this week for a quick call?

Looking forward to helping you secure the protection you need.

Best regards,
${client.salesRepName}

P.S. Remember, premium rates ${client.age >= 50 ? 'increase with age' : 'are lowest when you\'re younger and healthier'}. Locking in coverage now ensures you get the best possible rate.`,

    followUp1Week: `Subject: Quick Follow-up: ${client.category} Coverage for ${client.clientName}

Hi ${client.clientName.split(' ')[0]},

I wanted to follow up on my email from last week about ${client.category} coverage. I know you're busy, so I'll keep this brief.

**Quick Recap:**
• Product: ${client.productName}
• Monthly Investment: €${monthlyPremium}
• Why it matters: ${client.reason}

I've helped many ${client.persona.toLowerCase()}s protect their ${client.category.toLowerCase()} situation, and I'd love to do the same for you.

Do you have 10 minutes this week for a quick call? I can answer any questions and walk you through the specifics.

Just reply with a good time, or feel free to call me directly.

Best,
${client.salesRepName}`,

    followUp2Weeks: `Subject: Final follow-up: ${client.category} Protection

Hi ${client.clientName.split(' ')[0]},

I don't want to be a pest, so this will be my last follow-up email. But I also don't want you to miss out on important ${client.category.toLowerCase()} protection.

**The Bottom Line:**
At €${monthlyPremium}/month, the ${client.productName} provides crucial protection that many ${client.persona.toLowerCase()}s overlook until it's too late.

If now's not the right time, I completely understand. But if you'd like to discuss this or any other coverage, I'm here to help - no pressure.

Just let me know if you'd like me to follow up in a few months, or if you have any questions I can answer via email.

Wishing you all the best,
${client.salesRepName}

P.S. Feel free to reach out anytime - my door is always open.`
  };

  return templates[templateType] || templates.initial;
};

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
    'Cyber': 'protection against identity theft, data breaches, and cyber attacks on your personal information and finances',
    'Legal': 'coverage for legal fees and representation in various situations, protecting you from costly legal expenses',
    'Accident': 'financial protection if you\'re injured in an accident, covering medical bills and lost income',
    'Pet': 'veterinary coverage for your beloved pets, ensuring they get the care they need without financial stress'
  };
  return statements[category] || 'essential protection tailored to your specific needs and situation';
};

// ============================================================================
// CONSULTATIVE TALKING POINTS
// ============================================================================

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

// ============================================================================
// EXPORT COMPONENT PIECES FOR MAIN APP
// ============================================================================

// This file contains helper functions and templates that extend the main application
// Import these into the main component file

export {
  generateTieredProposal,
  generateMeetingPrep,
  generateEmailTemplate,
  generateConsultativeTalkingPoints,
  getValueStatement,
  predictLikelyObjections
};
