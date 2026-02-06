import { Music } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";

/**
 * Phase 1 - Increment 1: Basic Signup Page Structure
 * 
 * This is the foundation of the multi-auth signup flow.
 * Currently displays only the card layout with branding—no functionality yet.
 * 
 * Next increments will add:
 * - Email signup option
 * - Phone signup option
 * - Google/Apple OAuth
 * - Verification code flow
 */
export default function AuthSignup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="rounded-xl w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl">
              Create Your Account
            </CardTitle>
            <CardDescription>
              Join the most powerful infrastructure platform for artists
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            Authentication options coming in next increment...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
