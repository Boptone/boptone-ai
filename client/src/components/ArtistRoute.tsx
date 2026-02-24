import { ProtectedRoute } from "./ProtectedRoute";
import { ComponentType } from "react";

interface ArtistRouteProps {
  component: ComponentType<any>;
}

/**
 * ArtistRoute - Wrapper for routes that require artist authentication
 * Usage: <Route path="/dashboard" component={(props) => <ArtistRoute component={Dashboard} {...props} />} />
 */
export function ArtistRoute({ component: Component, ...props }: ArtistRouteProps) {
  return (
    <ProtectedRoute requireArtist={true}>
      <Component {...props} />
    </ProtectedRoute>
  );
}
