import Link from "next/link"
export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Support Center</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">Get help, contact support, book consultations, and find answers to all your questions.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <Link href="/support/help-center" className="btn-primary">Get Support</Link>
        </div>
      </section>
    </div>
  )
}
