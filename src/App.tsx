import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Helmet } from "react-helmet-async"; // 🚨 New Import for static page SEO

import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Category } from "./pages/Category";
import { Deals } from "./pages/Deals";
import { FlashSales } from "./pages/FlashSales";
import { NewArrivals } from "./pages/NewArrivals";
import { Profile } from "./pages/Profile";
import { Admin } from "./pages/Admin";
import SellerRequest from "./pages/SellerRequest";
import { MySellerRequest } from "./pages/MySellerRequest";
import { SellerDashboard } from "./pages/SellerDashboard";
import { SellerAddProduct } from "./pages/SellerAddProduct";
import ProductInquiry from "./pages/ProductInquiry";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ReturnPolicy from "./pages/ReturnPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🚨 NEW COMPONENT: Wrapper to set a unique title and description for each static page
interface SeoWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SeoWrapper = ({ title, description, children }: SeoWrapperProps) => (
  <>
    <Helmet>
      <title>{title} | AfuMall - Online Shopping Uganda</title>
      <meta name="description" content={description} />
      {/* Set a fallback canonical URL for static pages */}
      <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : 'https://www.afuchat.com'} />
    </Helmet>
    {children}
  </>
);


const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* -------------------------------------------------------- */}
            {/* 🚀 SEO FIX IMPLEMENTED: Wrapping each static route with SeoWrapper */}
            {/* -------------------------------------------------------- */}
            <Route 
              path="/" 
              element={
                <SeoWrapper 
                  title="Your Premier Online Shopping Destination"
                  description="Shop the latest products, deals, and exclusive offers at AfuMall. Fast shipping, secure checkout, and unbeatable prices on quality items in Uganda."
                >
                  <Home />
                </SeoWrapper>
              } 
            />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/cart" 
              element={
                <SeoWrapper title="Shopping Cart" description="Review and manage the items in your AfuMall shopping cart before checkout.">
                  <Cart />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <SeoWrapper title="Checkout" description="Complete your purchase securely on AfuMall with fast shipping options.">
                  <Checkout />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/products" 
              element={
                <SeoWrapper title="All Products" description="Browse our full collection of products, deals, and special offers.">
                  <Products />
                </SeoWrapper>
              } 
            />
            
            {/* Dynamic Pages (ProductDetail, Category, Inquiry) rely on their internal Helmet */}
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/product-inquiry/:id" element={<ProductInquiry />} />

            <Route 
              path="/deals" 
              element={
                <SeoWrapper title="Deals & Discounts" description="Don't miss out on AfuMall's best deals and limited-time discounts across all categories.">
                  <Deals />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/flash-sales" 
              element={
                <SeoWrapper title="Flash Sales" description="Limited-time flash sales! Grab the lowest prices on popular items before they sell out.">
                  <FlashSales />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/new-arrivals" 
              element={
                <SeoWrapper title="New Arrivals" description="Discover the latest products and hottest trends just added to AfuMall.">
                  <NewArrivals />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <SeoWrapper title="My Profile" description="Manage your account, orders, and personal details on AfuMall.">
                  <Profile />
                </SeoWrapper>
              } 
            />
            <Route path="/admin" element={<Admin />} />
            <Route path="/seller-request" element={<SellerRequest />} />
            <Route path="/my-seller-request" element={<MySellerRequest />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/add-product" element={<SellerAddProduct />} />
            
            {/* Legal and Information Pages */}
            <Route 
              path="/terms" 
              element={
                <SeoWrapper title="Terms of Service" description="Read the legal terms and conditions for using the AfuMall platform.">
                  <Terms />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/privacy" 
              element={
                <SeoWrapper title="Privacy Policy" description="Our commitment to protecting your personal data and privacy at AfuMall.">
                  <Privacy />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/return-policy" 
              element={
                <SeoWrapper title="Return Policy" description="Information on returns, refunds, and exchanges for products purchased on AfuMall.">
                  <ReturnPolicy />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/about" 
              element={
                <SeoWrapper title="About AfuMall" description="Learn about AfuMall, our mission, and our commitment to bringing you the best online shopping experience.">
                  <About />
                </SeoWrapper>
              } 
            />
            <Route 
              path="/contact" 
              element={
                <SeoWrapper title="Contact Us" description="Get in touch with AfuMall customer support for any questions or assistance.">
                  <Contact />
                </SeoWrapper>
              } 
            />
            
            {/* Catch-all for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
