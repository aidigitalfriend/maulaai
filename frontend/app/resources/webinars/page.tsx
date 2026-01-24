'use client'

import Link from 'next/link'

export default function WebinarsPage() {
  const webinars = [
    {
      title: "Getting Started with AI Agents",
      date: "November 15, 2025",
      time: "2:00 PM EST",
      speaker: "John Smith",
      status: "Upcoming"
    },
    {
      title: "Advanced Customization Techniques",
      date: "November 22, 2025",
      time: "3:00 PM EST",
      speaker: "Sarah Johnson",
      status: "Upcoming"
    },
    {
      title: "Building Enterprise Solutions",
      date: "November 29, 2025",
      time: "2:00 PM EST",
      speaker: "Mike Chen",
      status: "Upcoming"
    },
    {
      title: "Real-time Analytics & Reporting",
      date: "October 20, 2025",
      time: "2:00 PM EST",
      speaker: "Emily Davis",
      status: "Recorded"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">🎥</span>
            Live Sessions
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Webinars</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">Live training sessions and recorded webinars to help you master AI agents</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {webinars.map((webinar, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border border-neural-200 rounded-2xl hover:shadow-lg hover:border-brand-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neural-900 flex-1">{webinar.title}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                    webinar.status === 'Upcoming' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-neural-100 text-neural-600'
                  }`}>
                    {webinar.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-neural-600 mb-4">
                  <p>📅 {webinar.date}</p>
                  <p>🕐 {webinar.time}</p>
                  <p>👤 Speaker: {webinar.speaker}</p>
                </div>
                <Link href="/webinars/register-now" className="text-brand-600 font-semibold hover:text-brand-700">
                  {webinar.status === 'Upcoming' ? 'Register Now →' : 'Watch Recording →'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="container-custom max-w-3xl text-center relative">
          <h2 className="text-3xl font-bold mb-4 text-white">Stay Updated</h2>
          <p className="text-lg text-white/80 mb-8">
            Subscribe to our newsletter to get notifications about upcoming webinars and events.
          </p>
          <Link href="/subscribe" className="inline-block px-8 py-3 bg-white hover:bg-gray-100 text-slate-900 rounded-xl font-semibold transition-colors">
            Subscribe Now
          </Link>
        </div>
      </section>
    </div>
  )
}
