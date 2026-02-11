import React, { useState, useRef, useEffect, useCallback } from 'react';
import { categories } from '@/data/gharunData';

// ============================================================
// GHARUN AI - Floating Chat Widget (LOCAL ENGINE)
// Bilingual (Nepali first) AI assistant
// NO external API / edge function required
// ============================================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestedCategory?: string | null;
  actions?: { label: string; action: string; data?: string }[];
}

interface GharunAIProps {
  onNavigate: (view: string) => void;
  onRequestService: () => void;
}

// ============ LOCAL AI KNOWLEDGE BASE ============

interface CategoryKeywords {
  id: string;
  keywords: string[];
  keywordsNp: string[];
  clarifyingQuestions: string[];
  safetyWarning?: string;
  response: string;
}

const CATEGORY_KB: CategoryKeywords[] = [
  {
    id: 'plumbing',
    keywords: ['water', 'leak', 'pipe', 'tap', 'faucet', 'drain', 'toilet', 'bathroom', 'sink', 'plumb', 'water heater', 'geyser', 'blocked', 'clog', 'overflow', 'drip'],
    keywordsNp: ['पानी', 'चुहिन', 'चुहावट', 'पाइप', 'ट्याप', 'धारा', 'शौचालय', 'बाथरुम', 'सिंक', 'प्लम्बिङ', 'गिजर', 'ब्लक', 'बन्द'],
    clarifyingQuestions: [
      'कहाँबाट पानी चुहिरहेको छ? बाथरुम, किचन, वा छत?\n(Where is the water leaking from? Bathroom, kitchen, or roof?)',
      'कति समयदेखि यो समस्या छ?\n(How long has this problem been going on?)',
    ],
    response: 'तपाईंको समस्या प्लम्बिङ (Plumbing) सेवा अन्तर्गत पर्छ।\n\nघरन नेपालमा प्रमाणित प्लम्बरहरू उपलब्ध छन् जसले पाइप मर्मत, ट्याप जडान, र पानी सम्बन्धी सबै काम गर्छन्।\n\n(Your issue falls under Plumbing service. Gharun Nepal has verified plumbers who handle pipe repair, tap installation, and all water-related work.)',
  },
  {
    id: 'electrical',
    keywords: ['electric', 'light', 'bulb', 'switch', 'wire', 'wiring', 'power', 'socket', 'plug', 'fan', 'circuit', 'breaker', 'fuse', 'short circuit', 'voltage', 'mcb'],
    keywordsNp: ['बत्ती', 'बिजुली', 'स्विच', 'तार', 'सकेट', 'प्लग', 'पंखा', 'सर्किट', 'फ्युज', 'भोल्टेज', 'विद्युत'],
    clarifyingQuestions: [
      'के पूरै घरको बत्ती गएको हो वा एउटा कोठाको मात्र?\n(Is the entire house without power or just one room?)',
    ],
    safetyWarning: 'बिजुलीको काम आफैं नगर्नुहोस् — यो खतरनाक हुन सक्छ। प्रमाणित इलेक्ट्रिसियनलाई बोलाउनुहोस्।\n(Do NOT attempt electrical work yourself — it can be dangerous. Call a verified electrician.)',
    response: 'तपाईंको समस्या बिजुली (Electrical) सेवा अन्तर्गत पर्छ।\n\n⚠️ सुरक्षा चेतावनी: बिजुलीको काम आफैं नगर्नुहोस्! घरन नेपालका प्रमाणित इलेक्ट्रिसियनले सुरक्षित रूपमा मर्मत गर्नेछन्।\n\n(Your issue falls under Electrical service. Safety Warning: Do NOT attempt electrical work yourself! Gharun Nepal\'s verified electricians will handle it safely.)',
  },
  {
    id: 'cleaning',
    keywords: ['clean', 'cleaning', 'dust', 'dirty', 'wash', 'mop', 'sweep', 'sanitize', 'deep clean', 'office clean', 'house clean'],
    keywordsNp: ['सफाई', 'सफा', 'धुलो', 'फोहोर', 'धुने', 'पुछ्ने', 'बटार्ने'],
    clarifyingQuestions: [
      'कस्तो सफाई चाहिन्छ? घर सफाई, अफिस सफाई, वा डीप क्लिनिङ?\n(What type of cleaning? Home, office, or deep cleaning?)',
      'कति कोठा/क्षेत्रफल सफाई गर्नुपर्छ?\n(How many rooms/area needs cleaning?)',
    ],
    response: 'तपाईंलाई सफाई (Cleaning) सेवा चाहिन्छ।\n\nघरन नेपालमा घर सफाई, अफिस सफाई, र डीप क्लिनिङ सेवा उपलब्ध छ। हाम्रा प्रमाणित सफाइकर्मीहरूले पेशेवर सेवा प्रदान गर्छन्।\n\n(You need Cleaning service. Gharun Nepal offers home cleaning, office cleaning, and deep cleaning through verified professionals.)',
  },
  {
    id: 'painting',
    keywords: ['paint', 'painting', 'color', 'wall', 'interior', 'exterior', 'whitewash', 'putty', 'primer'],
    keywordsNp: ['रंग', 'रंगाई', 'पेन्ट', 'भित्ता', 'पुट्टी'],
    clarifyingQuestions: [
      'भित्री (interior) वा बाहिरी (exterior) रंगाई चाहिन्छ?\n(Interior or exterior painting?)',
    ],
    response: 'तपाईंलाई रंगाई (Painting) सेवा चाहिन्छ।\n\nघरन नेपालमा भित्री र बाहिरी दुवै रंगाई सेवा उपलब्ध छ। प्रमाणित पेन्टरहरूले गुणस्तरीय काम गर्छन्।\n\n(You need Painting service. Both interior and exterior painting available through verified painters.)',
  },
  {
    id: 'carpentry',
    keywords: ['wood', 'furniture', 'door', 'window', 'cabinet', 'shelf', 'table', 'chair', 'carpenter', 'broken furniture', 'fix furniture', 'wardrobe'],
    keywordsNp: ['काठ', 'फर्निचर', 'ढोका', 'झ्याल', 'क्याबिनेट', 'टेबल', 'कुर्सी', 'भाँचिएको', 'मर्मत', 'अलमारी'],
    clarifyingQuestions: [
      'के नयाँ फर्निचर बनाउनुपर्छ वा पुरानो मर्मत गर्नुपर्छ?\n(Do you need new furniture or repair of existing?)',
    ],
    response: 'तपाईंलाई काठको काम (Carpentry) सेवा चाहिन्छ।\n\nघरन नेपालमा फर्निचर मर्मत, ढोका/झ्याल जडान, र काठको सबै काम गर्ने प्रमाणित कारिगरहरू छन्।\n\n(You need Carpentry service. Verified carpenters for furniture repair, door/window installation, and all woodwork.)',
  },
  {
    id: 'appliance',
    keywords: ['ac', 'air conditioner', 'fridge', 'refrigerator', 'washing machine', 'tv', 'television', 'microwave', 'oven', 'appliance', 'repair', 'not working', 'broken'],
    keywordsNp: ['एसी', 'फ्रिज', 'वासिङ मेसिन', 'टिभी', 'माइक्रोवेभ', 'उपकरण', 'मर्मत', 'बिग्रेको', 'चल्दैन'],
    clarifyingQuestions: [
      'कुन उपकरण बिग्रेको छ? (AC, फ्रिज, वासिङ मेसिन, टिभी?)\n(Which appliance is broken? AC, fridge, washing machine, TV?)',
    ],
    response: 'तपाईंलाई उपकरण मर्मत (Appliance Repair) सेवा चाहिन्छ।\n\nघरन नेपालमा AC, फ्रिज, वासिङ मेसिन, टिभी लगायत सबै घरायसी उपकरण मर्मत गर्ने प्रमाणित टेक्निसियनहरू छन्।\n\n(You need Appliance Repair service. Verified technicians for AC, fridge, washing machine, TV and all home appliances.)',
  },
  {
    id: 'delivery',
    keywords: ['delivery', 'deliver', 'send', 'parcel', 'package', 'courier', 'express', 'transport', 'shift', 'move'],
    keywordsNp: ['डेलिभरी', 'पठाउने', 'पार्सल', 'प्याकेज', 'कुरियर', 'सामान', 'ढुवानी'],
    clarifyingQuestions: [
      'के पठाउनुपर्छ? सामान, खाना, वा अन्य?\n(What needs to be delivered? Goods, food, or other?)',
      'कहाँबाट कहाँ पठाउनुपर्छ?\n(From where to where?)',
    ],
    response: 'तपाईंलाई डेलिभरी (Delivery) सेवा चाहिन्छ।\n\nघरन नेपालमा एक्सप्रेस डेलिभरी, कुरियर, र सामान ढुवानी सेवा उपलब्ध छ। झापा जिल्लाभर छिटो र भरपर्दो सेवा।\n\n(You need Delivery service. Express delivery, courier, and transport available across Jhapa district.)',
  },
  {
    id: 'grocery',
    keywords: ['grocery', 'groceries', 'vegetables', 'rice', 'dal', 'oil', 'kitchen', 'daily needs', 'essentials', 'tarkari', 'sabji'],
    keywordsNp: ['किराना', 'तरकारी', 'चामल', 'दाल', 'तेल', 'मसला', 'सामान', 'दैनिक'],
    clarifyingQuestions: [],
    response: 'तपाईंलाई किराना डेलिभरी (Grocery Delivery) सेवा चाहिन्छ।\n\nघरन नेपालले तपाईंको ढोकामा दैनिक आवश्यक सामान पुर्‍याउँछ। तरकारी, चामल, दाल, तेल — सबै एकै ठाउँबाट।\n\n(You need Grocery Delivery. Daily essentials delivered to your door — vegetables, rice, dal, oil — all from one place.)',
  },
  {
    id: 'pharmacy',
    keywords: ['medicine', 'pharmacy', 'drug', 'tablet', 'pill', 'health', 'sick', 'fever', 'cold', 'doctor', 'prescription'],
    keywordsNp: ['औषधी', 'फार्मेसी', 'बिरामी', 'ज्वरो', 'रुघा', 'चिकित्सा', 'डाक्टर'],
    clarifyingQuestions: [],
    response: 'तपाईंलाई औषधी डेलिभरी (Pharmacy Delivery) सेवा चाहिन्छ।\n\nघरन नेपालले प्रमाणित फार्मेसीबाट औषधी तपाईंको घरमा पुर्‍याउँछ। प्रेस्क्रिप्सन आवश्यक भएमा कृपया तयार राख्नुहोस्।\n\n(You need Pharmacy Delivery. Medicines delivered from verified pharmacies. Please keep your prescription ready if needed.)',
  },
  {
    id: 'beauty',
    keywords: ['beauty', 'salon', 'facial', 'makeup', 'hair', 'haircut', 'parlor', 'parlour', 'nail', 'spa', 'bridal'],
    keywordsNp: ['ब्युटी', 'पार्लर', 'फेसियल', 'मेकअप', 'कपाल', 'नेल', 'स्पा'],
    clarifyingQuestions: [
      'कस्तो सेवा चाहिन्छ? फेसियल, हेयरकट, मेकअप, वा अन्य?\n(What service? Facial, haircut, makeup, or other?)',
    ],
    response: 'तपाईंलाई ब्युटी पार्लर (Beauty & Salon) सेवा चाहिन्छ।\n\nघरन नेपालमा घरमै ब्युटी सेवा उपलब्ध छ — फेसियल, हेयरकट, मेकअप सबै प्रमाणित ब्युटिसियनबाट।\n\n(You need Beauty & Salon service. Home beauty services available — facial, haircut, makeup from verified beauticians.)',
  },
  {
    id: 'tutoring',
    keywords: ['tutor', 'tuition', 'teach', 'study', 'class', 'exam', 'school', 'college', 'math', 'science', 'english', 'homework', 'student'],
    keywordsNp: ['ट्युसन', 'पढाउने', 'पढ्ने', 'कक्षा', 'परीक्षा', 'स्कुल', 'कलेज', 'गणित', 'विज्ञान', 'अंग्रेजी'],
    clarifyingQuestions: [
      'कुन कक्षा/विषयको ट्युसन चाहिन्छ?\n(Which class/subject do you need tutoring for?)',
    ],
    response: 'तपाईंलाई ट्युसन (Tutoring) सेवा चाहिन्छ।\n\nघरन नेपालमा सबै कक्षा र विषयका लागि घरमै वा अनलाइन ट्युसन सेवा उपलब्ध छ। प्रमाणित शिक्षकहरूबाट गुणस्तरीय शिक्षा।\n\n(You need Tutoring service. Home or online tutoring available for all grades and subjects from verified teachers.)',
  },
  {
    id: 'computer-repair',
    keywords: ['computer', 'laptop', 'mobile', 'phone', 'screen', 'repair', 'slow', 'virus', 'software', 'hardware', 'format', 'data'],
    keywordsNp: ['कम्प्युटर', 'ल्यापटप', 'मोबाइल', 'फोन', 'स्क्रिन', 'भाइरस', 'सफ्टवेयर'],
    clarifyingQuestions: [
      'कम्प्युटर वा मोबाइल? के समस्या छ?\n(Computer or mobile? What is the problem?)',
    ],
    response: 'तपाईंलाई कम्प्युटर र मोबाइल मर्मत (Computer & Mobile Repair) सेवा चाहिन्छ।\n\nघरन नेपालमा कम्प्युटर, ल्यापटप, र मोबाइल फोन मर्मत गर्ने प्रमाणित टेक्निसियनहरू छन्।\n\n(You need Computer & Mobile Repair service. Verified technicians for computer, laptop, and mobile phone repair.)',
  },
  {
    id: 'pest-control',
    keywords: ['pest', 'insect', 'bug', 'cockroach', 'rat', 'mouse', 'ant', 'termite', 'mosquito', 'fumigation'],
    keywordsNp: ['किरा', 'कीरा', 'झुसिल', 'मुसा', 'कमिला', 'दिमक', 'लामखुट्टे'],
    clarifyingQuestions: [],
    response: 'तपाईंलाई किरा नियन्त्रण (Pest Control) सेवा चाहिन्छ।\n\nघरन नेपालमा किरा नियन्त्रण र फ्युमिगेसन सेवा उपलब्ध छ। सुरक्षित र प्रभावकारी उपचार प्रमाणित विशेषज्ञबाट।\n\n(You need Pest Control service. Safe and effective pest control and fumigation from verified specialists.)',
  },
  {
    id: 'house-shifting',
    keywords: ['shift', 'shifting', 'move', 'moving', 'relocate', 'house shift', 'packing', 'loading', 'unloading'],
    keywordsNp: ['सार्ने', 'घर सार्ने', 'स्थानान्तरण', 'प्याकिङ', 'लोडिङ'],
    clarifyingQuestions: [
      'कहाँबाट कहाँ सार्नुपर्छ? कति सामान छ?\n(From where to where? How much stuff?)',
    ],
    response: 'तपाईंलाई घर सार्ने (House Shifting) सेवा चाहिन्छ।\n\nघरन नेपालमा घर सार्ने, प्याकिङ, लोडिङ/अनलोडिङ सबै सेवा उपलब्ध छ। सुरक्षित र भरपर्दो।\n\n(You need House Shifting service. Packing, loading/unloading, and safe transport available.)',
  },
  {
    id: 'cctv',
    keywords: ['cctv', 'camera', 'security', 'surveillance', 'monitor', 'recording'],
    keywordsNp: ['सीसीटीभी', 'क्यामेरा', 'सुरक्षा', 'निगरानी'],
    clarifyingQuestions: [],
    response: 'तपाईंलाई सीसीटीभी जडान (CCTV Installation) सेवा चाहिन्छ।\n\nघरन नेपालमा CCTV क्यामेरा जडान र सेटअप गर्ने प्रमाणित टेक्निसियनहरू छन्।\n\n(You need CCTV Installation service. Verified technicians for CCTV camera installation and setup.)',
  },
  {
    id: 'internet',
    keywords: ['internet', 'wifi', 'wi-fi', 'network', 'router', 'slow internet', 'no internet', 'connection', 'broadband'],
    keywordsNp: ['इन्टरनेट', 'वाइफाइ', 'नेटवर्क', 'राउटर', 'कनेक्सन'],
    clarifyingQuestions: [],
    response: 'तपाईंलाई इन्टरनेट र वाइफाइ (Internet & WiFi Setup) सेवा चाहिन्छ।\n\nघरन नेपालमा इन्टरनेट जडान, वाइफाइ सेटअप, र ट्रबलशुटिङ गर्ने प्रमाणित टेक्निसियनहरू छन्।\n\n(You need Internet & WiFi Setup service. Verified technicians for internet installation, WiFi setup, and troubleshooting.)',
  },
  {
    id: 'gardening',
    keywords: ['garden', 'plant', 'tree', 'grass', 'lawn', 'landscape', 'flower', 'soil'],
    keywordsNp: ['बगैंचा', 'बिरुवा', 'रुख', 'घाँस', 'फूल', 'माटो'],
    clarifyingQuestions: [],
    response: 'तपाईंलाई बगैंचा र ल्यान्डस्केपिङ (Gardening & Landscaping) सेवा चाहिन्छ।\n\nघरन नेपालमा बगैंचा मर्मत, ल्यान्डस्केपिङ, र बिरुवा हेरचाह गर्ने प्रमाणित माली उपलब्ध छन्।\n\n(You need Gardening & Landscaping service. Verified gardeners for garden maintenance and landscaping.)',
  },
  {
    id: 'daily-helper',
    keywords: ['helper', 'maid', 'domestic', 'household', 'cook', 'cooking', 'daily help', 'nanny', 'caretaker'],
    keywordsNp: ['सहायक', 'दाई', 'दिदी', 'भान्सा', 'खाना', 'हेरचाह', 'दैनिक'],
    clarifyingQuestions: [
      'कस्तो सहायता चाहिन्छ? सफाई, खाना पकाउने, वा अन्य?\n(What help do you need? Cleaning, cooking, or other?)',
    ],
    response: 'तपाईंलाई दैनिक सहायक (Daily Helper) सेवा चाहिन्छ।\n\nघरन नेपालमा दैनिक घरायसी सहायता — सफाई, खाना पकाउने, हेरचाह — सबै प्रमाणित सहायकबाट।\n\n(You need Daily Helper service. Daily household help — cleaning, cooking, caretaking from verified helpers.)',
  },
];

