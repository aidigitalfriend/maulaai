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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Meet Our Team
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed">
            Talented people working toward a common goal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="text-center p-8 rounded-2xl bg-white border border-neural-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-lg font-bold text-neural-800 mb-1">{member.name}</h3>
              <p className="text-brand-600 font-semibold mb-2">{member.role}</p>
              <p className="text-neural-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">We're Growing</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            We're actively hiring talented people to join our mission. Check out our open positions.
          </p>
          <Link
            href="/resources/careers"
            className="inline-flex items-center px-8 py-3 bg-white text-brand-600 font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            View Open Positions
          </Link>
        </div>
      </div>
    </div>
  )
}
