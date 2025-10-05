import { Layout } from '@/components/layout/Layout';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Contact() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:Afuchatgroup@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                Afuchatgroup@gmail.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  <a href="tel:+256703464913" className="hover:text-primary transition-colors">
                    +256703464913
                  </a>
                </p>
                <p>
                  <a href="tel:+256760635265" className="hover:text-primary transition-colors">
                    +256760635265
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Kampala, Uganda
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Have a question or need assistance? We're here to help! Reach out to us through any of the contact methods above, and our team will get back to you as soon as possible.
            </p>
            <p className="text-muted-foreground">
              <strong>Business Hours:</strong> Monday - Saturday, 8:00 AM - 6:00 PM (EAT)
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
