/**
 * This page will be shown briefly while the layout redirects to the appropriate role-based dashboard
 */
export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-semibold mb-2">Redirecting to your dashboard...</h1>
        <p className="text-muted-foreground">Please wait while we load your personalized dashboard.</p>
      </div>
    </div>
  );
} 