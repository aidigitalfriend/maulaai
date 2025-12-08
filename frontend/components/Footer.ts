// Footer Logic
// Handles footer content, links, theme detection, and page-specific visibility

export interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
  icon?: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterState {
  currentYear: number;
  isDarkMode: boolean;
  showNewsletterSignup: boolean;
  isNewsletterLoading: boolean;
  newsletterEmail: string;
  newsletterStatus: 'idle' | 'success' | 'error';
}

export interface FooterActions {
  handleNewsletterSignup: (email: string) => Promise<void>;
  updateEmail: (email: string) => void;
  detectTheme: () => void;
  trackLinkClick: (linkName: string, section: string) => void;
}

export class FooterLogic {
  private state: FooterState;
  private actions: FooterActions;

  constructor() {
    this.state = {
      currentYear: new Date().getFullYear(),
      isDarkMode: false,
      showNewsletterSignup: true,
      isNewsletterLoading: false,
      newsletterEmail: '',
      newsletterStatus: 'idle',
    };

    this.actions = {
      handleNewsletterSignup: this.handleNewsletterSignup.bind(this),
      updateEmail: this.updateEmail.bind(this),
      detectTheme: this.detectTheme.bind(this),
      trackLinkClick: this.trackLinkClick.bind(this),
    };

    // Initialize theme detection
    this.detectTheme();
  }

  async handleNewsletterSignup(email: string): Promise<void> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    try {
      this.state.isNewsletterLoading = true;
      this.state.newsletterStatus = 'idle';

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to newsletter');
      }

      const data = await response.json();

      if (data.success) {
        this.state.newsletterStatus = 'success';
        this.state.newsletterEmail = '';

        // Track successful newsletter signup
        this.trackNewsletterEvent('newsletter_subscribed', { email });
      } else {
        throw new Error(data.message || 'Subscription failed');
      }
    } catch (error) {
      this.state.newsletterStatus = 'error';
      console.error('Newsletter signup failed:', error);
      throw error;
    } finally {
      this.state.isNewsletterLoading = false;
    }
  }

  updateEmail(email: string): void {
    this.state.newsletterEmail = email;
    // Reset status when user types
    if (this.state.newsletterStatus !== 'idle') {
      this.state.newsletterStatus = 'idle';
    }
  }

  detectTheme(): void {
    // Check for theme preference in localStorage or system
    const savedTheme = localStorage.getItem('theme');
    const systemDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    this.state.isDarkMode =
      savedTheme === 'dark' || (!savedTheme && systemDarkMode);

    // Listen for theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.state.isDarkMode = e.matches;
        }
      });
  }

  trackLinkClick(linkName: string, section: string): void {
    this.trackFooterEvent('footer_link_clicked', {
      link_name: linkName,
      section: section,
    });
  }

  getFooterSections(): FooterSection[] {
    return [
      {
        title: 'Product',
        links: [
          { name: 'AI Agents', href: '/agents' },
          { name: 'AI Lab', href: '/lab' },
          { name: 'Developer Tools', href: '/tools' },
          { name: 'Pricing', href: '/pricing' },
          { name: 'Enterprise', href: '/solutions/enterprise-ai' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { name: 'Documentation', href: '/docs' },
          { name: 'API Reference', href: '/docs/api' },
          { name: 'Tutorials', href: '/resources/tutorials' },
          { name: 'Case Studies', href: '/resources/case-studies' },
          { name: 'Blog', href: '/resources/blog' },
        ],
      },
      {
        title: 'Community',
        links: [
          { name: 'Discord', href: '/community/discord', external: true },
          {
            name: 'GitHub',
            href: 'https://github.com/onelastai',
            external: true,
          },
          {
            name: 'Twitter',
            href: 'https://twitter.com/onelastai',
            external: true,
          },
          { name: 'Contributing', href: '/community/contributing' },
          { name: 'Roadmap', href: '/community/roadmap' },
        ],
      },
      {
        title: 'Company',
        links: [
          { name: 'About', href: '/about' },
          { name: 'Careers', href: '/resources/careers' },
          { name: 'Contact', href: '/contact' },
          { name: 'Partners', href: '/about/partnerships' },
          { name: 'Press Kit', href: '/about/press' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { name: 'Privacy Policy', href: '/legal/privacy-policy' },
          { name: 'Terms of Service', href: '/legal/terms-of-service' },
          { name: 'Cookie Policy', href: '/legal/cookie-policy' },
          { name: 'Security', href: '/security' },
          { name: 'Compliance', href: '/legal/compliance' },
        ],
      },
    ];
  }

  getSocialLinks(): FooterLink[] {
    return [
      {
        name: 'Twitter',
        href: 'https://twitter.com/onelastai',
        external: true,
        icon: 'twitter',
      },
      {
        name: 'GitHub',
        href: 'https://github.com/onelastai',
        external: true,
        icon: 'github',
      },
      {
        name: 'LinkedIn',
        href: 'https://linkedin.com/company/onelastai',
        external: true,
        icon: 'linkedin',
      },
      {
        name: 'Discord',
        href: '/community/discord',
        external: true,
        icon: 'discord',
      },
    ];
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private trackFooterEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'footer_interaction',
      });
    }
  }

  private trackNewsletterEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'newsletter',
      });
    }
  }

  getNewsletterStatusMessage(): string {
    switch (this.state.newsletterStatus) {
      case 'success':
        return 'Thank you for subscribing! Check your email for confirmation.';
      case 'error':
        return 'Something went wrong. Please try again later.';
      default:
        return '';
    }
  }

  shouldShowFooter(pathname: string): boolean {
    // Hide footer on certain pages
    const hiddenPaths = [
      '/auth/login',
      '/auth/signup',
      '/auth/forgot-password',
      '/payment',
      '/subscribe',
    ];

    return !hiddenPaths.some((path) => pathname.startsWith(path));
  }

  getState(): FooterState {
    return { ...this.state };
  }

  getActions(): FooterActions {
    return this.actions;
  }

  setState(updates: Partial<FooterState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default FooterLogic;
