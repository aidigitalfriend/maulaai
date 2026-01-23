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
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      <section className="section-padding bg-gradient-to-r from-brand-600 to-purple-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Webinars</h1>
          <p className="text-xl opacity-90">Live training sessions and recorded webinars</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {webinars.map((webinar, idx) => (
              <div
                key={idx}
                className="p-6 border border-neural-700 rounded-lg hover:border-brand-500 transition-all bg-neural-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex-1">{webinar.title}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                    webinar.status === 'Upcoming' 
                      ? 'bg-green-900/50 text-green-400' 
                      : 'bg-neural-700 text-neural-300'
                  }`}>
                    {webinar.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-neural-300 mb-4">
                  <p>📅 {webinar.date}</p>
                  <p>🕐 {webinar.time}</p>
                  <p>👤 Speaker: {webinar.speaker}</p>
                </div>
                <Link href="/webinars/register-now" className="text-brand-400 font-semibold hover:text-brand-300">
                  {webinar.status === 'Upcoming' ? 'Register Now →' : 'Watch Recording →'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-r from-brand-600 to-purple-600">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Stay Updated</h2>
          <p className="text-lg text-white/90 mb-8">
            Subscribe to our newsletter to get notifications about upcoming webinars and events.
          </p>
          <Link href="/subscribe" className="inline-block px-8 py-3 bg-white hover:bg-neural-100 text-brand-600 rounded-lg font-semibold transition-colors">
            Subscribe Now
          </Link>
        </div>
      </section>
    </div>
  )
}
