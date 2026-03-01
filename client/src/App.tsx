import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useMemo } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DemoProvider } from "./contexts/DemoContext";
import { Navigation } from "./components/Navigation";
import { ToneyChatbot } from "./components/ToneyChatbot";
import Footer from "./components/Footer";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MusicPlayer from "./components/MusicPlayer";

// Eager load only Home page and Landing page for fast initial load
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import PublicLanding from "./pages/PublicLanding";

// Lazy load all other pages
const NotFound = lazy(() => import("./pages/NotFound"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"));
const ArtistInsights = lazy(() => import("./pages/ArtistInsights"));
const DemoArtistProfile = lazy(() => import("./pages/DemoArtistProfile"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const ProductForm = lazy(() => import("./pages/ProductForm"));
const BopShopLanding = lazy(() => import("./pages/BopShopLanding"));
const BopShopBrowse = lazy(() => import("./pages/BopShopBrowse"));
const BopShopProduct = lazy(() => import("./pages/BopShopProduct"));
const Cart = lazy(() => import("./pages/Cart"));
const CartRecover = lazy(() => import("./pages/CartRecover"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Features = lazy(() => import("./pages/Features"));
const BopAudio = lazy(() => import("./pages/BopAudio"));
const Demo = lazy(() => import("./pages/Demo"));
const Explainer = lazy(() => import("./pages/Explainer"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AIAdvisor = lazy(() => import("./pages/AIAdvisor"));
const Store = lazy(() => import("./pages/Store"));
const Financials = lazy(() => import("./pages/Financials"));
const IPProtection = lazy(() => import("./pages/IPProtection"));
const Tours = lazy(() => import("./pages/Tours"));
const Healthcare = lazy(() => import("./pages/Healthcare"));
const Admin = lazy(() => import("./pages/Admin"));
const ReviewModeration = lazy(() => import("./pages/ReviewModeration"));
const ReviewAnalyticsDashboard = lazy(() => import("./pages/ReviewAnalyticsDashboard"));
const Signup = lazy(() => import("./pages/Signup"));
const MultiStepSignup = lazy(() => import("./pages/MultiStepSignup"));
const Login = lazy(() => import("./pages/Login"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BAP = lazy(() => import("./pages/BAP"));
const Upload = lazy(() => import("./pages/Upload"));
const Discover = lazy(() => import("./pages/Discover"));
const Earnings = lazy(() => import("./pages/Earnings"));
const ToneRewards = lazy(() => import("./pages/ToneRewards"));
const Microloans = lazy(() => import("./pages/Microloans"));
const Money = lazy(() => import("./pages/Money"));
const Finance = lazy(() => import("./pages/Finance"));
const Fans = lazy(() => import("./pages/Fans"));
const MyMusic = lazy(() => import("./pages/MyMusic"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const MyStore = lazy(() => import("./pages/MyStore"));
const MyStoreOrders = lazy(() => import("./pages/MyStoreOrders"));
const AuthSignup = lazy(() => import("./pages/AuthSignup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const WriterInvite = lazy(() => import("./pages/WriterInvite"));
const WriterProfile = lazy(() => import("./pages/WriterProfile"));
const WriterEarnings = lazy(() => import("./pages/WriterEarnings"));
const SplitsDashboard = lazy(() => import("./pages/SplitsDashboard"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const PayoutSettings = lazy(() => import("./pages/PayoutSettings"));
const PayoutHistory = lazy(() => import("./pages/PayoutHistory"));
const Workflows = lazy(() => import("./pages/Workflows"));
const WorkflowSettings = lazy(() => import("./pages/WorkflowSettings"));
const WorkflowBuilderPage = lazy(() => import("./pages/WorkflowBuilderPage"));
const WhyBoptone = lazy(() => import("./pages/WhyBoptone"));
const Listen = lazy(() => import("./pages/Listen"));
const PricingDashboard = lazy(() => import("./pages/PricingDashboard"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const UpgradeSuccess = lazy(() => import("./pages/UpgradeSuccess"));
const BillingSettings = lazy(() => import("./pages/BillingSettings"));
const Transparency = lazy(() => import("./pages/Transparency"));
const CookieSettings = lazy(() => import("./pages/CookieSettings"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Legal = lazy(() => import("./pages/Legal"));
const LegalChangelog = lazy(() => import("./pages/LegalChangelog"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Orders = lazy(() => import("./pages/Orders"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const ComplianceDashboard = lazy(() => import("./pages/admin/ComplianceDashboard"));
const DmcaPage = lazy(() => import("./pages/Dmca"));
const DmcaCounterNoticePage = lazy(() => import("./pages/DmcaCounterNotice"));
const Playlists = lazy(() => import("./pages/Playlists"));
const PlaylistDetail = lazy(() => import("./pages/PlaylistDetail"));
const BopsUpload = lazy(() => import("./pages/BopsUpload"));
const Bops = lazy(() => import("./pages/Bops"));
const ArtistBopsProfile = lazy(() => import("./pages/ArtistBopsProfile"));
const BopsNotifications = lazy(() => import("./pages/BopsNotifications"));
const ArtistPayout = lazy(() => import("./pages/ArtistPayout"));
const ArtistSetup = lazy(() => import("./pages/ArtistSetup"));
const ArtistSignup = lazy(() => import("./pages/ArtistSignup"));
const BatchUpload = lazy(() => import("./pages/BatchUpload"));
const ToneyInsights = lazy(() => import("./pages/ToneyInsights"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#008B8B] border-r-transparent"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Landing} />
        <Route path={"/welcome"} component={PublicLanding} />
        <Route path={"/home"} component={Home} />
        <Route path={"/login"} component={Login} />
        <Route path={"/auth-signup"} component={MultiStepSignup} />
        <Route path={"/forgot-password"} component={ForgotPassword} />
        <Route path={"/verify-email"} component={VerifyEmail} />
        <Route path={"/how-it-works"} component={HowItWorks} />
        <Route path={"/why-boptone"} component={WhyBoptone} />
        <Route path={"/writer-invite"} component={WriterInvite} />
        <Route path={"/writer-profile"} component={WriterProfile} />
        <Route path={"/writer-earnings"} component={WriterEarnings} />
        <Route path={"/splits"} component={SplitsDashboard} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path={"/@:username"} component={ArtistProfile} />
        <Route path="/shop" component={BopShopLanding} />
        <Route path="/shop/browse" component={BopShopBrowse} />
        <Route path="/shop/:slug" component={BopShopProduct} />
        <Route path="/cart" component={Cart} />
        <Route path="/cart/recover/:token" component={CartRecover} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
          <Route path="/wishlist" component={Wishlist} />
          <Route path="/orders" component={Orders} />
        <Route path="/admin" component={AdminOverview} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/revenue" component={AdminRevenue} />
        <Route path="/admin/reviews" component={ReviewModeration} />
        <Route path="/admin/content-moderation" component={AdminModeration} />
        <Route path="/admin/compliance" component={ComplianceDashboard} />
        <Route path="/dmca" component={DmcaPage} />
        <Route path="/dmca/counter-notice" component={DmcaCounterNoticePage} />
        <Route path="/analytics/reviews" component={ReviewAnalyticsDashboard} />
        <Route path="/product/:productId" component={ProductDetail} />
        <Route path="/store" component={MyStore} />
        <Route path="/store/orders" component={MyStoreOrders} />
        <Route path="/demo-profile" component={DemoArtistProfile} />
        <Route path={"/profile-settings"} component={ProfileSettings} />
        <Route path={"/404"} component={NotFound} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/privacy"} component={Privacy} />
        <Route path={"/cookie-settings"} component={CookieSettings} />
        <Route path={"/cookie-policy"} component={CookiePolicy} />
        <Route path={"/legal"} component={Legal} />
        <Route path={"/legal/changelog"} component={LegalChangelog} />
        <Route path="/products" component={ProductManagement} />
        <Route path="/products/new" component={ProductForm} />
        <Route path="/products/edit/:id" component={ProductForm} />
        <Route path={"/about"} component={About} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/features"} component={Features} />
        <Route path={"/bopaudio"} component={BopAudio} />
        <Route path={"/demo"} component={Demo} />
        <Route path={"/explainer"} component={Explainer} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/ai-advisor"} component={AIAdvisor} />
        <Route path={"/financials"} component={Financials} />
        <Route path={"/ip-protection"} component={IPProtection} />
        <Route path={"/tours"} component={Tours} />
        <Route path={"/healthcare"} component={Healthcare} />
         <Route path="/analytics" component={Analytics} />
        <Route path="/insights" component={ArtistInsights} />
        <Route path={"/bap"} component={BAP} />
        <Route path={"/protocol"} component={BAP} />
        <Route path={"/bap-protocol"} component={BAP} />
        <Route path={"/upload"} component={Upload} />
        <Route path={"/bops"} component={Bops} />
        <Route path={"/bops/upload"} component={BopsUpload} />
        <Route path={"/bops/notifications"} component={BopsNotifications} />
        <Route path={"/bops/artist/:artistId"} component={ArtistBopsProfile} />
        <Route path={"/artist/payout"} component={ArtistPayout} />
        <Route path={"/artist/setup"} component={ArtistSetup} />
        <Route path={"/artist/signup"} component={ArtistSignup} />
        <Route path={"/music"} component={Discover} />
        <Route path={"/playlists"} component={Playlists} />
        <Route path={"/playlists/:id"} component={PlaylistDetail} />
        <Route path="/earnings" component={Earnings} />
        <Route path="/tone-rewards" component={ToneRewards} />
        <Route path="/microloans" component={Microloans} />
        <Route path="/revenue" component={Money} />
        <Route path="/finance" component={Finance} />
        <Route path="/toney-insights" component={ToneyInsights} />
        <Route path="/audience" component={Fans} />
        <Route path="/releases" component={MyMusic} />
        <Route path="/batch-upload" component={BatchUpload} />
        <Route path="/settings/payouts" component={PayoutSettings} />
        <Route path="/payouts/history" component={PayoutHistory} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/workflows/builder" component={WorkflowBuilderPage} />
        <Route path="/workflows/settings" component={WorkflowSettings} />
        <Route path="/listen/:trackId" component={Listen} />
        <Route path="/pricing-dashboard" component={PricingDashboard} />
        <Route path="/upgrade/success" component={UpgradeSuccess} />
        <Route path="/upgrade" component={Upgrade} />
        <Route path="/settings/billing" component={BillingSettings} />
        <Route path="/transparency" component={Transparency} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/signup"} component={MultiStepSignup} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

/**
 * AppShell — reactive nav/footer visibility based on current route.
 * Must be rendered inside the Router context so useLocation works.
 */
function AppShell() {
  const [location] = useLocation();

  // Immersive full-screen pages: hide global nav + footer
  const isBopsFeedOnly = location === '/bops';
  const isMusicPage = location.startsWith('/music');

  // All Bops pages are fully immersive — they render their own minimal dark header.
  const isBopsSubPage = location.startsWith('/bops/') && !isBopsFeedOnly;
  const isAnyBopsPage = isBopsFeedOnly || isBopsSubPage;

  const showNav = !isAnyBopsPage && !isMusicPage;
  const showFooter = !isAnyBopsPage && !isMusicPage;
  const showMusicPlayer = isMusicPage;

  return (
    <>
      {showNav && <Navigation />}
      <Router />
      {showFooter && <Footer />}
      <ToneyChatbot />
      <CookieConsentBanner />
      {showMusicPlayer && <MusicPlayer />}
    </>
  );
}

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
            <AppShell />
          </TooltipProvider>
        </ThemeProvider>
      </DemoProvider>
    </ErrorBoundary>
  );
}

export default App;
