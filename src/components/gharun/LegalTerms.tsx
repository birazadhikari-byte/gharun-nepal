import React, { useState } from 'react';
import { ChevronDown, Shield, FileText, HelpCircle, Lock, MessageCircle, ArrowLeft, Briefcase } from 'lucide-react';

const GHARUN_WHATSAPP = '9779713242471';

interface LegalTermsProps {
  initialTab?: 'terms' | 'privacy' | 'faq' | 'provider-terms';
  onBack?: () => void;
}

const LegalTerms: React.FC<LegalTermsProps> = ({ initialTab = 'terms', onBack }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'faq' | 'provider-terms'>(initialTab);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is Gharun Nepal (घरन नेपाल)?',
      a: 'Gharun Nepal is Nepal\'s trusted coordination platform that connects clients with verified local service providers and delivery riders. We act as a trusted middleman — coordinating requests, verifying providers, and ensuring quality service delivery. We do NOT allow direct contact between clients and providers for safety and trust.',
    },
    {
      q: 'How does Gharun Nepal work?',
      a: '1) You submit a service request through our app/website.\n2) Our Gharun Connect team contacts you to confirm details and pricing.\n3) We assign a verified provider to your job.\n4) You receive real-time status updates via WhatsApp and in-app notifications.\n5) The job is completed and you can provide feedback.',
    },
    {
      q: 'Can I directly contact the service provider?',
      a: 'No. For safety and trust, all communication goes through Gharun Connect. This protects both clients and providers. Our coordination team handles all communication between parties.',
    },
    {
      q: 'How are providers verified?',
      a: 'Every provider goes through a manual verification process:\n• Phone number verification via OTP\n• Identity document check\n• Service skill verification\n• Background review by our admin team\n• Only after admin approval do they receive the "Verified" badge.\nThere is NO auto-approval.',
    },
    {
      q: 'What services are available?',
      a: 'We offer 12+ service categories including: Plumbing, Electrical, Cleaning, Painting, Carpentry, Grocery Delivery, Pharmacy, Beauty & Salon, Tutoring, Express Delivery, Appliance Repair, and Gardening. More categories are being added regularly.',
    },
    {
      q: 'How much does it cost?',
      a: 'Service pricing varies based on the type of work, complexity, and provider. After you submit a request, our Gharun Connect team will discuss and confirm the pricing with you BEFORE any work begins. There are no hidden charges.',
    },
    {
      q: 'How do I pay?',
      a: 'Currently, payment is handled directly between you and the provider after job completion. We support cash payment. Digital payment options (eSewa, Khalti, bank transfer) will be added in future updates.',
    },
    {
      q: 'What areas do you serve?',
      a: 'We currently serve Jhapa District including Birtamode, Damak, Bhadrapur, Mechinagar, Kankai, Arjundhara, Gauradaha, and Shivasatakshi. We plan to expand to other major cities in Nepal including Kathmandu, Pokhara, Chitwan, and Biratnagar in the near future.',
    },
    {
      q: 'How do I become a service provider?',
      a: 'Click "Register as Provider" on our website or app. Fill in your details, upload your photo and ID documents, and submit your application. Our admin team will review it within 24-48 hours and contact you for verification.',
    },
    {
      q: 'What if I\'m not satisfied with the service?',
      a: 'Contact Gharun Connect immediately via WhatsApp (+977-9713242471) or through the app. We take all complaints seriously and will:\n• Investigate the issue\n• Mediate between parties\n• Arrange for re-service if needed\n• Take action against the provider if warranted',
    },
    {
      q: 'Is my personal information safe?',
      a: 'Yes. We take data privacy seriously. Your personal information is encrypted and stored securely. We never share your contact details with providers — all communication goes through Gharun Connect. See our Privacy Policy for full details.',
    },
    {
      q: 'How do I contact Gharun Nepal?',
      a: 'You can reach us through:\n• WhatsApp: +977-9713242471\n• Email: support@gharunepal.com\n• Email: info@gharunepal.com\n• In-app contact form\nOur team is available 7 AM - 10 PM Nepal Time, 7 days a week.',
    },
    {
      q: 'Can I cancel a request?',
      a: 'Yes, you can cancel a request before a provider has been assigned. Once a provider is assigned and on the way, cancellation may incur a small fee. Contact Gharun Connect to cancel.',
    },
    {
      q: 'Do you offer emergency services?',
      a: 'Yes! When submitting a request, you can mark it as "Emergency" for urgent needs like plumbing leaks, electrical issues, etc. Emergency requests are prioritized and our team will respond within 30 minutes.',
    },
  ];

  return (
    <section className="py-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#C8102E] font-medium hover:underline mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Legal & Help Center</h1>
          <p className="text-gray-600">Gharun Nepal (घरन नेपाल) - Everything you need to know</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
          {[
            { id: 'terms', label: 'Terms of Service', labelNp: 'सेवा सर्तहरू', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', labelNp: 'गोपनीयता नीति', icon: Lock },
            { id: 'provider-terms', label: 'Provider Agreement', labelNp: 'प्रदायक सम्झौता', icon: Briefcase },
            { id: 'faq', label: 'FAQ', labelNp: 'बारम्बार सोधिने प्रश्नहरू', icon: HelpCircle },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id === 'provider-terms' ? 'Provider' : tab.id === 'faq' ? 'FAQ' : tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* ============================================ */}
        {/* Terms of Service                             */}
        {/* ============================================ */}
        {activeTab === 'terms' && (
          <div className="prose prose-sm max-w-none">
            <div className="bg-[#C8102E]/5 border border-[#C8102E]/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-[#C8102E]" />
                <h2 className="text-lg font-bold text-gray-900 m-0">Terms of Service</h2>
              </div>
              <p className="text-sm text-gray-600 m-0">Last updated: February 10, 2026</p>
            </div>

            <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p>By accessing or using the Gharun Nepal (घरन नेपाल) platform, including our website, mobile application, and related services (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.</p>
                <p>Gharun Nepal is operated by Gharun Nepal Pvt. Ltd., registered in Nepal. These Terms constitute a legally binding agreement between you and Gharun Nepal.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. Platform Description</h3>
                <p>Gharun Nepal is a coordination platform that connects clients with verified service providers and delivery riders in Nepal. The Platform operates through a controlled coordination model where:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Clients submit service requests through the Platform</li>
                  <li>Gharun Connect (our coordination team) manages all communication</li>
                  <li>Verified providers execute the services</li>
                  <li>Direct contact between clients and providers is NOT permitted</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3. User Accounts & Registration</h3>
                <p><strong>3.1 Eligibility:</strong> You must be at least 18 years old and a resident of Nepal to use our Platform.</p>
                <p><strong>3.2 Account Creation:</strong> You may register using your phone number (OTP verification) or email address. You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p><strong>3.3 Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.</p>
                <p><strong>3.4 Account Security:</strong> You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">4. Service Provider Terms</h3>
                <p><strong>4.1 Registration:</strong> Service providers must complete the registration process including identity verification, document submission, and admin approval.</p>
                <p><strong>4.2 Verification:</strong> All providers undergo manual verification by our admin team. There is no auto-approval. The "Verified" badge is granted only after thorough review.</p>
                <p><strong>4.3 Conduct:</strong> Providers must maintain professional conduct, deliver quality services, and follow all instructions from Gharun Connect.</p>
                <p><strong>4.4 No Direct Contact:</strong> Providers must NOT directly contact clients outside of the Gharun Connect coordination system.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">5. Client Terms</h3>
                <p><strong>5.1 Service Requests:</strong> Clients may submit service requests through the Platform. All requests are subject to availability and confirmation by Gharun Connect.</p>
                <p><strong>5.2 Payment:</strong> Payment terms will be communicated by Gharun Connect before service begins. Clients agree to pay the confirmed amount upon service completion.</p>
                <p><strong>5.3 Cancellation:</strong> Requests may be cancelled before provider assignment. Late cancellations may incur fees.</p>
                <p><strong>5.4 No Direct Contact:</strong> Clients must NOT attempt to directly contact providers outside of the Gharun Connect system.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">6. Communication Policy</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Client to Gharun Connect: ALLOWED</li>
                  <li>Gharun Connect to Provider/Rider: ALLOWED</li>
                  <li>Client to Provider/Rider: NOT ALLOWED</li>
                </ul>
                <p>All communication must flow through Gharun Connect to ensure safety, trust, and quality control.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">7. Limitation of Liability</h3>
                <p>Gharun Nepal acts as a coordination platform and is not directly responsible for the quality of services provided by third-party service providers. However, we maintain strict verification standards and will take action on valid complaints.</p>
                <p>To the maximum extent permitted by law, Gharun Nepal shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">8. Dispute Resolution</h3>
                <p>Any disputes arising from the use of our Platform shall first be addressed through our internal complaint resolution process. If unresolved, disputes shall be governed by the laws of Nepal and subject to the jurisdiction of courts in Kathmandu.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">9. Intellectual Property</h3>
                <p>All content, trademarks, logos, and intellectual property on the Platform are owned by Gharun Nepal Pvt. Ltd. You may not use, reproduce, or distribute any content without our written permission.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">10. Modifications</h3>
                <p>We reserve the right to modify these Terms at any time. Changes will be effective upon posting on the Platform. Continued use of the Platform after changes constitutes acceptance of the modified Terms.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">11. Contact Information</h3>
                <p>For any questions about these Terms, please contact us:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>WhatsApp: +977-9713242471</li>
                  <li>Support: support@gharunepal.com</li>
                  <li>Info: info@gharunepal.com</li>
                  <li>Connect: connect@gharunepal.com</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Privacy Policy                               */}
        {/* ============================================ */}
        {activeTab === 'privacy' && (
          <div className="prose prose-sm max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900 m-0">Privacy Policy</h2>
              </div>
              <p className="text-sm text-gray-600 m-0">Last updated: February 10, 2026</p>
            </div>

            <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h3>
                <p><strong>1.1 Personal Information:</strong> Name, phone number, email address, location, and service preferences when you register or submit a request.</p>
                <p><strong>1.2 Provider Information:</strong> In addition to the above, we collect identity documents, service category, experience details, and photos for verification purposes.</p>
                <p><strong>1.3 Usage Data:</strong> We collect information about how you use our Platform, including pages visited, features used, and interaction patterns.</p>
                <p><strong>1.4 Device Information:</strong> Browser type, device type, IP address, and operating system for security and optimization purposes.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>To provide and coordinate services through our Platform</li>
                  <li>To verify provider identities and qualifications</li>
                  <li>To communicate service updates via WhatsApp, SMS, and email</li>
                  <li>To improve our Platform and user experience</li>
                  <li>To resolve disputes and provide customer support</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3. Information Sharing</h3>
                <p><strong>We do NOT share your personal contact information with service providers.</strong> All communication between clients and providers goes through Gharun Connect.</p>
                <p>We may share limited information (name, service location, job description) with assigned providers only to the extent necessary to complete the service.</p>
                <p>We do not sell, rent, or trade your personal information to third parties.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">4. Data Security</h3>
                <p>We implement industry-standard security measures including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encrypted data transmission (SSL/TLS)</li>
                  <li>Secure database storage with access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Phone OTP verification for account access</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">5. Data Retention</h3>
                <p>We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting support@gharunepal.com.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">6. Your Rights</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of marketing communications</li>
                  <li>File a complaint with relevant authorities</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">7. WhatsApp Communication</h3>
                <p>By using our Platform, you consent to receiving service-related notifications via WhatsApp to the phone number you provide. These include request confirmations, status updates, and provider assignments. You may opt out by contacting support.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">8. Contact Us</h3>
                <p>For privacy-related inquiries:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email: support@gharunepal.com</li>
                  <li>WhatsApp: +977-9713242471</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SERVICE PROVIDER TERMS & CONDITIONS (NEPALI) */}
        {/* ============================================ */}
        {activeTab === 'provider-terms' && (
          <div className="prose prose-sm max-w-none">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-green-700" />
                <h2 className="text-lg font-bold text-gray-900 m-0">सेवा प्रदायक सम्झौता / Service Provider Agreement</h2>
              </div>
              <p className="text-sm text-gray-600 m-0">अन्तिम अद्यावधिक: फागुन २७, २०८२ (February 10, 2026)</p>
              <p className="text-xs text-green-700 mt-1 m-0 font-medium">घरन नेपाल प्रा. लि. (Gharun Nepal Pvt. Ltd.) — नेपालमा दर्ता भएको कम्पनी</p>
            </div>

            <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

              {/* Preamble */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="font-semibold text-amber-900 mb-2">महत्त्वपूर्ण सूचना:</p>
                <p className="text-amber-800 m-0">
                  यो सम्झौता घरन नेपाल प्लेटफर्ममा सेवा प्रदायकको रूपमा दर्ता हुने प्रत्येक व्यक्ति वा संस्थाले पालना गर्नुपर्ने नियम, सर्त, र शर्तहरू समेटेको छ। दर्ता प्रक्रिया पूरा गरेर तपाईंले यी सबै सर्तहरूमा सहमति जनाउनुभएको मानिनेछ। कृपया ध्यानपूर्वक पढ्नुहोस्।
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">१</span>
                  परिचय र परिभाषा
                </h3>
                <p><strong>१.१</strong> "घरन नेपाल" भन्नाले घरन नेपाल प्रा. लि. द्वारा सञ्चालित डिजिटल प्लेटफर्म, वेबसाइट, मोबाइल एप, र सम्बन्धित सेवाहरू (सामूहिक रूपमा "प्लेटफर्म") लाई जनाउँछ।</p>
                <p><strong>१.२</strong> "सेवा प्रदायक" भन्नाले घरन नेपाल प्लेटफर्ममा दर्ता भई सेवा प्रदान गर्ने व्यक्ति वा संस्था (तपाईं) लाई जनाउँछ।</p>
                <p><strong>१.३</strong> "ग्राहक" भन्नाले प्लेटफर्म मार्फत सेवा अनुरोध गर्ने व्यक्ति वा संस्थालाई जनाउँछ।</p>
                <p><strong>१.४</strong> "घरन कनेक्ट" भन्नाले घरन नेपालको समन्वय टोलीलाई जनाउँछ जसले ग्राहक र सेवा प्रदायक बीचको सम्पूर्ण सञ्चार व्यवस्थापन गर्छ।</p>
                <p><strong>१.५</strong> "एडमिन" भन्नाले घरन नेपालको आन्तरिक प्रशासनिक टोलीलाई जनाउँछ जसले प्रदायक प्रमाणीकरण, अनुरोध व्यवस्थापन, र प्लेटफर्म सञ्चालन गर्छ।</p>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">२</span>
                  दर्ता र प्रमाणीकरण
                </h3>
                <p><strong>२.१ दर्ता प्रक्रिया:</strong> सेवा प्रदायकले निम्न जानकारी अनिवार्य रूपमा प्रदान गर्नुपर्छ:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>पूरा नाम र सम्पर्क नम्बर (फोन नम्बर OTP मार्फत प्रमाणित)</li>
                  <li>स्थायी ठेगाना र हालको बसोबास ठेगाना</li>
                  <li>नागरिकता प्रमाणपत्र वा सरकारी परिचयपत्रको प्रतिलिपि</li>
                  <li>हालसालै खिचिएको पासपोर्ट साइजको फोटो</li>
                  <li>सेवा श्रेणी र अनुभवको विवरण</li>
                  <li>सम्बन्धित सीप वा तालिम प्रमाणपत्र (भएमा)</li>
                </ul>
                <p><strong>२.२ प्रमाणीकरण:</strong> सबै दर्ता एडमिन टोलीले म्यानुअल रूपमा जाँच गर्छ। कुनै पनि स्वचालित स्वीकृति (auto-approval) हुँदैन। "प्रमाणित" (Verified) ब्याज एडमिन स्वीकृति पछि मात्र प्रदान गरिन्छ।</p>
                <p><strong>२.३ अस्वीकृति:</strong> घरन नेपालले कुनै पनि कारण नदिई दर्ता अस्वीकार गर्ने अधिकार राख्छ। अस्वीकृत आवेदकले ३० दिनपछि पुनः आवेदन दिन सक्छन्।</p>
                <p><strong>२.४ जानकारीको सत्यता:</strong> प्रदान गरिएको सबै जानकारी सत्य, सही, र पूर्ण हुनुपर्छ। झुटो जानकारी दिएमा तत्काल खाता निलम्बन र कानुनी कारबाही हुन सक्छ।</p>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">३</span>
                  सेवा जिम्मेवारी र आचरण
                </h3>
                <p><strong>३.१ सेवाको गुणस्तर:</strong> सेवा प्रदायकले सधैं उच्च गुणस्तरको, व्यावसायिक, र विश्वसनीय सेवा प्रदान गर्नुपर्छ।</p>
                <p><strong>३.२ समयमा उपस्थिति:</strong> तोकिएको समयमा सेवा स्थलमा उपस्थित हुनुपर्छ। ढिलाइ वा अनुपस्थितिको अग्रिम सूचना घरन कनेक्टलाई दिनुपर्छ।</p>
                <p><strong>३.३ व्यावसायिक आचरण:</strong> सेवा प्रदायकले:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>ग्राहकसँग शिष्ट र सम्मानजनक व्यवहार गर्नुपर्छ</li>
                  <li>स्वच्छ र उचित पोशाकमा सेवा दिनुपर्छ</li>
                  <li>मादक पदार्थ सेवन गरेर काममा आउनु हुँदैन</li>
                  <li>ग्राहकको सम्पत्तिको सम्मान गर्नुपर्छ</li>
                  <li>काम पूरा भएपछि सेवा स्थल सफा राख्नुपर्छ</li>
                </ul>
                <p><strong>३.४ सेवा पूर्णता:</strong> स्वीकार गरेको काम पूरा गर्नुपर्छ। बीचमा छोड्नु वा अपूर्ण काम गर्नु गम्भीर उल्लङ्घन मानिनेछ।</p>
                <p><strong>३.५ सुरक्षा:</strong> सेवा प्रदायकले आफ्नो र ग्राहकको सुरक्षाको पूर्ण ध्यान राख्नुपर्छ। आवश्यक सुरक्षा उपकरण प्रयोग गर्नुपर्छ।</p>
              </div>

              {/* Section 4 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">४</span>
                  भुक्तानी र मूल्य निर्धारण
                </h3>
                <p><strong>४.१ मूल्य निर्धारण:</strong> सेवाको मूल्य घरन कनेक्ट टोलीसँगको परामर्शमा निर्धारण गरिन्छ। सेवा प्रदायकले एकपक्षीय रूपमा मूल्य बढाउन पाउँदैन।</p>
                <p><strong>४.२ अनुमानित र अन्तिम लागत:</strong> काम सुरु गर्नुअघि अनुमानित लागत (estimated cost) ग्राहकलाई जानकारी गराइन्छ। काम सकिएपछि अन्तिम लागत (final cost) निर्धारण गरिन्छ।</p>
                <p><strong>४.३ भुक्तानी विधि:</strong> हाल नगद भुक्तानी (cash payment) लागू छ। भविष्यमा eSewa, Khalti, बैंक ट्रान्सफर जस्ता डिजिटल भुक्तानी विकल्पहरू थपिनेछन्।</p>
                <p><strong>४.४ प्लेटफर्म शुल्क:</strong> घरन नेपालले सेवा समन्वय शुल्क लिन सक्छ। यो शुल्कको दर पहिले नै सूचित गरिनेछ र समय-समयमा परिवर्तन हुन सक्छ।</p>
                <p><strong>४.५ अतिरिक्त शुल्क:</strong> ग्राहकलाई पूर्व सूचना नदिई कुनै पनि अतिरिक्त शुल्क लगाउन पाइँदैन। सबै अतिरिक्त लागत घरन कनेक्ट मार्फत स्वीकृत हुनुपर्छ।</p>
              </div>

              {/* Section 5 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">५</span>
                  प्लेटफर्मको भूमिका र सीमा
                </h3>
                <p><strong>५.१ समन्वयकर्ता:</strong> घरन नेपाल एक समन्वय प्लेटफर्म हो। हामी ग्राहक र सेवा प्रदायक बीचको सम्पर्क सहज बनाउँछौं तर सेवा प्रदायकको रोजगारदाता होइनौं।</p>
                <p><strong>५.२ स्वतन्त्र ठेकेदार:</strong> सेवा प्रदायक घरन नेपालको कर्मचारी होइन। तपाईं स्वतन्त्र ठेकेदार (independent contractor) को रूपमा काम गर्नुहुन्छ।</p>
                <p><strong>५.३ कुनै ग्यारेन्टी छैन:</strong> घरन नेपालले निश्चित संख्यामा काम वा आम्दानीको ग्यारेन्टी दिँदैन। काम उपलब्धता माग र क्षेत्रमा निर्भर हुन्छ।</p>
                <p><strong>५.४ सिधा सम्पर्क निषेध:</strong> सेवा प्रदायकले ग्राहकसँग घरन कनेक्ट बाहिर सिधा सम्पर्क गर्न पाउँदैन। यो नियम उल्लङ्घन गर्दा तत्काल खाता निलम्बन हुनेछ।</p>
              </div>

              {/* Section 6 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">६</span>
                  सञ्चार नीति
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">सञ्चार प्रवाह:</p>
                  <ul className="list-none space-y-2 pl-0">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                      <span>ग्राहक → घरन कनेक्ट: <strong className="text-green-700">अनुमति छ</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                      <span>घरन कनेक्ट → सेवा प्रदायक: <strong className="text-green-700">अनुमति छ</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      <span>ग्राहक → सेवा प्रदायक (सिधा): <strong className="text-red-700">अनुमति छैन</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      <span>सेवा प्रदायक → ग्राहक (सिधा): <strong className="text-red-700">अनुमति छैन</strong></span>
                    </li>
                  </ul>
                </div>
                <p className="mt-3">सबै सञ्चार घरन कनेक्ट मार्फत हुनुपर्छ। यसले दुवै पक्षको सुरक्षा र विश्वास सुनिश्चित गर्छ।</p>
              </div>

              {/* Section 7 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">७</span>
                  गोपनीयता र डाटा संरक्षण
                </h3>
                <p><strong>७.१ व्यक्तिगत जानकारी:</strong> तपाईंले प्रदान गर्नुभएको व्यक्तिगत जानकारी सुरक्षित रूपमा भण्डारण गरिन्छ र गोपनीयता नीति अनुसार प्रयोग गरिन्छ।</p>
                <p><strong>७.२ ग्राहक जानकारी:</strong> सेवा प्रदायकले ग्राहकको व्यक्तिगत जानकारी (फोन नम्बर, ठेगाना, आदि) अरूसँग साझा गर्न, बचत गर्न, वा दुरुपयोग गर्न पाउँदैन।</p>
                <p><strong>७.३ डाटा प्रयोग:</strong> घरन नेपालले तपाईंको जानकारी निम्न उद्देश्यका लागि प्रयोग गर्छ:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>सेवा समन्वय र प्रबन्धन</li>
                  <li>प्रमाणीकरण र गुणस्तर नियन्त्रण</li>
                  <li>भुक्तानी प्रशोधन</li>
                  <li>विवाद समाधान</li>
                  <li>प्लेटफर्म सुधार</li>
                </ul>
                <p><strong>७.४ डाटा सुरक्षा:</strong> हामी SSL/TLS इन्क्रिप्सन, सुरक्षित डाटाबेस, र नियमित सुरक्षा अडिट प्रयोग गर्छौं।</p>
              </div>

              {/* Section 8 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">८</span>
                  दुरुपयोग र धोखाधडी निवारण
                </h3>
                <p><strong>८.१ निषिद्ध कार्यहरू:</strong> निम्न कार्यहरू कडा रूपमा निषेधित छन्:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>झुटो परिचय वा कागजात प्रयोग गर्ने</li>
                  <li>ग्राहकसँग सिधा सम्पर्क गरी प्लेटफर्म बाहिर काम गर्ने</li>
                  <li>ग्राहकलाई धम्की, दुर्व्यवहार, वा उत्पीडन गर्ने</li>
                  <li>अनधिकृत रूपमा अतिरिक्त शुल्क लगाउने</li>
                  <li>अर्को प्रदायकको नाममा काम गर्ने वा खाता साझा गर्ने</li>
                  <li>ग्राहकको सम्पत्ति चोरी वा क्षति गर्ने</li>
                  <li>नक्कली समीक्षा वा मूल्याङ्कन गर्ने/गराउने</li>
                  <li>प्लेटफर्मको प्रणालीमा हस्तक्षेप वा ह्याकिङ गर्ने</li>
                </ul>
                <p><strong>८.२ कारबाही:</strong> दुरुपयोग पत्ता लागेमा घरन नेपालले निम्न कारबाही गर्न सक्छ:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>चेतावनी जारी गर्ने</li>
                  <li>अस्थायी खाता निलम्बन (suspension)</li>
                  <li>स्थायी खाता बन्द (permanent ban)</li>
                  <li>नेपाल प्रहरीमा उजुरी दर्ता गर्ने</li>
                  <li>कानुनी कारबाही सुरु गर्ने</li>
                </ul>
              </div>

              {/* Section 9 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">९</span>
                  खाता निलम्बन र समाप्ति
                </h3>
                <p><strong>९.१ निलम्बनका आधारहरू:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>यस सम्झौताका सर्तहरू उल्लङ्घन गरेमा</li>
                  <li>ग्राहकबाट बारम्बार गुनासो प्राप्त भएमा</li>
                  <li>सेवाको गुणस्तर न्यून भएमा</li>
                  <li>धोखाधडी वा दुरुपयोगको शंका भएमा</li>
                  <li>लामो समय (६० दिनभन्दा बढी) निष्क्रिय भएमा</li>
                </ul>
                <p><strong>९.२ स्वैच्छिक समाप्ति:</strong> सेवा प्रदायकले कुनै पनि समयमा घरन कनेक्ट मार्फत आफ्नो खाता बन्द गर्न अनुरोध गर्न सक्छन्। चलिरहेको काम पूरा गरेपछि मात्र खाता बन्द गरिनेछ।</p>
                <p><strong>९.३ घरन नेपालको अधिकार:</strong> घरन नेपालले कुनै पनि समयमा, कारण सहित वा बिना कारण, सेवा प्रदायकको खाता निलम्बन वा समाप्त गर्ने अधिकार राख्छ।</p>
                <p><strong>९.४ समाप्तिको प्रभाव:</strong> खाता समाप्त भएपछि:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>प्लेटफर्ममा पहुँच तत्काल बन्द हुनेछ</li>
                  <li>बाँकी भुक्तानी (यदि कुनै छ भने) ३० दिनभित्र प्रशोधन गरिनेछ</li>
                  <li>व्यक्तिगत डाटा गोपनीयता नीति अनुसार व्यवस्थापन गरिनेछ</li>
                </ul>
              </div>

              {/* Section 10 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">१०</span>
                  उत्तरदायित्वको सीमा
                </h3>
                <p><strong>१०.१</strong> घरन नेपाल एक समन्वय प्लेटफर्म हो र सेवा प्रदायकले प्रदान गर्ने सेवाको गुणस्तर, सुरक्षा, वा परिणामको लागि प्रत्यक्ष रूपमा जिम्मेवार छैन।</p>
                <p><strong>१०.२</strong> सेवा प्रदायकले आफ्नो सेवाबाट हुने कुनै पनि क्षति, हानि, वा दुर्घटनाको पूर्ण जिम्मेवारी लिनुपर्छ।</p>
                <p><strong>१०.३</strong> सेवा प्रदायकले आफ्नो कर दायित्व (tax obligations) आफैं पूरा गर्नुपर्छ। घरन नेपालले कर कटौती वा भुक्तानी गर्दैन।</p>
                <p><strong>१०.४</strong> नेपालको कानुनले अनुमति दिएको अधिकतम सीमासम्म, घरन नेपाल कुनै पनि अप्रत्यक्ष, आकस्मिक, विशेष, वा दण्डात्मक क्षतिपूर्तिको लागि उत्तरदायी हुनेछैन।</p>
              </div>

              {/* Section 11 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">११</span>
                  विवाद समाधान
                </h3>
                <p><strong>११.१</strong> कुनै पनि विवाद पहिले घरन नेपालको आन्तरिक गुनासो समाधान प्रक्रिया मार्फत समाधान गर्ने प्रयास गरिनेछ।</p>
                <p><strong>११.२</strong> आन्तरिक प्रक्रियाबाट समाधान नभएमा, मध्यस्थता (mediation) मार्फत समाधान खोजिनेछ।</p>
                <p><strong>११.३</strong> मध्यस्थताबाट पनि समाधान नभएमा, नेपालको प्रचलित कानुन अनुसार अदालतमा मुद्दा दायर गर्न सकिनेछ।</p>
              </div>

              {/* Section 12 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">१२</span>
                  कानुनी क्षेत्राधिकार
                </h3>
                <p><strong>१२.१</strong> यो सम्झौता नेपालको प्रचलित कानुन अनुसार व्याख्या र लागू गरिनेछ।</p>
                <p><strong>१२.२</strong> यस सम्झौतासँग सम्बन्धित कुनै पनि कानुनी विवादमा काठमाडौं जिल्ला अदालतको क्षेत्राधिकार लागू हुनेछ।</p>
                <p><strong>१२.३</strong> नेपालको इलेक्ट्रोनिक कारोबार ऐन, २०६३ र सम्बन्धित नियमावलीहरू यस सम्झौतामा लागू हुनेछन्।</p>
                <p><strong>१२.४</strong> उपभोक्ता संरक्षण ऐन, २०७५ अनुसारका ग्राहक अधिकारहरू यस सम्झौताले सीमित गर्दैन।</p>
              </div>

              {/* Section 13 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">१३</span>
                  बौद्धिक सम्पत्ति
                </h3>
                <p><strong>१३.१</strong> घरन नेपालको नाम, लोगो, ट्रेडमार्क, र प्लेटफर्मको सम्पूर्ण सामग्री घरन नेपाल प्रा. लि. को सम्पत्ति हो।</p>
                <p><strong>१३.२</strong> सेवा प्रदायकले घरन नेपालको नाम वा लोगो लिखित अनुमति बिना प्रयोग गर्न पाउँदैन।</p>
                <p><strong>१३.३</strong> प्लेटफर्मको कुनै पनि सामग्री प्रतिलिपि, वितरण, वा पुनरुत्पादन गर्न निषेधित छ।</p>
              </div>

              {/* Section 14 */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">१४</span>
                  सम्झौता संशोधन
                </h3>
                <p><strong>१४.१</strong> घरन नेपालले कुनै पनि समयमा यो सम्झौता संशोधन गर्ने अधिकार राख्छ।</p>
                <p><strong>१४.२</strong> संशोधनहरू प्लेटफर्ममा प्रकाशित भएपछि लागू हुनेछन्।</p>
                <p><strong>१४.३</strong> संशोधन पछि प्लेटफर्मको निरन्तर प्रयोगले संशोधित सर्तहरूमा सहमति जनाएको मानिनेछ।</p>
                <p><strong>१४.४</strong> महत्त्वपूर्ण परिवर्तनहरूको सूचना WhatsApp वा इमेल मार्फत पठाइनेछ।</p>
              </div>

              {/* Section 15 - Acceptance */}
              <div className="bg-gradient-to-br from-[#C8102E]/5 to-red-50 border-2 border-[#C8102E]/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#C8102E] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">१५</span>
                  स्वीकृति खण्ड
                </h3>
                <div className="bg-white rounded-xl p-5 border border-[#C8102E]/10">
                  <p className="font-semibold text-gray-900 mb-3">घरन नेपाल प्लेटफर्ममा सेवा प्रदायकको रूपमा दर्ता गरेर, म पुष्टि गर्छु कि:</p>
                  <ul className="space-y-2 pl-0 list-none">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span>मैले यो सम्पूर्ण सम्झौता पढेको छु र बुझेको छु।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span>मैले प्रदान गरेको सबै जानकारी सत्य र सही छ।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span>म यस सम्झौताका सबै सर्त र शर्तहरू पालना गर्न सहमत छु।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span>म कम्तीमा १८ वर्ष पूरा भएको नेपाली नागरिक हुँ।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span>मलाई थाहा छ कि यो सम्झौता उल्लङ्घन गर्दा खाता निलम्बन वा कानुनी कारबाही हुन सक्छ।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span>म घरन नेपालको गोपनीयता नीति र सेवा सर्तहरूमा पनि सहमत छु।</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-3">सम्पर्क जानकारी</h3>
                <p className="mb-2">यस सम्झौताबारे कुनै प्रश्न भएमा सम्पर्क गर्नुहोस्:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>WhatsApp:</strong> +977-9713242471</li>
                  <li><strong>इमेल:</strong> support@gharunepal.com</li>
                  <li><strong>इमेल:</strong> info@gharunepal.com</li>
                  <li><strong>समन्वय:</strong> connect@gharunepal.com</li>
                </ul>
                <p className="mt-2 text-xs text-gray-500">सेवा समय: बिहान ७:०० — राति १०:०० (नेपाल समय), हप्ताको ७ दिन</p>
              </div>

              {/* Footer note */}
              <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                <p>घरन नेपाल प्रा. लि. — नेपालमा दर्ता भएको कम्पनी</p>
                <p>Gharun Nepal Pvt. Ltd. — Registered in Nepal</p>
                <p className="mt-1">यो सम्झौता फागुन २७, २०८२ (February 10, 2026) देखि लागू हुनेछ।</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* FAQ                                          */}
        {/* ============================================ */}
        {activeTab === 'faq' && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <p className="text-sm text-gray-600">{faqs.length} questions answered to help you get started</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left">
                    <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                      <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Still have questions */}
            <div className="mt-8 bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] rounded-2xl p-8 text-center text-white">
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I have a question about Gharun Nepal.')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp: +977-9713242471
                </a>
                <a href="mailto:support@gharunepal.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors">
                  Email: support@gharunepal.com
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LegalTerms;
