import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Index from "@/pages/index";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Document from "@/pages/document";
import Profile from "@/pages/profile";
import Subscribe from "@/pages/subscribe";
import Sign from "@/pages/sign";
import Upload from "@/pages/upload";
import Payment from "@/pages/payment";
import { useUser } from "./components/user-context";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated and trying to access protected routes
    if (!isLoading && !user && 
        (location.startsWith("/dashboard") || 
         location.startsWith("/document") || 
         location.startsWith("/profile") || 
         location.startsWith("/subscribe") ||
         location.startsWith("/sign") ||
         location.startsWith("/upload") ||
         location.startsWith("/payment"))) {
      setLocation("/");
    }
  }, [user, isLoading, location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/document/:id" component={Document} />
      <Route path="/profile" component={Profile} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/sign" component={Sign} />
      <Route path="/upload" component={Upload} />
      <Route path="/payment" component={Payment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
