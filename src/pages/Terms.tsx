import { Layout } from '@/components/layout/Layout';

export default function Terms() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms & Conditions</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using AfuMall, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials on AfuMall's website for personal, non-commercial transitory viewing only.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Account Registration</h2>
            <p>To access certain features of the platform, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Product Listings</h2>
            <p>All product descriptions, images, and prices are subject to change without notice. We reserve the right to limit quantities and discontinue products.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Pricing and Payment</h2>
            <p>All prices are in Ugandan Shillings (UGX). We accept various payment methods as indicated at checkout. Prices are subject to change without prior notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Seller Terms</h2>
            <p>Sellers must comply with all applicable laws and our seller policies. AfuMall reserves the right to remove listings that violate our terms or applicable laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>AfuMall shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact Information</h2>
            <p>For questions about these Terms, please contact us at:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Email: Afuchatgroup@gmail.com</li>
              <li>Phone: +256703464913 / +256760635265</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
