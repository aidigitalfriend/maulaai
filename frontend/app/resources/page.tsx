import Link from 'next/link'

export default function Resources() {
  const resourceCategories = [
    {
      title: "Blog",
      description: "Explore our AI blog featuring 80+ articles on AI history, machine learning trends, agent development, and industry insights.",
      icon: "📝",
      href: "/resources/blog",
      items: ["AI History & Evolution", "Machine Learning Guides", "Agent Development", "Industry Insights"]
    },
    {
      title: "Case Studies",
      description: "Explore real-world success stories and implementations from our clients.",
      icon: "📊",
      href: "/resources/case-studies",
      items: ["Customer Success", "ROI Analysis", "Implementation Stories", "Before & After"]
    },
    {
      title: "News",
      description: "Stay updated with the latest announcements, product updates, and company news.",
      icon: "📰",
      href: "/resources/news",
      items: ["Product Updates", "Company Announcements", "Partnership News", "Feature Releases"]
    },
    {
      title: "Webinars",
      description: "Join live sessions and access recorded presentations from industry experts.",
      icon: "🎥",
      href: "/resources/webinars",
      items: ["Live Sessions", "Recorded Content", "Expert Panels", "Q&A Sessions"]
    },
    {
      title: "Documentation",
      description: "Comprehensive guides and technical documentation for our platform.",
      icon: "📚",
      href: "/resources/documentation",
      items: ["API Reference", "Integration Guides", "Best Practices", "Troubleshooting"]
    },
    {
      title: "Tutorials",
      description: "Step-by-step guides to help you get the most out of our AI agents.",
      icon: "🎓",
      href: "/resources/tutorials",
      items: ["Getting Started", "Advanced Features", "Video Guides", "Interactive Demos"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">📚</span>
            Knowledge Hub
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Resources & Learning
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover insights, learn best practices, and stay ahead with our comprehensive resource library.
          </p>
        </div>
      </section>

      <div className="container-custom section-padding-lg">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {resourceCategories.map((category, index) => (
            <Link key={index} href={category.href} className="group bg-white rounded-2xl p-8 shadow-sm border border-neural-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300">
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold text-neural-800 mb-3 group-hover:text-brand-600 transition-colors">
                {category.title}
              </h3>
              <p className="text-neural-600 mb-4 leading-relaxed">
                {category.description}
              </p>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-neural-500 flex items-center">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-6 opacity-90">
            Subscribe to our newsletter for the latest resources, insights, and updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-neural-800 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-lg hover:bg-neural-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
