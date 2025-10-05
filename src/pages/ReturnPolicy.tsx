import { Layout } from '@/components/layout/Layout';

export default function ReturnPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Return Policy</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Return Eligibility</h2>
            <p>Items can be returned within 7 days of delivery if they meet the following conditions:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Items are in original condition with tags attached</li>
              <li>Items are unused and unworn</li>
              <li>Items are in original packaging</li>
              <li>Proof of purchase is provided</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Non-Returnable Items</h2>
            <p>The following items cannot be returned:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Perishable goods</li>
              <li>Personal care items</li>
              <li>Gift cards</li>
              <li>Clearance or final sale items</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Return Process</h2>
            <p>To initiate a return:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Contact our customer service team</li>
              <li>Provide your order number and reason for return</li>
              <li>Receive return authorization and instructions</li>
              <li>Ship the item back to us</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Refund Policy</h2>
            <p>Once we receive and inspect your return, we will process your refund within 5-7 business days. Refunds will be issued to the original payment method.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Exchanges</h2>
            <p>We currently do not offer direct exchanges. If you need a different size or color, please return the original item and place a new order.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us immediately with photos of the damage. We will arrange for a replacement or full refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Return Shipping</h2>
            <p>Customers are responsible for return shipping costs unless the item is damaged, defective, or we made an error in your order.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact Us</h2>
            <p>For return inquiries, contact us at:</p>
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
