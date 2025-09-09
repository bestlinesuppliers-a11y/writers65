import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import WritersManagement from "./pages/admin/WritersManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import PaymentsManagement from "./pages/admin/PaymentsManagement";
import WriterLayout from "./pages/writer/WriterLayout";
import WriterDashboard from "./pages/writer/WriterDashboard";
import AvailableOrders from "./pages/writer/AvailableOrders";
import WriterAssignments from "./pages/writer/WriterAssignments";
import ClientLayout from "./pages/client/ClientLayout";
import ClientDashboard from "./pages/client/ClientDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Auth />} />
          <Route path="/auth/register" element={<Auth />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="writers" element={<WritersManagement />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="payments" element={<PaymentsManagement />} />
          </Route>
          
          {/* Writer Routes */}
          <Route path="/writer" element={<WriterLayout />}>
            <Route index element={<WriterDashboard />} />
            <Route path="orders" element={<AvailableOrders />} />
            <Route path="assignments" element={<WriterAssignments />} />
            <Route path="submissions" element={<div className="p-6">Submissions - Coming Soon</div>} />
            <Route path="messages" element={<div className="p-6">Messages - Coming Soon</div>} />
            <Route path="earnings" element={<div className="p-6">Earnings - Coming Soon</div>} />
            <Route path="profile" element={<div className="p-6">Profile - Coming Soon</div>} />
          </Route>
          
          {/* Client Routes */}
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<ClientDashboard />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="place-order" element={<div className="p-6">Place Order - Coming Soon</div>} />
            <Route path="orders" element={<div className="p-6">Active Orders - Coming Soon</div>} />
            <Route path="completed" element={<div className="p-6">Completed Orders - Coming Soon</div>} />
            <Route path="payments" element={<div className="p-6">Payments - Coming Soon</div>} />
            <Route path="messages" element={<div className="p-6">Messages - Coming Soon</div>} />
            <Route path="profile" element={<div className="p-6">Profile - Coming Soon</div>} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
