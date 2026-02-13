import ProtectedAdmin from "@/components/gharun/ProtectedAdmin";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import AdminSetup from "@/components/gharun/AdminSetup";
import AdminDashboard from "@/components/gharun/AdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <BrowserRouter>
              <Routes>

                {/* HOME */}
                <Route path="/" element={<Index />} />

                {/* ADMIN DASHBOARD */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedAdmin>
                      <AdminDashboard />
                    </ProtectedAdmin>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />

              </Routes>
            </BrowserRouter>

          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};  
export default App;