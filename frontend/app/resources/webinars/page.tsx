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
    <div className="min-h-screen bg-white">
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
                className="p-6 border border-neural-200 rounded-lg hover:shadow-lg transition-all bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold flex-1">{webinar.title}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                    webinar.status === 'Upcoming' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-neural-100 text-neural-700'
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

      <section className="section-padding bg-blue-400">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Stay Updated</h2>
          <p className="text-lg text-white mb-8">
            Subscribe to our newsletter to get notifications about upcoming webinars and events.
          </p>
          <Link href="/subscribe" className="inline-block px-8 py-3 bg-white hover:bg-gray-100 text-blue-400 rounded-lg font-semibold transition-colors">
            Subscribe Now
          </Link>
        </div>
      </section>
    </div>
  )
}