// ============ SAFETY PATTERNS ============
const DANGEROUS_PATTERNS = [
  /gas\s*(leak|line|repair|fix)/i,
  /ग्यास\s*(लिक|मर्मत)/,
  /electric.*yourself/i,
  /diy.*wire/i,
  /how\s*to\s*fix\s*(wire|electric|gas)/i,
  /roof.*climb/i,
  /chemical.*mix/i,
];

const SAFETY_RESPONSE = `⚠️ सुरक्षा चेतावनी!\n\nयो काम आफैं गर्नु खतरनाक हुन सक्छ। कृपया:\n1. बिजुली/ग्यासको काम आफैं नगर्नुहोस्\n2. छतमा एक्लै नचढ्नुहोस्\n3. रासायनिक पदार्थ नमिसाउनुहोस्\n\nघरन नेपालका प्रमाणित सेवा प्रदायकलाई सम्पर्क गर्नुहोस्।\n\n(Safety Warning! This work can be dangerous. Do NOT attempt electrical/gas work, climb roofs alone, or mix chemicals yourself. Contact Gharun Nepal's verified service providers.)\n\nआपतकालीन सम्पर्क: +977-9713242471`;

// ============ GREETING PATTERNS ============
const GREETING_PATTERNS = [
  /^(hi|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|हेलो)/i,
  /^(good\s*(morning|afternoon|evening|night)|शुभ)/i,
  /^(k cha|ke cha|कस्तो|के छ)/i,
];

