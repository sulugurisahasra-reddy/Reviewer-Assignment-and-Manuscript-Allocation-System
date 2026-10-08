
import { useEffect, useState } from "react";
import {
  getBackendStatus,
  getAllocationAnalytics,
} from "./api";

import PaperSearch from "./pages/PaperSearch";
import ReviewerAllocation from "./pages/ReviewerAllocation";
import AllocationHistory from "./pages/AllocationHistory";

import {
  Search,
  LayoutDashboard,
  FileText,
  Users,
  GitBranch,
  Settings,
  Bell,
  History,
  RefreshCw,
} from "lucide-react";

function App() {
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  const [analytics, setAnalytics] = useState({
    total_runs: 0,
    total_assigned: 0,
    total_unassigned: 0,
    total_papers_processed: 0,
    matching_efficiency: 0,
  });

  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch backend connection status
  const loadBackendStatus = async () => {
    try {
      const data = await getBackendStatus();
      setBackendStatus(data.status);
      setError("");
    } catch (err) {
      setBackendStatus("Disconnected");
      setError("Unable to connect to backend");
    }
  };

  // Fetch dashboard analytics
  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      const data = await getAllocationAnalytics();

      setAnalytics(data);
      setAnalyticsError("");
    } catch (err) {
      setAnalyticsError("Unable to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load data when the application starts
  useEffect(() => {
    loadBackendStatus();
    loadAnalytics();
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Discover Papers",
      icon: Search,
    },
    {
      name: "Research Papers",
      icon: FileText,
    },
    {
      name: "Reviewers",
      icon: Users,
    },
    {
      name: "Allocation",
      icon: GitBranch,
    },
    {
      name: "Allocation History",
      icon: History,
    },
    {
      name: "Settings",
      icon: Settings,
    },
  ];

  const summaryCards = [
    {
      title: "Papers Processed",
      value: analytics.total_papers_processed,
      description: "Papers included in allocations",
    },
    {
      title: "Allocation Runs",
      value: analytics.total_runs,
      description: "Total allocation operations",
    },
    {
      title: "Successful Matches",
      value: analytics.total_assigned,
      description: "Assignments completed",
    },
    {
      title: "Matching Efficiency",
      value: '${analytics.matching_efficiency}%',
      description: "Overall allocation efficiency",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">

        <h1 className="text-2xl font-bold mb-10">
          ScholarMatch{" "}
          <span className="text-violet-400">AI</span>
        </h1>

        <nav className="space-y-3">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => setActivePage(item.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
  activePage === item.name
    ? "bg-violet-600"
    : "hover:bg-slate-800"
}`}
              >
                <Icon size={20} />
                {item.name}
              </button>
            );
          })}

        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">

        {/* DASHBOARD */}
        {activePage === "Dashboard" && (
          <>
            {/* HEADER */}
            <header className="flex justify-between items-center mb-10">

              <div>
                <h2 className="text-3xl font-bold">
                  Dashboard
                </h2>

                <p className="text-slate-500 mt-2">
                  Research discovery and reviewer allocation overview
                </p>
              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() => {
                    loadBackendStatus();
                    loadAnalytics();
                  }}
                  className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50"
                  title="Refresh dashboard"
                >
                  <RefreshCw size={20} />
                </button>

                <button
                  className="p-3 bg-white rounded-full shadow-sm"
                  title="Notifications"
                >
                  <Bell size={20} />
                </button>

              </div>
            </header>

            {/* BACKEND CONNECTION */}
            <section className="mb-8 bg-white p-5 rounded-xl shadow-sm">

              <h3 className="font-bold text-lg mb-2">
                Backend Connection
              </h3>

              {error ? (
                <p className="text-red-600">
                  {error}
                </p>
              ) : (
                <p
                  className={
                    backendStatus === "connected"
                      ? "text-green-600"
                      : "text-amber-600"
                  }
                >
                  {backendStatus}
                </p>
              )}

            </section>

            {/* ANALYTICS ERROR */}
            {analyticsError && (
              <section className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-600">
                  {analyticsError}
                </p>
              </section>
            )}

            {/* SUMMARY CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {summaryCards.map((card) => (

                <div
                  key={card.title}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >

                  <p className="text-slate-500">
                    {card.title}
                  </p>

                  <h3 className="text-3xl font-bold mt-3">
                    {analyticsLoading ? "..." : card.value}
                  </h3>

                  <p className="text-sm text-slate-400 mt-2">
                    {card.description}
                  </p>

                </div>

              ))}

            </section>

            {/* ALLOCATION OVERVIEW */}
            <section className="mt-8 bg-white p-6 rounded-xl shadow-sm">

              <h3 className="text-xl font-bold mb-5">
                Allocation Overview
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-violet-50 p-5 rounded-xl">
                  <p className="text-slate-600">
                    Assigned Papers
                  </p>

                  <h4 className="text-2xl font-bold text-violet-700 mt-2">
                    {analyticsLoading ? "..." : analytics.total_assigned}
                  </h4>
                </div>

                <div className="bg-orange-50 p-5 rounded-xl">
                  <p className="text-slate-600">
                    Unassigned Papers
                  </p>

                  <h4 className="text-2xl font-bold text-orange-600 mt-2">
                    {analyticsLoading ? "..." : analytics.total_unassigned}
                  </h4>
                </div>

              </div>
{/* EFFICIENCY BAR */}
<div className="mt-6">
  <div className="flex justify-between mb-2">
    <p className="text-slate-600 font-medium">
      Matching Efficiency
    </p>

    <p className="font-bold">
      {analyticsLoading
        ? "..."
        : `${analytics.matching_efficiency}%`}
    </p>
  </div>

  <div className="w-full bg-slate-200 rounded-full h-3">
    <div
      className="bg-violet-600 h-3 rounded-full transition-all duration-500"
      style={{
        width: `${Math.min(
          100,
          Math.max(0, analytics.matching_efficiency)
        )}%`,
      }}
    />
  </div>
</div>

            </section>

            {/* WELCOME */}
            <section className="mt-8 bg-white p-8 rounded-xl shadow-sm">

              <h3 className="text-xl font-bold mb-3">
                Welcome to ScholarMatch AI
              </h3>

              <p className="text-slate-600 leading-relaxed">
                Discover research papers using real academic data,
                find relevant reviewers through similarity analysis,
                and visualize reviewer allocation using graph algorithms.
              </p>

            </section>
          </>
        )}

        {/* PAPER SEARCH */}
        {activePage === "Discover Papers" && (
          <PaperSearch />
        )}

        {/* ALLOCATION */}
        {activePage === "Allocation" && (
          <ReviewerAllocation />
        )}

        {/* ALLOCATION HISTORY */}
        {activePage === "Allocation History" && (
          <AllocationHistory />
        )}

        {/* OTHER PAGES */}
        {activePage !== "Dashboard" &&
          activePage !== "Discover Papers" &&
          activePage !== "Allocation" &&
          activePage !== "Allocation History" && (

          <section className="bg-white p-8 rounded-xl shadow-sm">

            <h2 className="text-2xl font-bold mb-2">
              {activePage}
            </h2>

            <p className="text-slate-600">
              This section will be implemented in a later step.
            </p>

          </section>
        )}

      </main>

    </div>
  );
}

export default App;
