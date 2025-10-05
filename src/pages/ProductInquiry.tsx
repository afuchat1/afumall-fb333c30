import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductInquiryForm } from '@/components/products/ProductInquiryForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ProductInquiry = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Product Inquiry</h1>
          <ProductInquiryForm 
            productId={id || ''}
            productName=""
            onClose={() => navigate(-1)}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductInquiry;
