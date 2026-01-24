import Link from 'next/link'

export default function About() {
  const sections = [
    {
      title: "About Us",
      description: "Learn about our mission, vision, and the story behind our AI agent platform.",
      icon: "🏢",
      href: "/about/overview",
      highlights: ["Company Mission", "Our Vision", "Core Values", "Company History"]
    },
    {
      title: "Meet the Team",
      description: "Get to know the talented individuals driving innovation in AI technology.",
      icon: "👥",
      href: "/about/team",
      highlights: ["Leadership Team", "Engineering", "Research", "Customer Success"]
    },
    {
      title: "Partnerships",
      description: "Discover our strategic partnerships and ecosystem of collaborators.",
      icon: "🤝",
      href: "/about/partnerships",
      highlights: ["Technology Partners", "Integration Partners", "Channel Partners", "Academic Research"]
    }
  ]

  const stats = [
    { number: "50M+", label: "Conversations Processed" },
    { number: "10K+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "150+", label: "Countries Served" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About Us
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            We're building the future of AI agents, empowering businesses to automate and scale with intelligent conversational AI.
          </p>
        </div>
      </section>

      <div className="container-custom section-padding-lg">

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              To democratize access to advanced AI technology by creating intelligent agents that understand, learn, and adapt to help businesses achieve their goals more efficiently.
            </p>
            <p className="text-gray-600">
              We believe that AI should be accessible, transparent, and designed to augment human capabilities rather than replace them.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-700 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* About Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {sections.map((section, index) => (
            <Link key={index} href={section.href} className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg hover:border-brand-200 transition-all duration-300">
              <div className="text-4xl mb-4">{section.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                {section.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.highlights.map((highlight, highlightIndex) => (
                  <li key={highlightIndex} className="text-sm text-gray-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-3"></span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Values */}
        <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p className="opacity-90">
                  Continuously pushing the boundaries of what's possible with AI technology.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold mb-3">Trust</h3>
                <p className="opacity-90">
                  Building secure, reliable, and transparent AI solutions you can depend on.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-bold mb-3">Excellence</h3>
                <p className="opacity-90">
                  Delivering exceptional experiences that exceed expectations every time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}