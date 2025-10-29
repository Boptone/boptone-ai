import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Dashboard from "./pages/Dashboard";
import AIAdvisor from "./pages/AIAdvisor";
import Store from "./pages/Store";
import Financials from "./pages/Financials";
import IPProtection from "./pages/IPProtection";
import Tours from "./pages/Tours";
import Healthcare from "./pages/Healthcare";
import Admin from "./pages/Admin";
import Signup from "./pages/Signup";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/ai-advisor"} component={AIAdvisor} />
      <Route path={"/store"} component={Store} />
      <Route path={"/financials"} component={Financials} />
      <Route path={"/ip-protection"} component={IPProtection} />
      <Route path={"/tours"} component={Tours} />
      <Route path={"/healthcare"} component={Healthcare} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/signup"} component={Signup} />
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
