import { Layout } from '@/components/layout/Layout';
import { Package, Users, ShieldCheck, Truck } from 'lucide-react';

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About AfuMall</h1>
        
        <div className="space-y-8">
          <section className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-lg">
              AfuMall is your trusted online marketplace, connecting buyers with quality products from verified sellers across Uganda. We're committed to providing a seamless shopping experience with competitive prices and excellent customer service.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border rounded-lg p-6 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Quality Products</h3>
              <p className="text-sm text-muted-foreground">Curated selection of authentic products</p>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Verified Sellers</h3>
              <p className="text-sm text-muted-foreground">All sellers are carefully vetted</p>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Secure Shopping</h3>
              <p className="text-sm text-muted-foreground">Your data and payments are protected</p>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Quick and reliable shipping</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              To empower local businesses and provide customers with access to quality products at competitive prices, while building a trusted and vibrant online marketplace community.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> Afuchatgroup@gmail.com</p>
              <p><strong>Phone:</strong> +256703464913 / +256760635265</p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
