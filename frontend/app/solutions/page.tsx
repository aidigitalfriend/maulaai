import Link from 'next/link'

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg text-center">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
          AI Solutions Hub
        </h1>
        <p className="text-xl text-neural-600 leading-relaxed mb-8 max-w-3xl mx-auto">
          Discover comprehensive AI solutions designed to revolutionize your business operations and drive unprecedented growth.
        </p>
        <Link href="/solutions/overview" className="btn-primary">
          Explore All Solutions
        </Link>
      </div>
    </div>
  )
}