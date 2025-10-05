import { Layout } from '@/components/layout/Layout';
import { SellerRequestForm } from '@/components/seller/SellerRequestForm';

const SellerRequest = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SellerRequestForm />
      </div>
    </Layout>
  );
};

export default SellerRequest;
