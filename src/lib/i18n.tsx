import React from 'react';

/**
 * Bilingual text component - shows English first, Nepali second
 * English is primary, Nepali uses simple everyday wording
 */
export const Bi: React.FC<{
  en: string;
  np: string;
  className?: string;
  npClassName?: string;
  inline?: boolean;
}> = ({ en, np, className = '', npClassName = '', inline = false }) => {
  if (inline) {
    return (
      <span className={className}>
        {en} <span className={`text-gray-500 ${npClassName}`}>({np})</span>
      </span>
    );
  }
  return (
    <span className={className}>
      {en}
      <span className={`block text-[0.85em] opacity-70 ${npClassName}`}>{np}</span>
    </span>
  );
};

/**
 * Simple bilingual text that returns both languages as a string
 */
export const bi = (en: string, np: string): string => `${en} / ${np}`;

/**
 * Bilingual badge/label component
 */
export const BiLabel: React.FC<{
  en: string;
  np: string;
  className?: string;
}> = ({ en, np, className = '' }) => (
  <span className={className}>
    {en} <span className="opacity-60 text-[0.9em]">({np})</span>
  </span>
);

/**
 * Bilingual heading component
 */
export const BiHeading: React.FC<{
  en: string;
  np: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  npClassName?: string;
}> = ({ en, np, as: Tag = 'h2', className = '', npClassName = '' }) => (
  <Tag className={className}>
    {en}
    <span className={`block text-[0.6em] font-medium opacity-60 mt-0.5 ${npClassName}`}>{np}</span>
  </Tag>
);

// ============================================================
// TRANSLATIONS - All user-facing text in English + Nepali
// ============================================================