const GREETING_RESPONSE = `नमस्ते! म घरन AI हुँ 🙏\n\nतपाईंलाई कस्तो सेवा चाहिन्छ? आफ्नो समस्या बताउनुहोस् — म सही सेवा श्रेणी सुझाव दिन्छु र प्रमाणित प्रदायकसँग जोड्छु।\n\n(Namaste! I'm Gharun AI. Tell me what service you need — I'll suggest the right category and connect you with verified providers.)\n\nउदाहरण:\n• "मेरो घरमा पानी चुहिरहेको छ"\n• "बत्ती गएको छ"\n• "घर सफाई चाहिन्छ"\n• "AC मर्मत गर्नुपर्छ"`;

// ============ THANK YOU PATTERNS ============
const THANK_PATTERNS = [
  /^(thank|thanks|dhanyabad|धन्यवाद)/i,
  /^(ok|okay|ठीक|हुन्छ)/i,
];

const THANK_RESPONSE = `धन्यवाद! 🙏\n\nतपाईंलाई अरू कुनै सहयोग चाहिन्छ भने सोध्नुहोस्। सेवा अनुरोध पेश गर्न तलको बटन थिच्नुहोस्।\n\n(Thank you! Ask if you need any other help. Click the button below to submit a service request.)\n\nसम्पर्क: +977-9713242471`;

