import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DemoProvider } from "./contexts/DemoContext";
import { Navigation } from "./components/Navigation";
import { ToneyChatbot } from "./components/ToneyChatbot";
import Home from "./pages/Home";
import ArtistProfile from "./pages/ArtistProfile";
import DemoArtistProfile from "./pages/DemoArtistProfile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import Demo from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import AIAdvisor from "./pages/AIAdvisor";
import Store from "./pages/Store";
import Financials from "./pages/Financials";
import IPProtection from "./pages/IPProtection";
import Tours from "./pages/Tours";
import Healthcare from "./pages/Healthcare";
import Admin from "./pages/Admin";
import Signup from "./pages/Signup";
import ProfileSettings from "./pages/ProfileSettings";
import Analytics from "./pages/Analytics";
import BAP from "./pages/BAP";
import Upload from "./pages/Upload";
import Discover from "./pages/Discover";
import Earnings from "./pages/Earnings";
import ToneRewards from "./pages/ToneRewards";
import Microloans from "./pages/Microloans";
import Money from "./pages/Money";
import Fans from "./pages/Fans";
import MyMusic from "./pages/MyMusic";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import MyStore from "./pages/MyStore";
import MyStoreOrders from "./pages/MyStoreOrders";
import AuthSignup from "./pages/AuthSignup";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/auth-signup" component={AuthSignup} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path={"/@:username"} component={ArtistProfile} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:productId" component={ProductDetail} />
      <Route path="/store" component={MyStore} />
      <Route path="/store/orders" component={MyStoreOrders} />
      <Route path="/demo-profile" component={DemoArtistProfile} />
      <Route path={"/profile-settings"} component={ProfileSettings} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/features"} component={Features} />
      <Route path={"/demo"} component={Demo} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/ai-advisor"} component={AIAdvisor} />
      <Route path={"/store"} component={Store} />
      <Route path={"/financials"} component={Financials} />
      <Route path={"/ip-protection"} component={IPProtection} />
      <Route path={"/tours"} component={Tours} />
      <Route path={"/healthcare"} component={Healthcare} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/bap"} component={BAP} />
      <Route path={"/protocol"} component={BAP} />
      <Route path={"/bap-protocol"} component={BAP} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/discover"} component={Discover} />
      <Route path={"/music"} component={Discover} />
      <Route path="/earnings" component={Earnings} />
      <Route path="/tone-rewards" component={ToneRewards} />
      <Route path="/microloans" component={Microloans} />
      <Route path="/revenue" component={Money} />
      <Route path="/audience" component={Fans} />
      <Route path="/releases" component={MyMusic} />
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
      <DemoProvider>
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            <Toaster />
            <Navigation />
            <Router />
            <ToneyChatbot />
          </TooltipProvider>
        </ThemeProvider>
      </DemoProvider>
    </ErrorBoundary>
  );
}

export default App;
