import HeroSectionGSAP from '@/components/HeroSectionGSAP';
import TestimonialSection from '@/components/TestimonialSection';
import CommunityStats from '@/components/CommunityStats';
import NewsletterSection from '@/components/NewsletterSection';
import AgentMarquee from '@/components/AgentMarquee';
import HomepageSectionsGSAP from '@/components/HomepageSectionsGSAP';

// Homepage showcasing the fixed design system
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* GSAP Hero Section - Premium animation with SplitText */}
      <HeroSectionGSAP />

      {/* All Sections with GSAP Scroll Animations */}
      <HomepageSectionsGSAP />

      {/* Testimonials Section - Dark Theme Updated */}
      <TestimonialSection />

      {/* Community Stats Section */}
      <CommunityStats />

      {/* Agent Marquee */}
      <AgentMarquee />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
