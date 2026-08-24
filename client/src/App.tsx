import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Messages from "@/pages/Messages";
import GamePage from "@/pages/GamePage";
import GamesHub from "@/pages/GamesHub";
import AIAgent from "@/pages/AIAgent";

function Router() { return <Switch><Route path="/welcome" component={Landing} /><Route path="/ai" component={AIAgent} /><Route path="/games" component={GamesHub} /><Route path="/games/:gameId" component={GamePage} /><Route path="/messages/:conversationId" component={Messages} /><Route path="/messages" component={Messages} /><Route path="/" component={Home} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark"><AppSettingsProvider><TooltipProvider><Toaster theme="dark" /><Router /></TooltipProvider></AppSettingsProvider></ThemeProvider></ErrorBoundary>; }
