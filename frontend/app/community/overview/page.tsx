'use client'

import Link from 'next/link'

export default function CommunityOverviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="section-padding bg-gradient-to-r from-purple-600 to-brand-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Community</h1>
          <p className="text-xl opacity-90">Join thousands of AI enthusiasts and innovators</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "💬",
                title: "Discord Community",
                description: "Join our active Discord server to connect with other users",
                link: "/community/discord",
                linkText: "Join Discord"
              },
              {
                icon: "🔧",
                title: "Contributing",
                description: "Help improve AgentHub by contributing code and ideas",
                link: "/community/contributing",
                linkText: "Get Involved"
              },
              {
                icon: "🗺️",
                title: "Open Roadmap",
                description: "See what's coming next and vote on features",
                link: "/community/roadmap",
                linkText: "View Roadmap"
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 border border-neural-200 rounded-lg hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-neural-600 mb-4">{item.description}</p>
                <Link href={item.link} className="text-brand-600 font-semibold hover:text-brand-700">
                  {item.linkText} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-neural-50">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Community Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Members" },
              { number: "5K+", label: "GitHub Stars" },
              { number: "500+", label: "Contributions" }
            ].map((stat, idx) => (
              <div key={idx} className="p-6 bg-white rounded-lg border border-neural-200">
                <div className="text-4xl font-bold text-brand-600 mb-2">{stat.number}</div>
                <p className="text-neural-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
