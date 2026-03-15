import React, { useState } from 'react';
import { 
  Shield, Check, Sparkles, ArrowRight, Ambulance, Heart, Users, Zap, 
  ExternalLink, Info, X, Activity, CreditCard, Clock, MapPin, Bed
} from 'lucide-react';

interface InsurancePageProps {
  onBack: () => void;
  onGetCovered: () => void;
}

const InsurancePage: React.FC<InsurancePageProps> = ({ onBack, onGetCovered }) => {
  const [selectedDetailPlan, setSelectedDetailPlan] = useState<any | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<any>({});

  const scrollToPlans = () => {
    document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuizAnswer = (key: string, value: string) => {
    setQuizAnswers({ ...quizAnswers, [key]: value });
    setQuizStep(quizStep + 1);
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
  };

  const getRecommendedPlanId = () => {
    if (quizAnswers.coverage === 'family') return 'popular';
    if (quizAnswers.risk === 'high') return 'max';
    return 'starter';
  };

  const recommendedPlanId = getRecommendedPlanId();

  const generateDeepLink = (planType: string) => {
    // CERS+ uses existing user context (age, city, state, emergency patterns)
    const baseUrl = "https://www.policybazaar.com/health-insurance/";
    
    // Mock user context - in a real app, these would come from the UserProfile/Context
    const userContext = {
      age: 28,
      city: "Surat",
      state: "Gujarat",
      familySize: planType === 'popular' ? 4 : 1,
      riskLevel: "High (Road Accident Zone)",
      focus: planType === 'max' ? 'hospitalisation' : 'emergency_accidental'
    };

    const params = new URLSearchParams({
      utm_source: "cers_plus",
      utm_medium: "smart_filter",
      city: userContext.city,
      state: userContext.state,
      age: userContext.age.toString(),
      family_size: userContext.familySize.toString(),
      plan_category: planType === 'starter' ? 'individual' : (planType === 'popular' ? 'family_floater' : 'individual_high_cover'),
      sum_insured: planType === 'max' ? '500000' : (planType === 'popular' ? '300000' : '100000'),
      focus: userContext.focus,
      risk_context: userContext.riskLevel
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const handleGetCovered = (planId: string) => {
    const link = generateDeepLink(planId);
    window.open(link, '_blank');
  };

  const plans = [
    {
      id: 'starter',
      badge: 'Low Premium',
      name: 'Basic Emergency Cover',
      insurer: 'ICICI Lombard',
      price: '₹299',
      subPrice: '~₹10 per day',
      tagline: '₹1L cover · Cashless · Individual',
      whoIsItFor: 'Best for individuals who want a simple emergency backup at the lowest cost.',
      description: 'Essential cover for ambulance and short hospital visits.',
      network: '5,000+ Hospitals',
      claimsRatio: '98.5%',
      keyHighlights: ['Accident cover from Day 1', 'No medical checkup', 'Digital claim in 4h'],
      bullets: [
        'Ambulance coverage up to ₹10,000',
        'Hospitalisation cover up to ₹1 lakh',
        'Cashless at partner hospitals',
        '24/7 emergency support line'
      ],
      details: {
        waitingPeriod: '30 days for illnesses, 0 days for accidents.',
        scenario: 'If you have a road accident needing ambulance + 2 days admission, this plan can cover up to ₹1,10,000.'
      },
      highlight: false
    },
    {
      id: 'popular',
      badge: 'Recommended',
      name: 'Family Emergency Shield',
      insurer: 'HDFC ERGO',
      price: '₹699',
      subPrice: '~₹23 per day',
      tagline: '₹3L cover · Cashless · Family of 4',
      whoIsItFor: 'Best for families who want one plan to protect everyone in emergency situations.',
      description: 'Protect your entire family from sudden emergency costs.',
      network: '10,000+ Hospitals',
      claimsRatio: '99.2%',
      keyHighlights: ['Maternity & New born cover', 'AYUSH treatments included', 'Restoration of cover'],
      bullets: [
        'Covers up to 4 family members',
        'Ambulance + ICU support',
        'Hospitalisation up to ₹3 lakh',
        'Cashless at 10,000+ network hospitals'
      ],
      details: {
        waitingPeriod: 'Standard 30 days (Accidents covered from Day 1).',
        scenario: 'Covers major emergency admissions for any family member including high-cost ICU stays.'
      },
      highlight: true
    },
    {
      id: 'max',
      badge: 'High Coverage',
      name: 'Ambulance + Hospital Bundle',
      insurer: 'TATA AIG',
      price: '₹999',
      subPrice: '~₹33 per day',
      tagline: '₹5L cover · Priority Claim · Global',
      whoIsItFor: 'Best for drivers, field workers, or high-risk areas needing higher limits.',
      description: 'Higher limits for frequent travelers and high-risk zones.',
      network: 'All Network Hospitals',
      claimsRatio: '99.0%',
      keyHighlights: ['Air ambulance covered', 'Global emergency support', 'Zero co-payment'],
      bullets: [
        'Ambulance limit up to ₹25,000',
        'Hospitalisation up to ₹5 lakh',
        'Priority claim support via CERS+',
        'Best for drivers & high-risk jobs'
      ],
      details: {
        waitingPeriod: 'Accidental cover is immediate. Minimal illness wait.',
        scenario: 'Highest protection for high-impact emergencies including air ambulance if needed.'
      },
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shield size={24} className="text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-800">CERS<span className="text-blue-600">+</span> Protection</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={scrollToPlans}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors hidden md:block"
          >
            Plans
          </button>
          <button 
            onClick={onBack}
            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-12 md:py-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
            Protect Your Emergencies <br className="hidden md:block" /> From Just <span className="text-blue-600">₹10/Day</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
            Smart, low-cost emergency insurance designed for ambulance and hospital cases, in partnership with trusted insurers.
          </p>
          <div className="flex flex-col items-center md:items-start gap-4">
            <button 
              onClick={scrollToPlans}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3"
            >
              View Plans <ArrowRight size={20} />
            </button>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              IRDAI-approved partner insurers · 2-minute purchase · No complex forms
            </p>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md md:max-w-none">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-[60px] rotate-6 transform translate-x-4 translate-y-4"></div>
            <div className="relative bg-white border-2 border-slate-100 p-8 rounded-[60px] shadow-2xl">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Ambulance size={120} className="text-blue-600" />
                  <div className="absolute -top-4 -right-4 bg-green-500 p-4 rounded-full shadow-lg border-4 border-white">
                    <Shield size={32} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Smart Recommendation Banner */}
      <section className="px-6 mb-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-center gap-4 shadow-xl shadow-blue-100 text-center md:text-left">
          <div className="bg-white/20 p-3 rounded-2xl shrink-0">
            <Sparkles size={24} className="text-white" />
          </div>
          <p className="text-white font-medium text-sm md:text-base leading-relaxed max-w-4xl">
            <span className="font-black">CERS+ Smart Filtering:</span> We've pre-analyzed your emergency history and local risks to find the best-fit plans. One click and you're ready to select.
          </p>
        </div>
      </section>

      {/* How CERS+ custom-filters plans */}
      <section className="px-6 mb-24 max-w-7xl mx-auto">
        <div className="bg-white border-2 border-slate-100 rounded-[40px] p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <Activity className="text-blue-600" /> How CERS+ Pre-filters For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 font-black">1</div>
              <h4 className="font-bold text-slate-800">Basic User Data</h4>
              <p className="text-sm text-slate-500 leading-relaxed">We automatically use your age, city, and state to find local network hospitals and region-specific pricing.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 font-black">2</div>
              <h4 className="font-bold text-slate-800">Emergency Patterns</h4>
              <p className="text-sm text-slate-500 leading-relaxed">More road accidents in your area? Frequent cardiac cases? We prioritize plans with higher coverage for those specific risks.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 font-black">3</div>
              <h4 className="font-bold text-slate-800">Family Size</h4>
              <p className="text-sm text-slate-500 leading-relaxed">If you've added family members to CERS+, we auto-switch to "Family Floater" filters to ensure everyone is protected under one link.</p>
            </div>
          </div>
          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium italic">"We pre-filter your insurance according to your need and then hand you off to the official marketplace page for final selection and payment."</p>
          </div>
        </div>
      </section>

      {/* Find My Plan Quiz Widget */}
      <section className="px-6 mb-24 max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-[40px] p-8 md:p-16 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-24 opacity-5 rotate-12">
            <Sparkles size={300} />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {quizStep === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-black mb-6">Not sure which plan to pick?</h2>
                <p className="text-slate-400 mb-10 font-medium">Take our 30-second quiz to find your perfect emergency match.</p>
                <button 
                  onClick={() => setQuizStep(1)}
                  className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40"
                >
                  Start Quiz
                </button>
              </div>
            )}

            {quizStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-blue-500 font-black text-xs uppercase tracking-widest mb-4 block">Question 1 of 2</span>
                <h2 className="text-3xl font-black mb-10">Who are you protecting?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleQuizAnswer('coverage', 'individual')}
                    className="bg-white/10 hover:bg-white/20 p-8 rounded-3xl border border-white/10 transition-all text-left group"
                  >
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Shield size={24} />
                    </div>
                    <h4 className="font-black text-xl mb-2">Just Myself</h4>
                    <p className="text-slate-400 text-sm">Individual coverage for one person.</p>
                  </button>
                  <button 
                    onClick={() => handleQuizAnswer('coverage', 'family')}
                    className="bg-white/10 hover:bg-white/20 p-8 rounded-3xl border border-white/10 transition-all text-left group"
                  >
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users size={24} />
                    </div>
                    <h4 className="font-black text-xl mb-2">My Family</h4>
                    <p className="text-slate-400 text-sm">Cover for spouse, kids, or parents.</p>
                  </button>
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-blue-500 font-black text-xs uppercase tracking-widest mb-4 block">Question 2 of 2</span>
                <h2 className="text-3xl font-black mb-10">What's your primary concern?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleQuizAnswer('risk', 'low')}
                    className="bg-white/10 hover:bg-white/20 p-8 rounded-3xl border border-white/10 transition-all text-left group"
                  >
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Heart size={24} />
                    </div>
                    <h4 className="font-black text-xl mb-2">Basic Backup</h4>
                    <p className="text-slate-400 text-sm">Just in case of minor accidents.</p>
                  </button>
                  <button 
                    onClick={() => handleQuizAnswer('risk', 'high')}
                    className="bg-white/10 hover:bg-white/20 p-8 rounded-3xl border border-white/10 transition-all text-left group"
                  >
                    <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Zap size={24} />
                    </div>
                    <h4 className="font-black text-xl mb-2">High Risk Area</h4>
                    <p className="text-slate-400 text-sm">I drive a lot or live in high-risk zones.</p>
                  </button>
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/50">
                  <Check size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-black mb-4">We've found your match!</h2>
                <p className="text-slate-400 mb-8 font-medium">Based on your answers, we recommend the:</p>
                
                <div className="bg-white text-slate-900 p-8 rounded-[32px] mb-10 text-left border-b-[8px] border-blue-600 max-w-md mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="text-blue-600" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Our Top Pick</span>
                  </div>
                  <h3 className="text-2xl font-black mb-2">{plans.find(p => p.id === recommendedPlanId)?.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">{plans.find(p => p.id === recommendedPlanId)?.description}</p>
                  <button 
                    onClick={scrollToPlans}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    View This Plan <ArrowRight size={18} />
                  </button>
                </div>
                
                <button 
                  onClick={resetQuiz}
                  className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
                >
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="px-6 py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Compare Plans at a Glance</h2>
            <p className="text-slate-500 font-medium italic">Everything you need to know, side by side.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-6 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">Features</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="p-6 border-b border-slate-100 text-center">
                      <span className="text-sm font-black text-slate-900 block mb-1">{plan.name}</span>
                      <span className="text-blue-600 font-black text-xl">{plan.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="p-6 text-sm font-bold text-slate-600">Ambulance Coverage</td>
                  <td className="p-6 text-center text-sm font-medium">₹10,000</td>
                  <td className="p-6 text-center text-sm font-medium bg-blue-50/30">₹25,000</td>
                  <td className="p-6 text-center text-sm font-medium">₹25,000</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-bold text-slate-600">Hospitalisation Limit</td>
                  <td className="p-6 text-center text-sm font-medium">₹1 Lakh</td>
                  <td className="p-6 text-center text-sm font-medium bg-blue-50/30">₹3 Lakh</td>
                  <td className="p-6 text-center text-sm font-medium font-black text-blue-600">₹5 Lakh</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-bold text-slate-600">ICU Charges</td>
                  <td className="p-6 text-center text-sm font-medium">Covered</td>
                  <td className="p-6 text-center text-sm font-medium bg-blue-50/30">Covered (Full)</td>
                  <td className="p-6 text-center text-sm font-medium">Covered (Full)</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-bold text-slate-600">Claim Process</td>
                  <td className="p-6 text-center text-sm font-medium">Standard</td>
                  <td className="p-6 text-center text-sm font-medium bg-blue-50/30">Priority</td>
                  <td className="p-6 text-center text-sm font-medium">Global Priority</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-bold text-slate-600">Network Hospitals</td>
                  <td className="p-6 text-center text-sm font-medium">5,000+</td>
                  <td className="p-6 text-center text-sm font-medium bg-blue-50/30">10,000+</td>
                  <td className="p-6 text-center text-sm font-medium">All Network</td>
                </tr>
                <tr>
                  <td className="p-6 text-sm font-bold text-slate-600">Accident Cover</td>
                  <td className="p-6 text-center text-sm font-medium">Day 1</td>
                  <td className="p-6 text-center text-sm font-medium bg-blue-50/30">Day 1</td>
                  <td className="p-6 text-center text-sm font-medium">Immediate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans-section" className="px-6 py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Choose Your Emergency Protection Plan</h2>
            <p className="text-slate-500 font-medium italic mb-8">Hand-picked plans with pre-applied filters for your profile.</p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Check className="text-green-500" size={14} /> IRDAI Approved
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Check className="text-green-500" size={14} /> Cashless Claims
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Check className="text-green-500" size={14} /> 24/7 Support
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-[24px] p-6 md:p-8 border-2 transition-all hover:shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-8 ${
                  plan.highlight 
                    ? 'border-blue-600 shadow-lg shadow-blue-100' 
                    : 'border-slate-100 shadow-sm'
                }`}
              >
                {/* Left Side: Insurer logo + plan name */}
                <div className="flex-[1.5] min-w-[280px]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] text-center p-1 leading-tight uppercase shrink-0">
                      {plan.insurer.split(' ')[0]}<br/>Logo
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${plan.highlight ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {plan.badge}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.insurer}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                    </div>
                  </div>
                  
                  {/* Trust Metrics */}
                  <div className="flex gap-4 mb-4">
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Network</p>
                      <p className="text-[10px] font-bold text-slate-700">{plan.network}</p>
                    </div>
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Claims Ratio</p>
                      <p className="text-[10px] font-bold text-slate-700">{plan.claimsRatio}</p>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs font-bold mb-3 flex items-center gap-2">
                    <Shield size={14} className="text-blue-600" /> {plan.tagline}
                  </p>
                  
                  {/* Key Highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.keyHighlights.map((highlight, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-100">
                        • {highlight}
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-400 text-xs italic font-medium border-l-2 border-blue-100 pl-3">{plan.whoIsItFor}</p>
                </div>

                {/* Middle: Key benefits icons (ambulance, hospital bed, family, cashless) */}
                <div className="flex-1 flex flex-wrap gap-x-8 gap-y-6 justify-start md:justify-center border-y md:border-y-0 md:border-x border-slate-100 py-6 md:py-0 px-0 md:px-8">
                  <div className="flex flex-col items-center gap-2 w-20">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                      <Ambulance size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase text-center">Ambulance</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-20">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                      <Bed size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase text-center">Hospital Bed</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-20">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                      <Users size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase text-center">Family</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-20">
                    <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                      <CreditCard size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase text-center">Cashless</span>
                  </div>
                </div>

                {/* Right Side: Price & "Get Covered" button */}
                <div className="w-full md:w-64 flex flex-col items-center md:items-end justify-center gap-3">
                  <div className="text-center md:text-right">
                    <div className="flex items-baseline gap-1 justify-center md:justify-end">
                      <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-slate-400 font-bold text-sm">/mo</span>
                    </div>
                    <div className="bg-blue-50 px-2 py-0.5 rounded-lg inline-block">
                      <span className="text-blue-600 font-black text-[10px] uppercase tracking-tighter">{plan.subPrice}</span>
                    </div>
                  </div>
                  
                  <div className="w-full space-y-2">
                    <button 
                      onClick={() => handleGetCovered(plan.id)}
                      className={`w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
                        plan.highlight 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' 
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      Get Covered <ExternalLink size={16} />
                    </button>
                    <button 
                      onClick={() => setSelectedDetailPlan(plan)}
                      className="w-full py-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors bg-slate-50 rounded-lg"
                    >
                      <Info size={12} /> View Full Coverage Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="mt-12 text-center text-slate-400 text-xs font-medium">
            * Powered by trusted partners. CERS+ generates pre-filtered links to trusted partner marketplaces. Final selection and payment happen on the partner site.
          </p>
        </div>
      </section>

      {/* Integration Explanation for Judges */}
      <section className="px-6 py-24 bg-indigo-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-5 rotate-12">
          <Shield size={400} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
            <Zap size={32} className="text-blue-400" />
          </div>
          <h2 className="text-3xl font-black mb-6">Explain integration to judges</h2>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            “CERS+ does not try to replace big insurance marketplaces like Policybazaar. Instead, we become a smart front layer on top of them.”
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <div className="bg-blue-600/30 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Shield size={20} className="text-blue-300" />
              </div>
              <h4 className="font-bold mb-3 text-xl">Smart Understanding</h4>
              <p className="text-sm text-blue-100/70 leading-relaxed">We understand the user’s emergency risk from CERS+ (location, prior emergencies, family size) and filter and rank the best low-cost emergency plans.</p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <div className="bg-blue-600/30 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <CreditCard size={20} className="text-blue-300" />
              </div>
              <h4 className="font-bold mb-3 text-xl">Familiar UI</h4>
              <p className="text-sm text-blue-100/70 leading-relaxed">Our cards look like familiar insurance listings (logo, cover, price, highlights) so users can understand quickly and trust the selection.</p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <div className="bg-blue-600/30 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <ExternalLink size={20} className="text-blue-300" />
              </div>
              <h4 className="font-bold mb-3 text-xl">Pre-Applied Filters</h4>
              <p className="text-sm text-blue-100/70 leading-relaxed">When they click, we send them to the official marketplace page with all filters pre-applied, so they see only relevant options and complete payment there.</p>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl border border-white/10">
              <div className="bg-blue-600/30 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Zap size={20} className="text-blue-300" />
              </div>
              <h4 className="font-bold mb-3 text-xl">Light & Efficient</h4>
              <p className="text-sm text-blue-100/70 leading-relaxed">This keeps us light (no regulatory burden), adds real value (saving the user’s time and confusion), and still fits perfectly into our emergency response mission.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Buy via CERS+ Section */}
      <section className="px-6 py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-16">Why Buy Insurance Through CERS+?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 group hover:border-blue-200 transition-all">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Users size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Pre-filled details</h3>
                <p className="text-slate-500 text-sm leading-relaxed">We use your existing CERS+ profile so you don’t have to fill long forms.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 group hover:border-blue-200 transition-all">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Zap size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Emergency-focused plans</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Only a few curated plans designed specifically for ambulance and emergency hospitalisation, not 100 confusing options.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 group hover:border-blue-200 transition-all">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Heart size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Lower effort, competitive pricing</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Get equal or lower prices than insurer websites, with a much simpler experience.</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 group hover:border-blue-200 transition-all">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Integrated with your emergencies</h3>
                <p className="text-slate-500 text-sm leading-relaxed">During a real emergency, CERS+ can link your incident to your policy to support claims faster.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-20">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-12 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 z-0"></div>
            
            <div className="flex-1 flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-100 mb-8 border-8 border-white">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Choose a plan</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">We recommend the best low-cost plans for your city and risk profile.</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-100 mb-8 border-8 border-white">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Fill & pay in 2 minutes</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">Most details are pre-filled from CERS+. Complete payment securely.</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center text-center relative z-10">
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-100 mb-8 border-8 border-white">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Stay protected</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">Your policy is linked with CERS+, so coverage is ready when you need it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Details Modal */}
      {selectedDetailPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-10 relative border-b-[12px] border-blue-600">
            <button 
              onClick={() => setSelectedDetailPlan(null)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-3xl text-blue-600">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selectedDetailPlan.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedDetailPlan.insurer}</p>
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-black">Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Hospitals</p>
                <p className="text-sm font-black text-slate-800">{selectedDetailPlan.network}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Claims Settlement</p>
                <p className="text-sm font-black text-slate-800">{selectedDetailPlan.claimsRatio}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Plan Highlights</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedDetailPlan.keyHighlights.map((h: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Check className="text-green-500" size={14} /> {h}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Waiting Periods</h4>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3">
                  <Clock size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedDetailPlan.details.waitingPeriod}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Example Scenario</h4>
                <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                  <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 font-bold leading-relaxed">{selectedDetailPlan.details.scenario}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                  <span className="uppercase tracking-widest block mb-1">Note:</span>
                  Exact coverage depends on the final insurer terms shown on the partner site.
                </p>
              </div>

              <button 
                onClick={() => handleGetCovered(selectedDetailPlan.id)}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
              >
                Proceed to Partner Site <ExternalLink size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Emergency Stories */}
      <section className="px-6 py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Real Stories. Real Protection.</h2>
              <p className="text-slate-400 text-lg">See how CERS+ insurance has supported families in critical moments.</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-3xl font-black text-blue-500">50,000+</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lives Protected</p>
              </div>
              <div className="w-px h-12 bg-white/10"></div>
              <div className="text-right">
                <p className="text-3xl font-black text-blue-500">₹2Cr+</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Claims Assisted</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] hover:bg-white/10 transition-all">
              <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(i => <Sparkles key={i} size={14} className="text-blue-500" />)}
              </div>
              <p className="text-lg font-medium italic mb-8 leading-relaxed">
                "During my father's cardiac arrest, the ambulance arrived in 8 mins. Because we had the Family Shield, we didn't pay a single rupee at the hospital counter."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-black">RK</div>
                <div>
                  <h4 className="font-bold">Rajesh Kumar</h4>
                  <p className="text-xs text-slate-500">Surat, Gujarat</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] hover:bg-white/10 transition-all">
              <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(i => <Sparkles key={i} size={14} className="text-blue-500" />)}
              </div>
              <p className="text-lg font-medium italic mb-8 leading-relaxed">
                "I'm a delivery partner. I got into a road accident last month. CERS+ handled the claim with the insurer directly. Best ₹299 I ever spent."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-black">AS</div>
                <div>
                  <h4 className="font-bold">Amit Sharma</h4>
                  <p className="text-xs text-slate-500">Mumbai, Maharashtra</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] hover:bg-white/10 transition-all">
              <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(i => <Sparkles key={i} size={14} className="text-blue-500" />)}
              </div>
              <p className="text-lg font-medium italic mb-8 leading-relaxed">
                "The 'Smart Filter' actually worked. I clicked 'Get Covered' and my family details were already there on the partner site. Saved me so much time."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-black">PV</div>
                <div>
                  <h4 className="font-bold">Priya Verma</h4>
                  <p className="text-xs text-slate-500">Delhi, NCR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Assistance Workflow */}
      <section className="px-6 py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-20">How CERS+ Assists Your Claim</h2>
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-blue-50 -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
                  <Activity size={32} />
                </div>
                <h4 className="font-black text-lg mb-2">1. SOS Trigger</h4>
                <p className="text-sm text-slate-500">When you raise an SOS, we immediately notify your insurer of a potential claim.</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
                  <Shield size={32} />
                </div>
                <h4 className="font-black text-lg mb-2">2. Verification</h4>
                <p className="text-sm text-slate-500">The hospital receives your digital insurance card automatically via CERS+.</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
                  <CreditCard size={32} />
                </div>
                <h4 className="font-black text-lg mb-2">3. Cashless Entry</h4>
                <p className="text-sm text-slate-500">No deposit needed. The hospital starts treatment immediately based on your cover.</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
                  <Check size={32} />
                </div>
                <h4 className="font-black text-lg mb-2">4. Auto-Settlement</h4>
                <p className="text-sm text-slate-500">We share emergency logs with the insurer to speed up the final bill settlement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-16">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is CERS+ an insurance company?",
                a: "No, CERS+ is an emergency response platform. We partner with IRDAI-regulated insurers to provide you with curated, low-cost emergency plans."
              },
              {
                q: "How does the 'Smart Filter' work?",
                a: "When you click 'Get Covered', we generate a unique link for the partner site (like Policybazaar) that already contains your age, city, and needed plan type. This saves you from re-entering data."
              },
              {
                q: "Can I use this insurance for regular checkups?",
                a: "These specific plans are 'Emergency First'—optimized for ambulance and sudden hospitalisation. For comprehensive OPD/checkup cover, you can explore other plans on the partner site."
              },
              {
                q: "What happens if the hospital is not in the network?",
                a: "You can still use the insurance on a reimbursement basis. CERS+ will provide you with the emergency logs and ambulance receipts to make the claim process smooth."
              }
            ].map((item, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all hover:border-blue-300">
                <summary className="p-6 font-bold text-slate-800 cursor-pointer flex justify-between items-center list-none">
                  {item.q}
                  <div className="bg-slate-100 p-1 rounded-lg group-open:rotate-180 transition-transform">
                    <X size={16} className="rotate-45" />
                  </div>
                </summary>
                <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Partners */}
      <section className="px-6 py-16 text-center">
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by Leading Insurers</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale">
          <div className="font-black text-xl italic tracking-tighter">ICICI Lombard</div>
          <div className="font-black text-xl italic tracking-tighter">HDFC ERGO</div>
          <div className="font-black text-xl italic tracking-tighter">TATA AIG</div>
          <div className="font-black text-xl italic tracking-tighter">Star Health</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-slate-400 text-xs font-bold">
            © 2024 CERS+ Protection. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600">Terms of Service</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600">Claims Process</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InsurancePage;