// ============ HELP / CONFUSED PATTERNS ============
const HELP_PATTERNS = [
  /^(help|how|what|कसरी|के|कस्तो|बुझिन|confus)/i,
  /don.*know/i,
  /not sure/i,
  /थाहा छैन/,
  /बुझिन/,
];

const HELP_RESPONSE = `म तपाईंलाई सहयोग गर्छु! 😊\n\nघरन नेपालमा २६+ सेवा श्रेणीहरू छन्:\n\n🏠 घर मर्मत: प्लम्बिङ, बिजुली, रंगाई, काठको काम\n📦 डेलिभरी: किराना, औषधी, एक्सप्रेस\n💇 व्यक्तिगत: ब्युटी, हजाम, मालिस\n📚 शिक्षा: ट्युसन, कम्प्युटर मर्मत\n🌿 बाहिरी: बगैंचा, दैनिक सहायक\n\nतपाईंको समस्या बताउनुहोस्, म सही सेवा सुझाव दिन्छु!\n\n(Gharun Nepal has 26+ service categories. Tell me your problem and I'll suggest the right service!)`;

// ============ PRICING PATTERNS ============
const PRICE_PATTERNS = [
  /price|cost|rate|charge|कति|मूल्य|दर|शुल्क|पैसा|खर्च/i,
];

