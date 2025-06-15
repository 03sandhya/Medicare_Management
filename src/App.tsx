import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthProvider from "./components/Authprovider";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import PatientDashboard from "./components/PatientDashboard";
import CaretakerDashboard from "./components/CaretakerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Onboarding from "./components/Onboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
       <AuthProvider >
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
         
             <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp  />} />  
             <Route path="/onboarding" element={<Onboarding/>} /> 
           
              {/* Protected Routes */}
            <Route path="/patient-dashboard" element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/caretaker-dashboard" element={
              <ProtectedRoute requiredRole="caretaker">
                <CaretakerDashboard />
              </ProtectedRoute>
            } />
              
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
