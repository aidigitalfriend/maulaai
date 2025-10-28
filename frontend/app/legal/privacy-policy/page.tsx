'use client'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom section-padding max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-neural-600 mb-12">Last updated: October 21, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-neural-700 mb-4">
              One Last AI ("we", "our", or "us") operates the One Last AI platform. This page informs you of our policies 
              regarding the collection, use, and disclosure of personal data when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information Collection and Use</h2>
            <p className="text-neural-700 mb-4">We collect several different types of information for various purposes:</p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, company name, and contact information</li>
              <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, and time spent</li>
              <li><strong>Cookies:</strong> We use cookies to enhance your browsing experience</li>
              <li><strong>Communication Data:</strong> Messages and support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Use of Data</h2>
            <p className="text-neural-700 mb-4">One Last AI uses the collected data for various purposes:</p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information for service improvement</li>
              <li>To monitor service usage</li>
              <li>To detect and prevent fraudulent activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Security of Data</h2>
            <p className="text-neural-700 mb-4">
              The security of your data is important to us but remember that no method of transmission over the Internet 
              or method of electronic storage is 100% secure. We use industry-standard security measures including SSL/TLS 
              encryption and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <p className="text-neural-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
            <p className="text-neural-700">
              If you have any questions about this Privacy Policy, please contact us at privacy@One Last AI.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
