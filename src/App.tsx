import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/flash-sales" element={<FlashSales />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/seller-request" element={<SellerRequest />} />
            <Route path="/my-seller-request" element={<MySellerRequest />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/add-product" element={<SellerAddProduct />} />
            <Route path="/product-inquiry/:id" element={<ProductInquiry />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
