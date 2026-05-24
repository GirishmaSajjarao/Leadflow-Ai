import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
