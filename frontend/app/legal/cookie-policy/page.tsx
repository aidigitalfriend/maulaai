'use client'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom section-padding max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-neural-600 mb-12">Last updated: October 21, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
            <p className="text-neural-700 mb-4">
              Cookies are small files placed on your device when you visit a website. They help websites remember information 
              about your visit, such as your preferences and login information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
            <p className="text-neural-700 mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how you use our site</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences</li>
              <li><strong>Analytics Cookies:</strong> Track website usage and performance</li>
              <li><strong>Marketing Cookies:</strong> Used for advertising and marketing purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div className="bg-neural-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Session Cookies</h3>
                <p className="text-neural-700">These cookies expire when you close your browser.</p>
              </div>
              <div className="bg-neural-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Persistent Cookies</h3>
                <p className="text-neural-700">These cookies remain on your device until they expire or are deleted.</p>
              </div>
              <div className="bg-neural-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Third-Party Cookies</h3>
                <p className="text-neural-700">Set by external partners for analytics and marketing purposes.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Your Cookie Choices</h2>
            <p className="text-neural-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>Accept or reject cookies</li>
              <li>Delete cookies from your device</li>
              <li>Configure your browser to reject cookies</li>
              <li>Opt out of specific types of cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
            <p className="text-neural-700 mb-4">
              We use third-party services like Google Analytics and marketing partners that may place cookies on your device. 
              You can opt out of these services through their respective websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
            <p className="text-neural-700">
              For questions about our Cookie Policy, please contact us at privacy@One Last AI.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
