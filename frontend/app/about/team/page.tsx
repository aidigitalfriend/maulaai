'use client'

import Link from 'next/link'

export default function TeamPage() {
  const teamMembers = [
    { name: "Shahbaz Chaudhry", role: "CEO & Co-founder", bio: "AI researcher with 15+ years of experience" },
    { name: "Adil Pieter", role: "CTO & Co-founder", bio: "Machine learning expert and former Google AI researcher" },
    { name: "Zara Faisal", role: "VP of Product", bio: "Product leader focused on user experience" },
    { name: "Sarah Williams", role: "VP of Sales", bio: "Enterprise sales veteran with deep market knowledge" },
    { name: "Emily Chen", role: "Lead AI Engineer", bio: "PhD in Computer Science from Stanford" },
    { name: "David Rodriguez", role: "Head of Design", bio: "Design leader passionate about usability" }
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Team</h1>
          <p className="text-xl opacity-90">Talented people working toward a common goal</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="text-center p-6 rounded-lg border border-neural-200 hover:shadow-lg transition-all">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                <p className="text-brand-600 font-semibold mb-2">{member.role}</p>
                <p className="text-neural-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-sky-400">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">We're Growing</h2>
          <p className="text-lg text-white/90 mb-8">
            We're actively hiring talented people to join our mission. Check out our open positions.
          </p>
          <Link
            href="/resources/careers"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            View Open Positions
          </Link>
        </div>
      </section>
    </div>
  )
}
