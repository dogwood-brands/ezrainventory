'use client';

// ===========================================
// EZRA PORTAL - Marketing Home Page
// ===========================================

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Lock,
  Check,
  ChevronRight,
  Play,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

// ============ Hero Section ============
const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden">
    {/* Background effects */}
    <div className="absolute inset-0 bg-surface-950">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ezra-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
    </div>

    <div className="relative max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-4xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/50 border border-surface-700/50 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-ezra-400" />
          <span className="text-sm text-surface-300">
            Intelligent Automation for Modern Franchises
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-display-lg md:text-display-xl text-white mb-6 animate-fade-in-up">
          AI-Powered Intelligence for{' '}
          <span className="gradient-text">Franchise Operations</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-surface-400 mb-10 max-w-2xl leading-relaxed animate-fade-in-up animation-delay-100">
          Ezra connects to any POS system and transforms your operational data into
          actionable insights. Built for franchisors, franchisees, and multi-unit
          operators.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-200">
          <Link href="/contact">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Request a Demo
            </Button>
          </Link>
          <Link href="/bots">
            <Button variant="outline" size="lg">
              Explore Our Bots
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex items-center gap-8 animate-fade-in-up animation-delay-300">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-ezra-400" />
            <span className="text-surface-400">Enterprise-grade security</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-ezra-400" />
            <span className="text-surface-400">Multi-POS support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-ezra-400" />
            <span className="text-surface-400">White-glove onboarding</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ============ POS Integration Section ============
const POSSection = () => {
  const posSystems = [
    { name: 'Zenoti', status: 'Active', method: 'VM Automation' },
    { name: 'Stripe', status: 'Active', method: 'API' },
    { name: 'Toast', status: 'Coming Soon', method: 'API' },
    { name: 'Square', status: 'Coming Soon', method: 'API' },
    { name: 'Clover', status: 'Planned', method: 'API' },
  ];

  return (
    <section className="py-24 bg-surface-900 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-display-sm text-white mb-4">
            Universal POS Integration
          </h2>
          <p className="text-lg text-surface-400 max-w-2xl mx-auto">
            Ezra connects to your existing systems—no matter what POS you use.
            Our intelligent engine extracts data through APIs or secure automation.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {posSystems.map((pos) => (
            <div
              key={pos.name}
              className={cn(
                'p-6 rounded-xl text-center transition-all duration-300',
                'border border-surface-800 bg-surface-850/50',
                'hover:border-ezra-500/50 hover:shadow-glow'
              )}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-surface-800 flex items-center justify-center">
                <Globe className="w-6 h-6 text-ezra-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{pos.name}</h3>
              <p className="text-xs text-surface-500 mb-2">{pos.method}</p>
              <span
                className={cn(
                  'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                  pos.status === 'Active'
                    ? 'bg-success-500/10 text-success-500'
                    : pos.status === 'Coming Soon'
                    ? 'bg-warning-500/10 text-warning-500'
                    : 'bg-surface-700 text-surface-400'
                )}
              >
                {pos.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ Features Section ============
const FeaturesSection = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Ezra Sales',
      description:
        'Real-time sales intelligence with daily metrics, goal tracking, and trend analysis across all your locations.',
      href: '/bots/ezra-sales',
    },
    {
      icon: Shield,
      title: 'Ezra LP',
      description:
        'Loss prevention monitoring with AI-powered anomaly detection for refunds, discounts, and suspicious patterns.',
      href: '/bots',
    },
    {
      icon: Zap,
      title: 'Ezra Scheduling',
      description:
        'Optimize labor costs with intelligent scheduling recommendations based on historical traffic patterns.',
      href: '/bots',
    },
  ];

  return (
    <section className="py-24 bg-surface-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-display-sm text-white mb-4">
            Meet the Ezra Family
          </h2>
          <p className="text-lg text-surface-400 max-w-2xl mx-auto">
            Purpose-built AI solutions that transform your franchise data into strategic
            advantages. Each product is customized for your brand and configured to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={cn(
                  'group p-8 rounded-2xl',
                  'bg-surface-900 border border-surface-800',
                  'transition-all duration-300',
                  'hover:border-ezra-500/50 hover:shadow-glow'
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-ezra-500/10 flex items-center justify-center mb-6 group-hover:bg-ezra-500/20 transition-colors">
                  <Icon className="w-7 h-7 text-ezra-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-surface-400 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <span className="inline-flex items-center gap-2 text-ezra-400 font-medium group-hover:gap-3 transition-all">
                  Learn more <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============ How It Works Section ============
const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Connect Your POS',
      description:
        'We securely connect to your existing POS system via API or our intelligent automation layer.',
    },
    {
      number: '02',
      title: 'Configure Your Brand',
      description:
        'Our team customizes dashboards, goals, and alerts specific to your franchise operations.',
    },
    {
      number: '03',
      title: 'Access Insights',
      description:
        'Log into your secure Ezra portal to view real-time analytics across all locations.',
    },
  ];

  return (
    <section className="py-24 bg-surface-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-display-sm text-white mb-4">
            How Ezra Works
          </h2>
          <p className="text-lg text-surface-400 max-w-2xl mx-auto">
            A managed service, not self-serve SaaS. We handle the complexity so
            you can focus on growing your business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-surface-700" />
              )}
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-surface-850 border border-surface-700 flex items-center justify-center">
                  <span className="text-3xl font-bold gradient-text">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-surface-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ CTA Section ============
const CTASection = () => (
  <section className="py-24 bg-surface-950 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-ezra-500/10 rounded-full blur-[150px]" />
    </div>
    <div className="relative max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-display-sm text-white mb-6">
        Ready to Transform Your Operations?
      </h2>
      <p className="text-lg text-surface-400 mb-10 max-w-2xl mx-auto">
        Join leading franchise brands using Ezra to gain visibility, reduce losses,
        and make data-driven decisions across all locations.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/contact">
          <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
            Talk to Our Team
          </Button>
        </Link>
        <Link href="/about">
          <Button variant="ghost" size="lg">
            Learn More About Ezra
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

// ============ Header ============
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ezra-400 to-ezra-600 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">
            Ezra
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/bots"
            className="text-surface-300 hover:text-white transition-colors"
          >
            Bots
          </Link>
          <Link
            href="/bots/ezra-sales"
            className="text-surface-300 hover:text-white transition-colors"
          >
            Ezra Sales
          </Link>
          <Link
            href="/about"
            className="text-surface-300 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-surface-300 hover:text-white transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/contact">
            <Button>Request Demo</Button>
          </Link>
        </div>
      </div>
    </div>
  </header>
);

// ============ Footer ============
const Footer = () => (
  <footer className="py-12 bg-surface-950 border-t border-surface-800">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ezra-400 to-ezra-600 flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="text-surface-400">
            © 2025 Ezra AI. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-surface-400 hover:text-surface-300 text-sm"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-surface-400 hover:text-surface-300 text-sm"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-surface-400 hover:text-surface-300 text-sm"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

// ============ Main Page ============
export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-950">
      <Header />
      <main>
        <HeroSection />
        <POSSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