export const t = {
  // Brand
  brand: { en: 'Gharun Nepal', np: 'घरन नेपाल' },
  tagline: { en: "Jhapa's Trusted Service Coordinator", np: 'झापाको भरोसायोग्य सेवा समन्वयक' },
  motto: { en: 'Your Trusted Partner', np: 'विश्वासको साथी' },

  // Navigation
  nav: {
    home: { en: 'Home', np: 'गृहपृष्ठ' },
    services: { en: 'Services', np: 'सेवाहरू' },
    howItWorks: { en: 'How It Works', np: 'कसरी काम गर्छ' },
    trackRequest: { en: 'Track Request', np: 'अनुरोध ट्र्याक गर्नुहोस्' },
    myDashboard: { en: 'My Dashboard', np: 'मेरो ड्यासबोर्ड' },
    signIn: { en: 'Sign In', np: 'साइन इन' },
    signOut: { en: 'Sign Out', np: 'साइन आउट' },
    backToHome: { en: 'Back to Home', np: 'गृहपृष्ठमा फर्कनुहोस्' },
  },

  // Auth
  auth: {
    whoAreYou: { en: 'Who are you?', np: 'तपाईं को हुनुहुन्छ?' },
    selectRole: { en: 'Select your role to continue', np: 'जारी राख्न आफ्नो भूमिका छान्नुहोस्' },
    iAmClient: { en: 'I am a Client', np: 'म ग्राहक हुँ' },
    clientDesc: { en: 'I need a service (plumber, electrician, delivery, etc.)', np: 'मलाई सेवा चाहिन्छ (प्लम्बर, इलेक्ट्रिसियन, डेलिभरी, आदि)' },
    iAmProvider: { en: 'I am a Service Provider', np: 'म सेवा प्रदायक हुँ' },
    providerDesc: { en: 'I provide services (plumber, electrician, driver, etc.)', np: 'म सेवा दिन्छु (प्लम्बर, इलेक्ट्रिसियन, ड्राइभर, आदि)' },
    signInSignUp: { en: 'Sign In / Sign Up', np: 'साइन इन / साइन अप' },
    chooseMethod: { en: 'Choose how you\'d like to continue', np: 'कसरी अगाडि बढ्ने छान्नुहोस्' },
    continuePhone: { en: 'Continue with Phone', np: 'फोनबाट जारी राख्नुहोस्' },
    otpViaSms: { en: 'OTP verification via SMS', np: 'SMS मार्फत OTP प्रमाणीकरण' },
    continueEmail: { en: 'Continue with Email', np: 'इमेलबाट जारी राख्नुहोस्' },
    emailPassword: { en: 'Email & password login', np: 'इमेल र पासवर्ड लगइन' },
    enterPhone: { en: 'Enter Phone Number', np: 'फोन नम्बर हाल्नुहोस्' },
    sendOtp: { en: "We'll send you a verification code via SMS", np: 'हामी तपाईंलाई SMS मार्फत कोड पठाउँछौं' },
    verifyOtp: { en: 'Verify OTP', np: 'OTP प्रमाणित गर्नुहोस्' },
    enterCode: { en: 'Enter the code sent to', np: 'पठाइएको कोड हाल्नुहोस्' },
    createAccount: { en: 'Create Account', np: 'खाता बनाउनुहोस्' },
    signInEmail: { en: 'Sign In with Email', np: 'इमेलबाट साइन इन गर्नुहोस्' },
    clientAccount: { en: 'Client Account', np: 'ग्राहक खाता' },
    providerAccount: { en: 'Provider Account', np: 'प्रदायक खाता' },
    providerVerifyNote: { en: 'Provider accounts require verification before you can receive jobs. You\'ll be notified once approved.', np: 'प्रदायक खातालाई काम पाउनु अघि प्रमाणीकरण चाहिन्छ। स्वीकृत भएपछि सूचना दिइनेछ।' },
    welcome: { en: 'Welcome!', np: 'स्वागत छ!' },
    redirecting: { en: 'Redirecting to your dashboard...', np: 'तपाईंको ड्यासबोर्डमा जाँदै...' },
    termsAgree: { en: 'By signing in, you agree to our Terms of Service and Privacy Policy', np: 'साइन इन गरेर, तपाईं हाम्रो सेवा सर्तहरू र गोपनीयता नीतिमा सहमत हुनुहुन्छ' },
    alreadyAccount: { en: 'Already have an account? Sign In', np: 'पहिले नै खाता छ? साइन इन गर्नुहोस्' },
    noAccount: { en: "Don't have an account? Sign Up", np: 'खाता छैन? साइन अप गर्नुहोस्' },
    fullName: { en: 'Your full name', np: 'तपाईंको पूरा नाम' },
    password: { en: 'Password (min 6 characters)', np: 'पासवर्ड (कम्तिमा ६ अक्षर)' },
    smsCharges: { en: 'Standard SMS charges may apply', np: 'सामान्य SMS शुल्क लाग्न सक्छ' },
    resendOtp: { en: 'Resend OTP', np: 'OTP पुन: पठाउनुहोस्' },
    sendingOtp: { en: 'Sending OTP...', np: 'OTP पठाउँदै...' },
    verifying: { en: 'Verifying...', np: 'प्रमाणित गर्दै...' },
    creatingAccount: { en: 'Creating Account...', np: 'खाता बनाउँदै...' },
    signingIn: { en: 'Signing In...', np: 'साइन इन गर्दै...' },
  },

  // Hero
  hero: {
    headline: { en: 'Gharun Nepal', np: 'घरन नेपाल' },
    subheadline: { en: 'Your Trusted Partner', np: 'विश्वासको साथी' },
    description: { en: "Jhapa's trusted coordination platform connecting you with verified local service providers through a safe, coordinated system.", np: 'झापाको भरोसायोग्य समन्वय प्लेटफर्म जसले तपाईंलाई प्रमाणित स्थानीय सेवा प्रदायकहरूसँग सुरक्षित रूपमा जोड्छ।' },
    submitRequest: { en: 'Submit a Request', np: 'अनुरोध पेश गर्नुहोस्' },
    browseServices: { en: 'Browse Services', np: 'सेवाहरू हेर्नुहोस्' },
    verifiedProviders: { en: 'Verified Providers', np: 'प्रमाणित प्रदायकहरू' },
    noDirectContact: { en: 'No Direct Contact', np: 'सिधा सम्पर्क छैन' },
    jhapaNepal: { en: 'Jhapa, Nepal', np: 'झापा, नेपाल' },
    jobsCompleted: { en: 'Jobs Completed', np: 'काम सम्पन्न' },
    happyClients: { en: 'Happy Clients', np: 'खुसी ग्राहकहरू' },
    activeRiders: { en: 'Active Riders', np: 'सक्रिय राइडरहरू' },
    verified100: { en: '100% Verified', np: '१००% प्रमाणित' },
    approvedOnly: { en: 'Verified and approved only', np: 'प्रमाणित र स्वीकृत मात्र' },
    readyToServe: { en: 'Ready to serve', np: 'सेवा दिन तयार' },
  },

  // Trust Flow
  trust: {
    architecture: { en: 'Trust Architecture', np: 'विश्वास संरचना' },
    howTrustWorks: { en: 'How Trust Works at Gharun Nepal', np: 'घरन नेपालमा विश्वास कसरी काम गर्छ' },
    noDirectDesc: { en: 'No direct contact between clients and providers. Everything flows through our verified coordination team for your safety.', np: 'ग्राहक र प्रदायकबीच सिधा सम्पर्क छैन। तपाईंको सुरक्षाको लागि सबै कुरा हाम्रो प्रमाणित समन्वय टोलीबाट हुन्छ।' },
    client: { en: 'Client', np: 'ग्राहक' },
    clientDesc: { en: 'Submit your service request through the app. No need to search or negotiate.', np: 'एपमार्फत आफ्नो सेवा अनुरोध पेश गर्नुहोस्। खोज्नु वा मोलमोलाई गर्नु पर्दैन।' },
    gharunConnect: { en: 'Gharun Connect', np: 'घरन कनेक्ट' },
    connectDesc: { en: 'Our coordination team verifies details, confirms pricing, and assigns the right provider.', np: 'हाम्रो समन्वय टोलीले विवरण प्रमाणित गर्छ, मूल्य पुष्टि गर्छ, र सही प्रदायक तोक्छ।' },
    provider: { en: 'Service Provider', np: 'सेवा प्रदायक' },
    providerDesc: { en: 'Verified, skilled professionals execute the job with quality and accountability.', np: 'प्रमाणित, दक्ष पेशेवरहरूले गुणस्तर र जवाफदेहीताका साथ काम गर्छन्।' },
    submitRequest: { en: 'Submit request', np: 'अनुरोध पेश गर्नुहोस्' },
    trackStatus: { en: 'Track status', np: 'स्थिति ट्र्याक गर्नुहोस्' },
    getUpdates: { en: 'Get updates', np: 'अपडेट पाउनुहोस्' },
    verifyDetails: { en: 'Verify details', np: 'विवरण प्रमाणित गर्नुहोस्' },
    confirmPrice: { en: 'Confirm price', np: 'मूल्य पुष्टि गर्नुहोस्' },
    assignProvider: { en: 'Assign provider', np: 'प्रदायक तोक्नुहोस्' },
    receiveJob: { en: 'Receive job', np: 'काम प्राप्त गर्नुहोस्' },
    executeWork: { en: 'Execute work', np: 'काम गर्नुहोस्' },
    completeTask: { en: 'Complete task', np: 'काम सम्पन्न गर्नुहोस्' },
    whyNoContact: { en: 'Why No Direct Contact?', np: 'सिधा सम्पर्क किन छैन?' },
    whyNoContactDesc: { en: "In Nepal's service market, direct contact often leads to pricing disputes, safety concerns, and lack of accountability. Gharun Nepal acts as your trusted coordinator — we verify every provider, negotiate fair prices, and ensure quality work. Your safety and satisfaction are our priority.", np: 'नेपालको सेवा बजारमा सिधा सम्पर्कले प्रायः मूल्य विवाद, सुरक्षा चिन्ता, र जवाफदेहीताको कमी ल्याउँछ। घरन नेपाल तपाईंको भरोसायोग्य समन्वयकको रूपमा काम गर्छ — हामी हरेक प्रदायक प्रमाणित गर्छौं, उचित मूल्य मिलाउँछौं, र गुणस्तरीय काम सुनिश्चित गर्छौं।' },
  },

  // How It Works
  howItWorks: {
    badge: { en: 'Simple 6-Step Process', np: 'सजिलो ६ चरण प्रक्रिया' },
    title: { en: 'How Gharun Nepal Works', np: 'घरन नेपाल कसरी काम गर्छ' },
    subtitle: { en: 'From request to completion — everything is coordinated by our trusted team', np: 'अनुरोधदेखि सम्पन्नसम्म — सबै कुरा हाम्रो भरोसायोग्य टोलीले समन्वय गर्छ' },
    step1: { en: 'Sign In', np: 'साइन इन गर्नुहोस्' },
    step1Desc: { en: 'Login with your phone number (OTP) or email to get started', np: 'सुरु गर्न आफ्नो फोन नम्बर (OTP) वा इमेलबाट लगइन गर्नुहोस्' },
    step2: { en: 'Browse Providers', np: 'प्रदायकहरू हेर्नुहोस्' },
    step2Desc: { en: 'View verified service providers — name, service, and location only', np: 'प्रमाणित सेवा प्रदायकहरू हेर्नुहोस् — नाम, सेवा, र स्थान मात्र' },
    step3: { en: 'Submit Request', np: 'अनुरोध पेश गर्नुहोस्' },
    step3Desc: { en: 'Fill in your service need, location, and preferred timing', np: 'आफ्नो सेवा आवश्यकता, स्थान, र मनपर्ने समय भर्नुहोस्' },
    step4: { en: 'Gharun Connects', np: 'घरन जोड्छ' },
    step4Desc: { en: 'Our team contacts you to confirm details, price, and timing', np: 'हाम्रो टोलीले विवरण, मूल्य, र समय पुष्टि गर्न तपाईंलाई सम्पर्क गर्छ' },
    step5: { en: 'Provider Assigned', np: 'प्रदायक तोकियो' },
    step5Desc: { en: 'We assign the best verified provider for your specific need', np: 'हामी तपाईंको विशेष आवश्यकताको लागि उत्तम प्रमाणित प्रदायक तोक्छौं' },
    step6: { en: 'Job Completed', np: 'काम सम्पन्न' },
    step6Desc: { en: 'Track progress in real-time and get notified when work is done', np: 'वास्तविक समयमा प्रगति ट्र्याक गर्नुहोस् र काम सकिएपछि सूचना पाउनुहोस्' },
  },

  // CTA
  cta: {
    needService: { en: 'Need a Service?', np: 'सेवा चाहिन्छ?' },
    needServiceDesc: { en: 'Submit your request and let Gharun Connect find the perfect verified provider for you. Safe, trusted, and hassle-free.', np: 'आफ्नो अनुरोध पेश गर्नुहोस् र घरन कनेक्टलाई तपाईंको लागि उत्तम प्रमाणित प्रदायक खोज्न दिनुहोस्। सुरक्षित, भरोसायोग्य, र झन्झटमुक्त।' },
    verifiedProviders: { en: '100% verified providers', np: '१००% प्रमाणित प्रदायकहरू' },
    noDirectContact: { en: 'No direct contact needed', np: 'सिधा सम्पर्क आवश्यक छैन' },
    fairPricing: { en: 'Fair pricing guaranteed', np: 'उचित मूल्य ग्यारेन्टी' },
    realTimeTracking: { en: 'Real-time tracking', np: 'वास्तविक समय ट्र्याकिङ' },
    submitRequest: { en: 'Submit a Request', np: 'अनुरोध पेश गर्नुहोस्' },
    areYouProvider: { en: 'Are You a Provider?', np: 'तपाईं प्रदायक हुनुहुन्छ?' },
    providerDesc: { en: "Join Gharun Nepal's verified network. Get steady jobs, fair pay, and build your reputation through our trusted platform.", np: 'घरन नेपालको प्रमाणित नेटवर्कमा सामेल हुनुहोस्। नियमित काम, उचित तलब, र हाम्रो भरोसायोग्य प्लेटफर्ममार्फत आफ्नो प्रतिष्ठा बनाउनुहोस्।' },
    steadyJobs: { en: 'Steady job assignments', np: 'नियमित काम' },
    buildReputation: { en: 'Build trusted reputation', np: 'भरोसायोग्य प्रतिष्ठा बनाउनुहोस्' },
    fairPayment: { en: 'Fair payment terms', np: 'उचित भुक्तानी सर्तहरू' },
    professionalSupport: { en: 'Professional support', np: 'व्यावसायिक सहयोग' },
    registerProvider: { en: 'Register as Provider', np: 'प्रदायकको रूपमा दर्ता गर्नुहोस्' },
  },

  // Testimonials
  testimonials: {
    badge: { en: 'Trusted by Nepalis', np: 'नेपालीहरूले विश्वास गरेको' },
    title: { en: 'What Our Clients Say', np: 'हाम्रा ग्राहकहरू के भन्छन्' },
    subtitle: { en: 'Real stories from real people who trusted Gharun Nepal', np: 'घरन नेपालमाथि विश्वास गर्ने वास्तविक मानिसहरूका वास्तविक कथाहरू' },
  },

  // Footer
  footer: {
    stayUpdated: { en: 'Stay Updated with Gharun Nepal', np: 'घरन नेपालसँग अपडेट रहनुहोस्' },
    getNotified: { en: 'Get notified about new services, providers, and updates in your area.', np: 'तपाईंको क्षेत्रमा नयाँ सेवा, प्रदायक, र अपडेटहरूको बारेमा सूचना पाउनुहोस्।' },
    subscribe: { en: 'Subscribe', np: 'सदस्यता लिनुहोस्' },
    subscribed: { en: 'Subscribed!', np: 'सदस्यता लिइयो!' },
    quickLinks: { en: 'Quick Links', np: 'द्रुत लिंकहरू' },
    forProviders: { en: 'For Providers', np: 'प्रदायकहरूको लागि' },
    contactUs: { en: 'Contact Us', np: 'सम्पर्क गर्नुहोस्' },
    brandDesc: { en: "Nepal's trusted coordination platform connecting clients with verified local service providers through a safe, coordinated system.", np: 'नेपालको भरोसायोग्य समन्वय प्लेटफर्म जसले ग्राहकहरूलाई प्रमाणित स्थानीय सेवा प्रदायकहरूसँग सुरक्षित रूपमा जोड्छ।' },
    providers: { en: 'Providers', np: 'प्रदायकहरू' },
    jobsDone: { en: 'Jobs Done', np: 'काम सम्पन्न' },
    clients: { en: 'Clients', np: 'ग्राहकहरू' },
    home: { en: 'Home', np: 'गृहपृष्ठ' },
    browseServices: { en: 'Browse Services', np: 'सेवाहरू हेर्नुहोस्' },
    howItWorks: { en: 'How It Works', np: 'कसरी काम गर्छ' },
    trackRequest: { en: 'Track Request', np: 'अनुरोध ट्र्याक गर्नुहोस्' },
    submitRequest: { en: 'Submit Request', np: 'अनुरोध पेश गर्नुहोस्' },
    faq: { en: 'FAQ', np: 'बारम्बार सोधिने प्रश्नहरू' },
    registerProvider: { en: 'Register as Provider', np: 'प्रदायकको रूपमा दर्ता' },
    providerPortal: { en: 'Provider Portal', np: 'प्रदायक पोर्टल' },
    becomeRider: { en: 'Become a Rider', np: 'राइडर बन्नुहोस्' },
    verificationProcess: { en: 'Verification Process', np: 'प्रमाणीकरण प्रक्रिया' },
    termsOfService: { en: 'Terms of Service', np: 'सेवा सर्तहरू' },
    privacyPolicy: { en: 'Privacy Policy', np: 'गोपनीयता नीति' },
    allRightsReserved: { en: 'All rights reserved.', np: 'सर्वाधिकार सुरक्षित।' },
    madeInNepal: { en: 'Made with love in Nepal', np: 'नेपालमा प्रेमले बनाइएको' },
    needHelp: { en: 'Need help? Contact Gharun Connect directly:', np: 'सहयोग चाहिन्छ? घरन कनेक्टमा सिधा सम्पर्क गर्नुहोस्:' },
  },

  // Help / Support
  help: {
    needHelp: { en: 'Need help? Call Gharun Connect', np: 'सहयोग चाहिन्छ? घरन कनेक्टमा सम्पर्क गर्नुहोस्' },
    weSpeak: { en: 'We speak English & Nepali', np: 'हामी अंग्रेजी र नेपाली बोल्छौं' },
    callNow: { en: 'Call Now', np: 'अहिले कल गर्नुहोस्' },
    whatsappSupport: { en: 'WhatsApp Support', np: 'व्हाट्सएप सहयोग' },
  },

  // Dashboard - Client
  clientDash: {
    dashboard: { en: 'Dashboard', np: 'ड्यासबोर्ड' },
    submitNewRequest: { en: 'Submit New Request', np: 'नयाँ अनुरोध पेश गर्नुहोस्' },
    myRequests: { en: 'My Requests', np: 'मेरा अनुरोधहरू' },
    trackService: { en: 'Track Service', np: 'सेवा ट्र्याक गर्नुहोस्' },
    messages: { en: 'Messages', np: 'सन्देशहरू' },
    myProfile: { en: 'My Profile', np: 'मेरो प्रोफाइल' },
    welcomeBack: { en: 'Welcome back', np: 'फेरि स्वागत छ' },
    whatServiceNeed: { en: 'What service do you need today?', np: 'आज तपाईंलाई कुन सेवा चाहिन्छ?' },
    requestService: { en: 'Request Service', np: 'सेवा अनुरोध गर्नुहोस्' },
    pending: { en: 'Pending', np: 'पर्खिरहेको' },
    active: { en: 'Active', np: 'सक्रिय' },
    completed: { en: 'Completed', np: 'सम्पन्न' },
    total: { en: 'Total', np: 'जम्मा' },
    recentRequests: { en: 'Recent Requests', np: 'हालका अनुरोधहरू' },
    viewAll: { en: 'View All', np: 'सबै हेर्नुहोस्' },
    noRequestsYet: { en: 'No requests yet', np: 'अहिलेसम्म कुनै अनुरोध छैन' },
    submitFirst: { en: 'Submit your first service request to get started', np: 'सुरु गर्न आफ्नो पहिलो सेवा अनुरोध पेश गर्नुहोस्' },
    newRequest: { en: 'New Request', np: 'नयाँ अनुरोध' },
    submitServiceRequest: { en: 'Submit a service request', np: 'सेवा अनुरोध पेश गर्नुहोस्' },
    checkStatus: { en: 'Check request status', np: 'अनुरोधको स्थिति जाँच गर्नुहोस्' },
    chatGharun: { en: 'Chat with Gharun Connect', np: 'घरन कनेक्टसँग कुरा गर्नुहोस्' },
    safePlatform: { en: 'Safe & Trusted Platform', np: 'सुरक्षित र भरोसायोग्य प्लेटफर्म' },
    safePlatformDesc: { en: 'All service providers are verified by Gharun Nepal. Your contact details are kept private.', np: 'सबै सेवा प्रदायकहरू घरन नेपालद्वारा प्रमाणित छन्। तपाईंको सम्पर्क विवरण गोप्य राखिन्छ।' },
    submitServiceReq: { en: 'Submit Service Request', np: 'सेवा अनुरोध पेश गर्नुहोस्' },
    connectVerified: { en: 'We will connect you with a verified provider', np: 'हामी तपाईंलाई प्रमाणित प्रदायकसँग जोड्नेछौं' },
    serviceCategory: { en: 'Service Category', np: 'सेवा श्रेणी' },
    selectService: { en: 'Select a service...', np: 'सेवा छान्नुहोस्...' },
    location: { en: 'Location (Jhapa area)', np: 'स्थान (झापा क्षेत्र)' },
    description: { en: 'Description', np: 'विवरण' },
    describeNeed: { en: 'Describe what you need...', np: 'तपाईंलाई के चाहिन्छ वर्णन गर्नुहोस्...' },
    preferredDate: { en: 'Preferred Date', np: 'मनपर्ने मिति' },
    preferredTime: { en: 'Preferred Time', np: 'मनपर्ने समय' },
    anytime: { en: 'Anytime', np: 'जुनसुकै समय' },
    morning: { en: 'Morning (6-12)', np: 'बिहान (६-१२)' },
    afternoon: { en: 'Afternoon (12-5)', np: 'दिउँसो (१२-५)' },
    evening: { en: 'Evening (5-9)', np: 'साँझ (५-९)' },
    urgency: { en: 'Urgency', np: 'तत्कालता' },
    normal: { en: 'Normal', np: 'सामान्य' },
    urgent: { en: 'Urgent', np: 'जरुरी' },
    emergency: { en: 'Emergency', np: 'आपतकालीन' },
    connectorNote: { en: 'Gharun Nepal only connects you with verified local providers. Service agreements are between you and the provider. We do not fix prices.', np: 'घरन नेपालले तपाईंलाई प्रमाणित स्थानीय प्रदायकहरूसँग मात्र जोड्छ। सेवा सम्झौता तपाईं र प्रदायकबीच हुन्छ। हामी मूल्य निर्धारण गर्दैनौं।' },
    submitting: { en: 'Submitting...', np: 'पेश गर्दै...' },
    requestSubmitted: { en: 'Request Submitted!', np: 'अनुरोध पेश भयो!' },
    findingProvider: { en: 'We are finding a verified provider for you.', np: 'हामी तपाईंको लागि प्रमाणित प्रदायक खोज्दैछौं।' },
    notifiedOnce: { en: "You'll be notified once a provider is assigned.", np: 'प्रदायक तोकिएपछि तपाईंलाई सूचना दिइनेछ।' },
    all: { en: 'All', np: 'सबै' },
    cancelled: { en: 'Cancelled', np: 'रद्द' },
    noRequestsFound: { en: 'No requests found', np: 'कुनै अनुरोध भेटिएन' },
    noMatchFilter: { en: 'No requests match this filter', np: 'यो फिल्टरसँग कुनै अनुरोध मिलेन' },
    service: { en: 'Service', np: 'सेवा' },
    preferredDateTime: { en: 'Preferred Date/Time', np: 'मनपर्ने मिति/समय' },
    flexible: { en: 'Flexible', np: 'लचिलो' },
    submitted: { en: 'Submitted', np: 'पेश गरिएको' },
    providerAssigned: { en: 'Provider Assigned', np: 'प्रदायक तोकिएको' },
    contactPlatform: { en: 'The provider will contact you through the platform', np: 'प्रदायकले प्लेटफर्ममार्फत तपाईंलाई सम्पर्क गर्नेछ' },
    findingVerified: { en: 'Finding a verified provider for you...', np: 'तपाईंको लागि प्रमाणित प्रदायक खोज्दै...' },
    teamReviewing: { en: 'Our team is reviewing your request', np: 'हाम्रो टोलीले तपाईंको अनुरोध समीक्षा गर्दैछ' },
    trackYourRequest: { en: 'Track Your Request', np: 'आफ्नो अनुरोध ट्र्याक गर्नुहोस्' },
    enterRequestNumber: { en: 'Enter request number', np: 'अनुरोध नम्बर हाल्नुहोस्' },
    requestNotFound: { en: 'Request Not Found', np: 'अनुरोध भेटिएन' },
    checkAndTry: { en: 'Please check the request number and try again.', np: 'कृपया अनुरोध नम्बर जाँच गर्नुहोस् र पुन: प्रयास गर्नुहोस्।' },
    assignedProvider: { en: 'Assigned Provider', np: 'तोकिएको प्रदायक' },
    inAppMessaging: { en: 'In-App Messaging', np: 'एप भित्रको सन्देश' },
    messagingDesc: { en: 'Secure messaging with your service provider will be available soon. Phone numbers are masked for your safety.', np: 'तपाईंको सेवा प्रदायकसँग सुरक्षित सन्देश चाँडै उपलब्ध हुनेछ। तपाईंको सुरक्षाको लागि फोन नम्बरहरू लुकाइएका छन्।' },
    contactViaWhatsapp: { en: 'Contact via WhatsApp', np: 'व्हाट्सएपमार्फत सम्पर्क गर्नुहोस्' },
    email: { en: 'Email', np: 'इमेल' },
    phone: { en: 'Phone', np: 'फोन' },
    accountStatus: { en: 'Account Status', np: 'खाता स्थिति' },
    verified: { en: 'Verified', np: 'प्रमाणित' },
    totalRequests: { en: 'Total Requests', np: 'जम्मा अनुरोधहरू' },
    privacyNote: { en: 'Your phone number and personal details are never shared directly with service providers. All communication goes through Gharun Nepal\'s platform.', np: 'तपाईंको फोन नम्बर र व्यक्तिगत विवरण सेवा प्रदायकहरूसँग सिधा साझा गरिँदैन। सबै सञ्चार घरन नेपालको प्लेटफर्ममार्फत हुन्छ।' },
    clientAccount: { en: 'Client Account', np: 'ग्राहक खाता' },
    notSet: { en: 'Not set', np: 'सेट गरिएको छैन' },
    loadingRequests: { en: 'Loading your requests...', np: 'तपाईंका अनुरोधहरू लोड गर्दै...' },
    totalRequestsCount: { en: 'total requests', np: 'जम्मा अनुरोधहरू' },
    tellUsService: { en: 'Tell us what service you need', np: 'तपाईंलाई कुन सेवा चाहिन्छ भन्नुहोस्' },
    trackServiceStatus: { en: 'Track your service request status', np: 'तपाईंको सेवा अनुरोधको स्थिति ट्र्याक गर्नुहोस्' },
    comingSoon: { en: 'In-app messaging (coming soon)', np: 'एप भित्रको सन्देश (चाँडै आउँदैछ)' },
    manageAccount: { en: 'Manage your account', np: 'आफ्नो खाता व्यवस्थापन गर्नुहोस्' },
  },

  // Dashboard - Provider
  providerDash: {
    providerDashboard: { en: 'Provider Dashboard', np: 'प्रदायक ड्यासबोर्ड' },
    assignedJobs: { en: 'Assigned Jobs', np: 'तोकिएका कामहरू' },
    jobHistory: { en: 'Job History', np: 'काम इतिहास' },
    earnings: { en: 'Earnings', np: 'आम्दानी' },
    myRatings: { en: 'My Ratings', np: 'मेरो रेटिङ' },
    messages: { en: 'Messages', np: 'सन्देशहरू' },
    myProfile: { en: 'My Profile', np: 'मेरो प्रोफाइल' },
    welcome: { en: 'Welcome', np: 'स्वागत छ' },
    yourDashboard: { en: 'Your provider dashboard', np: 'तपाईंको प्रदायक ड्यासबोर्ड' },
    approved: { en: 'Approved', np: 'स्वीकृत' },
    pendingVerification: { en: 'Pending Verification', np: 'प्रमाणीकरण पर्खिरहेको' },
    verificationPending: { en: 'Verification Pending', np: 'प्रमाणीकरण पर्खिरहेको' },
    verificationDesc: { en: 'Your account is being reviewed by the Gharun Nepal team. You\'ll receive jobs once verified.', np: 'तपाईंको खाता घरन नेपाल टोलीले समीक्षा गर्दैछ। प्रमाणित भएपछि तपाईंले काम पाउनुहुनेछ।' },
    pendingJobs: { en: 'Pending Jobs', np: 'पर्खिरहेका कामहरू' },
    activeJobs: { en: 'Active Jobs', np: 'सक्रिय कामहरू' },
    completed: { en: 'Completed', np: 'सम्पन्न' },
    totalEarnings: { en: 'Total Earnings', np: 'जम्मा आम्दानी' },
    noPendingJobs: { en: 'No pending jobs', np: 'कुनै पर्खिरहेको काम छैन' },
    newJobsAppear: { en: 'New jobs will appear here when assigned', np: 'तोकिएपछि नयाँ कामहरू यहाँ देखिनेछन्' },
    providerGuidelines: { en: 'Provider Guidelines', np: 'प्रदायक दिशानिर्देशहरू' },
    guideline1: { en: 'Jobs are assigned by the coordination team only. You cannot take jobs outside the system.', np: 'कामहरू समन्वय टोलीले मात्र तोक्छ। तपाईं प्रणाली बाहिरबाट काम लिन सक्नुहुन्न।' },
    guideline2: { en: 'You cannot see client phone numbers directly. Communication is through the platform.', np: 'तपाईं ग्राहकको फोन नम्बर सिधा देख्न सक्नुहुन्न। सञ्चार प्लेटफर्ममार्फत हुन्छ।' },
    guideline3: { en: 'Pricing is coordinated in MVP. Do not negotiate directly with clients.', np: 'MVP मा मूल्य समन्वय गरिन्छ। ग्राहकहरूसँग सिधा मोलमोलाई नगर्नुहोस्।' },
    guideline4: { en: 'Always update job status promptly for better ratings.', np: 'राम्रो रेटिङको लागि सधैं कामको स्थिति तुरुन्तै अपडेट गर्नुहोस्।' },
    noActiveJobs: { en: 'No active jobs', np: 'कुनै सक्रिय काम छैन' },
    jobsAssignedHere: { en: 'Jobs assigned will appear here', np: 'तोकिएका कामहरू यहाँ देखिनेछन्' },
    serviceType: { en: 'Service Type', np: 'सेवा प्रकार' },
    locationLabel: { en: 'Location', np: 'स्थान' },
    preferredDateTime: { en: 'Preferred Date/Time', np: 'मनपर्ने मिति/समय' },
    clientName: { en: 'Client Name', np: 'ग्राहकको नाम' },
    jobDescription: { en: 'Job Description', np: 'कामको विवरण' },
    maskedNote: { en: 'Client phone number is masked. Contact through platform only. Do not share your personal number.', np: 'ग्राहकको फोन नम्बर लुकाइएको छ। प्लेटफर्ममार्फत मात्र सम्पर्क गर्नुहोस्। आफ्नो व्यक्तिगत नम्बर साझा नगर्नुहोस्।' },
    acceptJob: { en: 'Accept Job', np: 'काम स्वीकार गर्नुहोस्' },
    decline: { en: 'Decline', np: 'अस्वीकार गर्नुहोस्' },
    startWork: { en: 'Start Work', np: 'काम सुरु गर्नुहोस्' },
    markCompleted: { en: 'Mark Completed', np: 'सम्पन्न चिन्ह लगाउनुहोस्' },
    noCompletedJobs: { en: 'No completed jobs yet', np: 'अहिलेसम्म कुनै सम्पन्न काम छैन' },
    completedJobsHere: { en: 'Your completed jobs will appear here', np: 'तपाईंका सम्पन्न कामहरू यहाँ देखिनेछन्' },
    earned: { en: 'Earned', np: 'कमाइएको' },
    completeJobsEarnings: { en: 'Complete jobs to see earnings here', np: 'यहाँ आम्दानी हेर्न कामहरू सम्पन्न गर्नुहोस्' },
    earningsBreakdown: { en: 'Earnings Breakdown', np: 'आम्दानी विवरण' },
    pricingNote: { en: 'Pricing is coordinated by Gharun Nepal in the current version. Commission rates and payment schedules will be communicated separately.', np: 'हालको संस्करणमा मूल्य घरन नेपालले समन्वय गर्छ। कमिशन दर र भुक्तानी तालिका अलग्गै सूचित गरिनेछ।' },
    averageRating: { en: 'Average Rating', np: 'औसत रेटिङ' },
    ratingsAppear: { en: 'Ratings will appear after completing jobs', np: 'कामहरू सम्पन्न गरेपछि रेटिङ देखिनेछ' },
    noReviewsYet: { en: 'No reviews yet', np: 'अहिलेसम्म कुनै समीक्षा छैन' },
    reviewsAppear: { en: 'Customer reviews will appear here after job completion', np: 'काम सम्पन्न भएपछि ग्राहक समीक्षाहरू यहाँ देखिनेछन्' },
    secureMessaging: { en: 'Secure messaging with clients will be available soon. Phone numbers are masked for safety.', np: 'ग्राहकहरूसँग सुरक्षित सन्देश चाँडै उपलब्ध हुनेछ। सुरक्षाको लागि फोन नम्बरहरू लुकाइएका छन्।' },
    contactViaWhatsapp: { en: 'Contact via WhatsApp', np: 'व्हाट्सएपमार्फत सम्पर्क गर्नुहोस्' },
    serviceProvider: { en: 'Service Provider', np: 'सेवा प्रदायक' },
    jobsCompleted: { en: 'Jobs Completed', np: 'काम सम्पन्न' },
    profileChanges: { en: 'To update your profile details, please contact Gharun Nepal. All changes require approval for security.', np: 'प्रोफाइल विवरण अपडेट गर्न, कृपया घरन नेपाललाई सम्पर्क गर्नुहोस्। सुरक्षाको लागि सबै परिवर्तनहरूलाई स्वीकृति चाहिन्छ।' },
    pendingActive: { en: 'pending, active', np: 'पर्खिरहेको, सक्रिय' },
    completedJobsCount: { en: 'completed jobs', np: 'सम्पन्न कामहरू' },
    earningsSummary: { en: 'Your earnings summary', np: 'तपाईंको आम्दानी सारांश' },
    customerFeedback: { en: 'Customer feedback', np: 'ग्राहक प्रतिक्रिया' },
    manageProfile: { en: 'Manage your provider profile', np: 'आफ्नो प्रदायक प्रोफाइल व्यवस्थापन गर्नुहोस्' },
    loadingJobs: { en: 'Loading jobs...', np: 'कामहरू लोड गर्दै...' },
    loadingAssigned: { en: 'Loading assigned jobs...', np: 'तोकिएका कामहरू लोड गर्दै...' },
  },

  // Sidebar
  sidebar: {
    clientPanel: { en: 'Client Panel', np: 'ग्राहक प्यानल' },
    providerPanel: { en: 'Provider Panel', np: 'प्रदायक प्यानल' },
    backToHome: { en: 'Back to Home', np: 'गृहपृष्ठमा फर्कनुहोस्' },
    whatsappSupport: { en: 'WhatsApp Support', np: 'व्हाट्सएप सहयोग' },
    signOut: { en: 'Sign Out', np: 'साइन आउट' },
  },

  // Status labels
  status: {
    submitted: { en: 'Submitted', np: 'पेश गरिएको' },
    confirmed: { en: 'Confirmed', np: 'पुष्टि भएको' },
    assigned: { en: 'Assigned', np: 'तोकिएको' },
    inProgress: { en: 'In Progress', np: 'प्रगतिमा' },
    completed: { en: 'Completed', np: 'सम्पन्न' },
    cancelled: { en: 'Cancelled', np: 'रद्द' },
  },

  // Disclaimer
  disclaimer: {
    connector: { en: 'Gharun Nepal only connects users with local service providers.', np: 'घरन नेपालले प्रयोगकर्ताहरूलाई स्थानीय सेवा प्रदायकहरूसँग मात्र जोड्छ।' },
    agreement: { en: 'Service agreements are between user and provider.', np: 'सेवा सम्झौता प्रयोगकर्ता र प्रदायकबीच हुन्छ।' },
  },

  // Loading
  loading: { en: 'Loading Gharun Nepal...', np: 'घरन नेपाल लोड गर्दै...' },
};
