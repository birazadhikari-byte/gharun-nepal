import ProtectedAdmin from "@/components/gharun/ProtectedAdmin";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import AdminSetup from "@/components/gharun/AdminSetup";
import AdminDashboard from "@/components/gharun/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* Home */}
            <Route path="/" element={<Index />} />

            {/* Admin Setup */}
            <Route
              path="/admin/setup"
              element={
                <AdminSetup
                  onComplete={() => (window.location.href = "/admin/dashboard")}
                  onCancel={() => (window.location.href = "/")}
                />
              }
            />

            {/* 🔐 Protected Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdmin>
                  <AdminDashboard />
                </ProtectedAdmin>
              }
            />

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;