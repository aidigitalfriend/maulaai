'use client'

export default function RoadmapPage() {
  const roadmap = [
    {
      quarter: "Q4 2025",
      status: "In Progress",
      features: [
        "Voice integration for all agents",
        "Advanced analytics dashboard",
        "Custom agent creation"
      ]
    },
    {
      quarter: "Q1 2026",
      status: "Planned",
      features: [
        "Mobile app launch",
        "Slack integration",
        "Team collaboration features"
      ]
    },
    {
      quarter: "Q2 2026",
      status: "Planned",
      features: [
        "Enterprise SSO",
        "Advanced security features",
        "API marketplace"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="section-padding bg-gradient-to-r from-brand-600 to-purple-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Product Roadmap</h1>
          <p className="text-xl opacity-90">See what we're building next and share your ideas</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <div className="space-y-8">
            {roadmap.map((phase, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold">{phase.quarter}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    phase.status === 'In Progress' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {phase.status}
                  </span>
                </div>
                <div className="ml-4 border-l-4 border-brand-300 pl-6 pb-8">
                  {phase.features.map((feature, fIdx) => (
                    <div key={fIdx} className="mb-3 flex items-start">
                      <span className="text-brand-600 font-bold mr-3">✓</span>
                      <span className="text-neural-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#E0F2FE' }}>
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Have an idea?</h2>
          <p className="text-lg text-neural-600 mb-8">
            We love hearing from our community. Share your feature requests and ideas.
          </p>
          <a href="/community/suggestions" className="btn-primary">
            Submit Idea
          </a>
        </div>
      </section>
    </div>
  )
}