const PRICE_RESPONSE = `घरन नेपालले मूल्य निर्धारण गर्दैन — हामी तपाईंलाई प्रमाणित प्रदायकसँग जोड्छौं।\n\nमूल्य कामको प्रकार र दायरा अनुसार फरक हुन्छ। सेवा अनुरोध पेश गरेपछि, एडमिनले अनुमानित लागत सेट गर्नेछन्।\n\nसामान्य मूल्य दायरा हेर्न "Cost Estimator" प्रयोग गर्नुहोस्।\n\n(Gharun Nepal doesn't fix prices — we connect you with verified providers. Prices vary by job type and scope. After submitting a request, admin will set estimated cost.)`;

// ============ LOCAL AI ENGINE ============

function detectCategory(text: string): CategoryKeywords | null {
  const lower = text.toLowerCase();
  
  let bestMatch: CategoryKeywords | null = null;
  let bestScore = 0;

  for (const cat of CATEGORY_KB) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (lower.includes(kw.toLowerCase())) score += 2;
    }
    for (const kw of cat.keywordsNp) {
      if (text.includes(kw)) score += 3; // Nepali keywords get higher weight
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cat;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

function isDangerous(text: string): boolean {
  return DANGEROUS_PATTERNS.some(p => p.test(text));
}

function isGreeting(text: string): boolean {
  return GREETING_PATTERNS.some(p => p.test(text.trim()));
}

function isThankYou(text: string): boolean {
  return THANK_PATTERNS.some(p => p.test(text.trim()));
}

function isHelp(text: string): boolean {
  return HELP_PATTERNS.some(p => p.test(text.trim()));
}

function isPriceQuestion(text: string): boolean {
  return PRICE_PATTERNS.some(p => p.test(text));
}

function generateResponse(text: string, messageCount: number): { content: string; suggestedCategory: string | null; actions?: { label: string; action: string; data?: string }[] } {
  // Safety check first
  if (isDangerous(text)) {
    return { content: SAFETY_RESPONSE, suggestedCategory: null, actions: [{ label: 'सेवा अनुरोध पेश गर्नुहोस्', action: 'request' }] };
  }

  // Greeting
  if (isGreeting(text) && messageCount <= 2) {
    return { content: GREETING_RESPONSE, suggestedCategory: null };
  }

  // Thank you
  if (isThankYou(text)) {
    return { content: THANK_RESPONSE, suggestedCategory: null, actions: [{ label: 'सेवा अनुरोध पेश गर्नुहोस्', action: 'request' }] };
  }

  // Price question
  if (isPriceQuestion(text)) {
    return { content: PRICE_RESPONSE, suggestedCategory: null };
  }

  // Help / confused
  if (isHelp(text) && messageCount <= 3) {
    return { content: HELP_RESPONSE, suggestedCategory: null };
  }

  // Category detection
  const detected = detectCategory(text);
  if (detected) {
    const cat = categories.find(c => c.id === detected.id);
    let response = detected.response;
    
    // Add safety warning if applicable
    if (detected.safetyWarning) {
      response = detected.safetyWarning + '\n\n' + response;
    }

    // Add clarifying question if first interaction about this category
    if (detected.clarifyingQuestions.length > 0 && messageCount <= 4) {
      const randomQ = detected.clarifyingQuestions[Math.floor(Math.random() * detected.clarifyingQuestions.length)];
      response += '\n\n💬 ' + randomQ;
    }

    response += '\n\nसेवा अनुरोध पेश गर्न तलको बटन थिच्नुहोस्।\n(Click the button below to submit a service request.)';

    return {
      content: response,
      suggestedCategory: detected.id,
      actions: [
        { label: `${cat?.nameNp || detected.id} अनुरोध पेश गर्नुहोस्`, action: 'request', data: detected.id },
        { label: 'प्रदायक हेर्नुहोस्', action: 'providers' },
      ],
    };
  }

  // Fallback — couldn't detect category
  return {
    content: `माफ गर्नुहोस्, मैले तपाईंको समस्या पूर्ण रूपमा बुझिन। कृपया अलि विस्तारमा बताउनुहोस्:\n\n• के समस्या छ?\n• कहाँ समस्या छ? (बाथरुम, किचन, कोठा?)\n• कहिलेदेखि यो समस्या छ?\n\n(Sorry, I couldn't fully understand your problem. Please describe in more detail: What's the issue? Where is it? How long has it been?)\n\nवा तलका सामान्य सेवाहरूबाट छान्नुहोस्:\n• प्लम्बिङ (पानी सम्बन्धी)\n• बिजुली (बत्ती/स्विच)\n• सफाई (घर/अफिस)\n• मर्मत (फर्निचर/उपकरण)\n• डेलिभरी (सामान पठाउने)`,
    suggestedCategory: null,
  };
}

// ============ QUICK PROMPTS ============
const QUICK_PROMPTS = [
  { label: 'पानी चुहिरहेको छ', labelEn: 'Water leaking', prompt: 'मेरो घरमा पानी चुहिरहेको छ, के गर्ने?' },
  { label: 'बत्ती गएको छ', labelEn: 'No electricity', prompt: 'मेरो घरमा बत्ती गएको छ, कसरी ठीक गर्ने?' },
  { label: 'सफाई चाहिन्छ', labelEn: 'Need cleaning', prompt: 'मलाई घर सफाई सेवा चाहिन्छ' },
  { label: 'डेलिभरी चाहिन्छ', labelEn: 'Need delivery', prompt: 'मलाई डेलिभरी सेवा चाहिन्छ' },
  { label: 'AC मर्मत', labelEn: 'AC repair', prompt: 'मेरो AC काम गरिरहेको छैन, मर्मत चाहिन्छ' },
  { label: 'फर्निचर मर्मत', labelEn: 'Furniture fix', prompt: 'मेरो फर्निचर भाँचिएको छ, मर्मत गर्नुपर्छ' },
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `नमस्ते! म घरन AI हुँ 🙏\n\nतपाईंको घरायसी समस्यामा सहयोग गर्न तयार छु।\n(Namaste! I'm Gharun AI — ready to help with your home service needs.)\n\nकृपया आफ्नो समस्या बताउनुहोस् — म सही सेवा श्रेणी सुझाव दिन्छु।\n(Tell me your problem — I'll suggest the right service.)`,
  timestamp: new Date(),
};

// ============ MAIN COMPONENT ============
const GharunAI: React.FC<GharunAIProps> = ({ onNavigate, onRequestService }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setShowQuickPrompts(false);

    // Simulate brief "thinking" delay for natural feel
    const delay = 400 + Math.random() * 600;
    setTimeout(() => {
      const messageCount = messages.filter(m => m.role === 'user').length + 1;
      const result = generateResponse(text.trim(), messageCount);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
        suggestedCategory: result.suggestedCategory,
        actions: result.actions,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, delay);
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleAction = (action: string) => {
    if (action === 'request') {
      onRequestService();
    } else if (action === 'providers') {
      onNavigate('providers');
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setShowQuickPrompts(true);
  };

  // Format message content with line breaks
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <>
      {/* ============ FLOATING BUTTON ============ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[60] transition-all duration-300 ease-in-out group ${
          isOpen
            ? 'bottom-[calc(min(75vh,580px)+1.5rem)] right-4 sm:right-6'
            : 'bottom-6 left-6'
        }`}
        aria-label="Gharun AI Assistant"
      >
        <div className={`relative flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? 'w-10 h-10 bg-gray-700 hover:bg-gray-800'
            : 'w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#C8102E] to-[#9B0D23] hover:from-[#D4233F] hover:to-[#B01030] hover:scale-105'
        }`}>
          {isOpen ? (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          )}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-[#C8102E] opacity-30 animate-ping" />
          )}
        </div>
        {!isOpen && (
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            घरन AI सहायक
            <br />
            <span className="text-[10px] text-gray-300">Gharun AI Assistant</span>
          </span>
        )}
      </button>

      {/* ============ CHAT PANEL ============ */}
      <div
        className={`fixed bottom-4 right-4 sm:right-6 z-[55] transition-all duration-300 ease-in-out ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
        style={{ width: 'min(400px, calc(100vw - 2rem))', height: 'min(75vh, 580px)' }}
      >
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          
          {/* ──── HEADER ──── */}
          <div className="bg-gradient-to-r from-[#C8102E] to-[#9B0D23] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm leading-tight">घरन AI</h3>
              <p className="text-white/70 text-[11px] leading-tight">Gharun AI Assistant (Local)</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Online — Local AI" />
              <button
                onClick={clearChat}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Clear chat / च्याट मेटाउनुहोस्"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors sm:hidden"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* ──── SAFETY BANNER ──── */}
          <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5 flex-shrink-0">
            <p className="text-[10px] text-amber-700 leading-tight flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>
                सुरक्षित सहायक — खतरनाक काम गर्ने सल्लाह दिँदैन
                <span className="text-amber-500 ml-1">(Safe — no dangerous DIY advice)</span>
              </span>
            </p>
          </div>

          {/* ──── MESSAGES ──── */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#C8102E] to-[#9B0D23] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">घरन AI</span>
                    </div>
                  )}

                  <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#C8102E] text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
                  }`}>
                    {formatContent(msg.content)}
                  </div>

                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAction(act.action)}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors border ${
                            act.action === 'request'
                              ? 'bg-[#C8102E]/10 hover:bg-[#C8102E]/20 text-[#C8102E] border-[#C8102E]/20'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                          }`}
                        >
                          {act.action === 'request' ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                          )}
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggested category chip (legacy support) */}
                  {msg.suggestedCategory && !msg.actions && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onRequestService()}
                        className="inline-flex items-center gap-1.5 bg-[#C8102E]/10 hover:bg-[#C8102E]/20 text-[#C8102E] text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors border border-[#C8102E]/20"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        सेवा अनुरोध पेश गर्नुहोस्
                      </button>
                    </div>
                  )}

                  <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#C8102E] to-[#9B0D23] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">घरन AI सोच्दैछ...</span>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ──── QUICK PROMPTS ──── */}
          {showQuickPrompts && messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-white flex-shrink-0">
              <p className="text-[10px] text-gray-400 mb-1.5 font-medium">
                सामान्य समस्याहरू (Common problems):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(qp.prompt)}
                    className="inline-flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] px-2.5 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <span>{qp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ──── INPUT ──── */}
          <form onSubmit={handleSubmit} className="px-3 py-2.5 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="समस्या बताउनुहोस्... (Describe your problem...)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/30 focus:border-[#C8102E]/50 transition-all"
                disabled={isTyping}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-[#C8102E] hover:bg-[#A00D24] disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[9px] text-gray-400">
                Powered by Gharun Nepal (Local AI)
              </p>
              <button
                type="button"
                onClick={onRequestService}
                className="text-[10px] text-[#C8102E] hover:text-[#A00D24] font-medium transition-colors"
              >
                सिधै अनुरोध पेश गर्नुहोस् →
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ──── BACKDROP (mobile) ──── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[50] sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default GharunAI;
