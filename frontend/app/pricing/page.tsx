import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pricing Plans
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your AI agent needs. Transparent pricing with no hidden fees.
          </p>
          <Link href="/pricing/overview" className="bg-white text-brand-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors">
            View All Plans
          </Link>
        </div>
      </section>
    </div>
  )
}