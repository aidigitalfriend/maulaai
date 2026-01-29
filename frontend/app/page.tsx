import HeroSectionGSAP from '@/components/HeroSectionGSAP';
import FeatureSection from '@/components/FeatureSection';
import TestimonialSection from '@/components/TestimonialSection';
import CommunityStats from '@/components/CommunityStats';
import NewsletterSection from '@/components/NewsletterSection';
import Link from 'next/link';
import Image from 'next/image';
import AgentShowcaseSection from '@/components/AgentShowcaseSection';
import AIShowcaseSection from '@/components/AIShowcaseSection';
import AgentCardsMarquee from '@/components/AgentCardsMarquee';
import AnalyticsSection from '@/components/AnalyticsSection';
import InsightsSection from '@/components/InsightsSection';
import EnvironmentSetupSection from '@/components/EnvironmentSetupSection';
import CanvasBuilderSection from '@/components/CanvasBuilderSection';
import DataGeneratorSection from '@/components/DataGeneratorSection';
import FAQSection from '@/components/FAQSection';
import NewsSection from '@/components/NewsSection';
import IntegrationsSection from '@/components/IntegrationsSection';
import RoadmapSection from '@/components/RoadmapSection';
import SecuritySection from '@/components/SecuritySection';
import NewsletterSectionGSAP from '@/components/NewsletterSectionGSAP';
import PricingSection from '@/components/PricingSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import CTASection from '@/components/CTASection';

// Homepage showcasing the fixed design system
export default function HomePage() {
  // Stats for hero section - Fix #4: Visual Hierarchy
  const heroStats = [
    {
      number: '20+',
      label: 'AI Agents',
      description: 'Specialized personalities',
    },
    {
      number: '99.9%',
      label: 'Uptime',
      description: 'Enterprise reliability',
    },
    {
      number: '10K+',
      label: 'Users',
      description: 'Growing community',
    },
    {
      number: '24/7',
      label: 'Support',
      description: 'Always available',
    },
  ];

  // Platform features - Fix #1: Consistent grid layout
  const platformFeatures = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: 'AI-Powered Agents',
      description:
        'Access 18 specialized AI personalities including Einstein, Shakespeare, Tesla, and more. Each agent brings unique expertise to solve your specific challenges.',
      link: {
        text: 'Explore Agents',
        href: '/agents',
      },
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: 'Real-time Analytics',
      description:
        'Monitor your AI interactions with comprehensive dashboards, usage analytics, and performance insights in real-time.',
      link: {
        text: 'View Dashboard',
        href: '/dashboard',
      },
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: 'Enterprise Security',
      description:
        'Bank-level encryption, SOC 2 compliance, and privacy-first architecture ensure your data stays protected and confidential.',
      link: {
        text: 'Security Details',
        href: '/security',
      },
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: 'Environment Configuration',
      description:
        'Set up API keys and configure multilingual AI services with our comprehensive environment variable guide.',
      link: {
        text: 'Configure Setup',
        href: '/config',
      },
    },
  ];

  return (
    <div className="min-h-screen">
      {/* GSAP Hero Section - Clean, professional animation */}
      <HeroSectionGSAP />

      {/* Agent Cards Marquee - Scrolling Cards */}
      <AgentCardsMarquee />

      {/* AI Showcase Section - Animated screenshots with GSAP */}
      <AIShowcaseSection />

      {/* Real-time Analytics Section with GSAP */}
      <AnalyticsSection />

      {/* Insights Section with GSAP */}
      <InsightsSection />

      {/* Environment Setup Section with GSAP */}
      <EnvironmentSetupSection />

      {/* Canvas Builder Section with GSAP */}
      <CanvasBuilderSection />

      {/* AI Data Generator Section with GSAP */}
      <DataGeneratorSection />

      {/* Testimonials Section - Dark Theme Updated */}
      <TestimonialSection />

      {/* Community Stats Section */}
      <CommunityStats />

      {/* FAQ Section with GSAP */}
      <FAQSection />

      {/* News Section with GSAP */}
      <NewsSection />

      {/* Integration Partners Section */}
      <IntegrationsSection />

      {/* Feature Roadmap Section */}
      <RoadmapSection />

      {/* Trust & Security Section */}
      <SecuritySection />

      {/* Newsletter Section */}
      <NewsletterSectionGSAP />

      {/* Pricing Section */}
      <PricingSection />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
