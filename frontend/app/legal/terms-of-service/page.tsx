'use client'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom section-padding max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-neural-600 mb-12">Last updated: October 21, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-neural-700 mb-4">
              By accessing and using AgentHub, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-neural-700 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on AgentHub 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
              and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-neural-700 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software on AgentHub</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
            <p className="text-neural-700 mb-4">
              The materials on AgentHub are provided on an 'as is' basis. AgentHub makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or 
              conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property 
              or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
            <p className="text-neural-700 mb-4">
              In no event shall AgentHub or its suppliers be liable for any damages (including, without limitation, damages 
              for loss of data or profit, or due to business interruption) arising out of the use or inability to use the 
              materials on AgentHub.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Accuracy of Materials</h2>
            <p className="text-neural-700 mb-4">
              The materials appearing on AgentHub could include technical, typographical, or photographic errors. AgentHub does 
              not warrant that any of the materials on the site are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Links</h2>
            <p className="text-neural-700 mb-4">
              AgentHub has not reviewed all of the sites linked to its website and is not responsible for the contents of any 
              such linked site. The inclusion of any link does not imply endorsement by AgentHub of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Modifications</h2>
            <p className="text-neural-700 mb-4">
              AgentHub may revise these terms of service for its website at any time without notice. By using this website, you 
              are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contact Information</h2>
            <p className="text-neural-700">
              For any questions about these Terms of Service, please contact us at legal@agenthub.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
