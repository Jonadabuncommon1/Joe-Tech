import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../../store/AppContext';
import { ArrowLeft } from 'lucide-react';

export const PrivacyView = ({ onBack }: { onBack?: () => void }) => {
  const { setCurrentView } = useAppContext();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 font-footer">

      {/* Hero Banner */}
      <div className="relative w-full bg-[#3626a7] flex flex-col items-center justify-center text-center px-4 py-20 mb-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 mb-8"
        >
          <img
            src="/logo-mark.png"
            alt="Joe Tech"
            className="w-40 md:w-48 h-auto mx-auto drop-shadow-2xl"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/80 text-xs font-bold uppercase tracking-widest mb-4 relative z-10"
        >
          Legal
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-5xl font-serif text-white tracking-tight font-bold relative z-10"
        >
          Privacy Policy
        </motion.h1>
      </div>

      <div className="pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <button
          onClick={() => { 
            if (onBack) onBack(); 
            else { setCurrentView('home'); window.scrollTo(0, 0); }
          }}
          className="flex items-center space-x-2 text-sm font-semibold brand-text hover:text-[#281c7d] dark:hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>{onBack ? 'Back' : 'Back to Home'}</span>
        </button>

        {/* Header */}
        <div className="border-b-2 border-[#3626a7] pb-8 mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-gray-800 dark:text-white mb-3">
            Privacy Policy
          </h1>
          <p className="brand-text font-semibold text-sm uppercase tracking-widest">
            Joe Tech
          </p>
          <p className="text-gray-500 dark:text-gray-800 dark:text-white text-sm mt-2">Effective Date: 20 May 2026</p>
        </div>

        {/* Intro */}
        <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-4 text-base">
          Joe Tech ("Company", "We", "Us", or "Our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website, contact us, or purchase products and services from us.
        </p>
        <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-10 text-base">
          By using our services, you agree to the terms of this Privacy Policy.
        </p>

        <div className="space-y-12">

          {/* Section 1 */}
          <Section num="1" title="INFORMATION WE COLLECT">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-4">We may collect the following types of personal information:</p>
            <SubSection title="1.1 Personal Identification Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>Full name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Residential or delivery address</li>
                <li>Billing information</li>
              </ul>
            </SubSection>
            <SubSection title="1.2 Transaction Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>Order history</li>
                <li>Payment details</li>
                <li>Delivery and collection records</li>
                <li>Purchase preferences</li>
              </ul>
            </SubSection>
            <SubSection title="1.3 Technical Information">
              <p className="mb-2">When you use our website, we may automatically collect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device information</li>
                <li>Website usage data</li>
                <li>Cookies and analytics data</li>
              </ul>
            </SubSection>
          </Section>

          {/* Section 2 */}
          <Section num="2" title="HOW WE USE YOUR INFORMATION">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-3">We use your information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-800 dark:text-white">
              <li>Processing and fulfilling orders</li>
              <li>Delivering goods and services</li>
              <li>Providing customer support</li>
              <li>Verifying payments and preventing fraud</li>
              <li>Improving our products, services, and website experience</li>
              <li>Sending order updates and important notifications</li>
              <li>Complying with legal and regulatory obligations</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mt-4 font-semibold">
              We do not sell or rent your personal information to third parties.
            </p>
          </Section>

          {/* Section 3 */}
          <Section num="3" title="PAYMENT INFORMATION">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-3">
              All payments must be made through authorised accounts belonging to <strong>Joe Tech</strong>.
            </p>
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-2">For security purposes, we may request:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-800 dark:text-white">
              <li>Proof of payment,</li>
              <li>Valid identification, or</li>
              <li>Additional verification for high-value transactions such as enterprise hardware, solar installations, and bulk electronics.</li>
            </ul>
          </Section>

          {/* Section 4 */}
          <Section num="4" title="SHARING OF INFORMATION">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-3">We may share your information only where necessary with:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-800 dark:text-white">
              <li>Delivery and logistics partners</li>
              <li>Payment service providers</li>
              <li>Legal or regulatory authorities where required by law</li>
              <li>Professional advisers or service providers assisting our business operations</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mt-4">
              All third parties handling customer information are expected to maintain confidentiality and security standards.
            </p>
          </Section>

          {/* Section 5 */}
          <Section num="5" title="DATA SECURITY">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-3">
              We implement reasonable administrative, technical, and physical safeguards to protect your personal information against:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-800 dark:text-white">
              <li>Unauthorised access,</li>
              <li>Loss,</li>
              <li>Misuse,</li>
              <li>Alteration, or</li>
              <li>Disclosure.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mt-4">
              However, no method of electronic storage or transmission over the internet is completely secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          {/* Section 6 */}
          <Section num="6" title="COOKIES AND WEBSITE ANALYTICS">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-3">Our website may use cookies and similar technologies to:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-800 dark:text-white">
              <li>Improve website performance,</li>
              <li>Remember user preferences,</li>
              <li>Analyse traffic and usage patterns, and</li>
              <li>Enhance customer experience.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mt-4">
              You may disable cookies through your browser settings, although some website features may not function properly.
            </p>
          </Section>

          {/* Section 7 */}
          <Section num="7" title="CUSTOMER RIGHTS">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-3">You may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-800 dark:text-white">
              <li>Request access to your personal information,</li>
              <li>Correct inaccurate information,</li>
              <li>Request deletion of your data where applicable,</li>
              <li>Withdraw consent to marketing communications, and</li>
              <li>Request clarification regarding how your information is used.</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mt-4">
              Requests may be subject to legal or operational limitations.
            </p>
          </Section>

          {/* Section 8 */}
          <Section num="8" title="RETENTION OF INFORMATION">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed mb-3">We retain customer information only for as long as necessary to:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-800 dark:text-white">
              <li>Fulfil transactions,</li>
              <li>Provide services,</li>
              <li>Resolve disputes,</li>
              <li>Maintain business records, and</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          {/* Section 9 */}
          <Section num="9" title="THIRD-PARTY LINKS">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed">
              Our website or social media pages may contain links to third-party websites. We are not responsible for the privacy practices, policies, or content of external websites or services.
            </p>
          </Section>

          {/* Section 10 */}
          <Section num="10" title="CHILDREN'S PRIVACY">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed">
              Our products and services are not intended for individuals under the age of 18 without parental or guardian supervision. We do not knowingly collect personal information from minors unlawfully.
            </p>
          </Section>

          {/* Section 11 */}
          <Section num="11" title="CHANGES TO THIS PRIVACY POLICY">
            <p className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed">
              We reserve the right to update or amend this Privacy Policy at any time. Any changes shall become effective immediately upon publication on our website or official platforms.
            </p>
          </Section>



        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 dark:text-gray-800 dark:text-white">
          © {new Date().getFullYear()} Joe Tech. All rights reserved.
        </div>
      </div>
      </div>
    </div>
  );
};

/* Helper sub-components */
const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <section>
    <div className="flex items-center gap-4 mb-6">
      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#3626a7] text-white text-sm font-mono font-bold flex items-center justify-center">
        {num}
      </span>
      <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-800 dark:text-white tracking-tight">{title}</h2>
    </div>
    <div className="space-y-5" style={{ paddingLeft: '3.25rem' }}>
      {children}
    </div>
  </section>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-800 dark:text-white uppercase tracking-wider mb-2">{title}</h3>
    <div className="text-gray-600 dark:text-gray-800 dark:text-white leading-relaxed space-y-2 text-[0.95rem]">{children}</div>
  </div>
);
