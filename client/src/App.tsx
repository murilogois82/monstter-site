import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import ServiceOrderForm from "./pages/ServiceOrderForm";
import PartnerServiceOrders from "./pages/PartnerServiceOrders";
import AdminServiceOrders from "./pages/AdminServiceOrders";
import PaymentsDashboard from "./pages/PaymentsDashboard";
import UserManagement from "./pages/UserManagement";
import ClientManagement from "./pages/ClientManagement";
import PartnerManagement from "./pages/PartnerManagement";
import PartnerUserAssociation from "./pages/PartnerUserAssociation";
import PartnerDashboard from "./pages/PartnerDashboard";
import FinancialDashboard from "./pages/FinancialDashboard";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/sobre"} component={About} />
      <Route path={"/servicos"} component={Services} />
      <Route path={"/contato"} component={Contact} />
      <Route path={"/service-order-form"} component={ServiceOrderForm} />
      <Route path={"/partners/dashboard"} component={PartnerDashboard} />
      <Route path={"/partners/service-orders"} component={PartnerServiceOrders} />
      <Route path={"/admin/service-orders"} component={AdminServiceOrders} />
      <Route path={"/admin/payments-dashboard"} component={PaymentsDashboard} />
      <Route path={"/admin/users"} component={UserManagement} />
      <Route path={"/admin/clients"} component={ClientManagement} />
      <Route path={"/admin/partners"} component={PartnerManagement} />
      <Route path={"/admin/partner-users"} component={PartnerUserAssociation} />
      <Route path={"/admin/financial"} component={FinancialDashboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
