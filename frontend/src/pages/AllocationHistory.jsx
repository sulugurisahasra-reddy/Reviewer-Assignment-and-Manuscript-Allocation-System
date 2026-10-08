
import { useEffect, useState } from "react";
import { getAllocationHistory, getAllocationDetails } from "../api";
import {
  History,
  RefreshCw,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
} from "lucide-react";

export default function AllocationHistory() {
  const [history, setHistory] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllocationHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message || "Could not load allocation history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const viewDetails = async (run) => {
    setSelectedRun(run);
    setDetailsLoading(true);
    setError("");

    try {
      const data = await getAllocationDetails(run.id);
      setDetails(data.results || []);
    } catch (err) {
      setError(err.message || "Could not load allocation details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const goBack = () => {
    setSelectedRun(null);
    setDetails([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <History className="text-cyan-400" size={30} />
              <h1 className="text-3xl font-bold">
                Allocation History
              </h1>
            </div>
            <p className="text-slate-400">
              View and review your previous reviewer allocations.
            </p>
          </div>

          <button
            onClick={selectedRun ? goBack : loadHistory}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 transition"
          >
            {selectedRun ? (
              <>
                <ArrowLeft size={18} />
                Back to History
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Refresh
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {selectedRun ? (
          <div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Allocation Run #{selectedRun.id}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-slate-800 p-4">
                  <p className="text-slate-400 text-sm">Method</p>
                  <p className="text-lg font-semibold capitalize">
                    {selectedRun.method}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-800 p-4">
                  <p className="text-slate-400 text-sm">Assigned</p>
                  <p className="text-lg font-semibold text-green-400">
                    {selectedRun.total_assigned}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-800 p-4">
                  <p className="text-slate-400 text-sm">Unassigned</p>
                  <p className="text-lg font-semibold text-amber-400">
                    {selectedRun.total_unassigned}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400 mt-4">
                Created: {new Date(selectedRun.created_at).toLocaleString()}
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-4">
              Paper Allocation Details
            </h3>

            {detailsLoading ? (
              <p className="text-slate-400">Loading details...</p>
            ) : details.length === 0 ? (
              <p className="text-slate-400">
                No paper details were saved for this run.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-4">Paper</th>
                      <th className="p-4">Reviewer</th>
                      <th className="p-4">Similarity</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {details.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-800"
                      >
                        <td className="p-4 font-medium">
                          {item.paper_title}
                        </td>
                        <td className="p-4 text-slate-300">
                          {item.reviewer_name || "—"}
                        </td>
                        <td className="p-4 text-slate-300">
                          {item.similarity_score != null
                            ? Number(item.similarity_score).toFixed(4)
                            : "—"}
                        </td>
                        <td className="p-4">
                          {item.status === "assigned" ? (
                            <span className="inline-flex items-center gap-1 text-green-400">
                              <CheckCircle size={16} />
                              Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400">
                              <AlertCircle size={16} />
                              Unassigned
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-slate-400">
            Loading allocation history...
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
            <History size={42} className="mx-auto text-slate-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No allocation history yet
            </h2>
            <p className="text-slate-400">
              Run an allocation to see it recorded here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((run) => (
              <div
                key={run.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="text-cyan-400" size={20} />
                    <h2 className="font-semibold text-lg">
                      Allocation Run #{run.id}
                    </h2>
                  </div>

                  <p className="text-sm text-slate-400 capitalize mb-3">
                    Method: {run.method}
                  </p>

                  <p className="text-sm text-slate-500">
                    {new Date(run.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={17} />
                    <span>{run.total_assigned} assigned</span>
                  </div>

                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertCircle size={17} />
                    <span>{run.total_unassigned} unassigned</span>
                  </div>

                  <button
                    onClick={() => viewDetails(run)}
                    className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 font-medium transition"
                  >
                    <Eye size={17} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

