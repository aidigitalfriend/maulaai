import Link from 'next/link'

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg text-center">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
          Industry Solutions
        </h1>
        <p className="text-xl text-neural-600 leading-relaxed mb-8 max-w-3xl mx-auto">
          Specialized AI solutions designed for your industry's unique challenges and opportunities.
        </p>
        <Link href="/industries/overview" className="btn-primary">
          Explore Industries
        </Link>
      </div>
    </div>
  )
}