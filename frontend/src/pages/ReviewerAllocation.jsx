
import { useState } from "react";
import { allocatePapers, allocateWithCapacity } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

function ReviewerAllocation() {
  const [papers, setPapers] = useState([
    { id: 1, title: "", abstract: "" },
  ]);

  const [reviewers, setReviewers] = useState([
    { id: 101, name: "", interests: "", capacity: 1 },
  ]);

  const [method, setMethod] = useState("capacity");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updatePaper = (index, field, value) => {
    setPapers((prev) =>
      prev.map((paper, i) =>
        i === index ? { ...paper, [field]: value } : paper
      )
    );
    setResults(null);
  };

  const updateReviewer = (index, field, value) => {
    setReviewers((prev) =>
      prev.map((reviewer, i) =>
        i === index ? { ...reviewer, [field]: value } : reviewer
      )
    );
    setResults(null);
  };

  const addPaper = () => {
    setPapers((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), title: "", abstract: "" },
    ]);
    setResults(null);
    setError("");
  };

  const removePaper = (id) => {
    if (papers.length === 1) return;
    setPapers((prev) => prev.filter((paper) => paper.id !== id));
    setResults(null);
    setError("");
  };

  const addReviewer = () => {
    setReviewers((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: "",
        interests: "",
        capacity: 1,
      },
    ]);
    setResults(null);
    setError("");
  };

  const removeReviewer = (id) => {
    if (reviewers.length === 1) return;
    setReviewers((prev) =>
      prev.filter((reviewer) => reviewer.id !== id)
    );
    setResults(null);
    setError("");
  };

  const exportResults = () => {
    if (!results) return;

    const headers = ["Paper", "Reviewer", "Similarity"];
    const rows = results.assignments.map((item) => [
      item.paper_title,
      item.reviewer_name,
      `${(item.similarity_score * 100).toFixed(2)}%`,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "scholarmatch_allocation_results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAllocation = async () => {
    setError("");
    setResults(null);

    if (
      papers.some((paper) => !paper.title.trim()) ||
      reviewers.some(
        (reviewer) =>
          !reviewer.name.trim() ||
          !reviewer.interests.trim() ||
          !Number.isInteger(Number(reviewer.capacity)) ||
          Number(reviewer.capacity) < 1
      )
    ) {
      setError(
        "Please fill in all paper titles and reviewer details. Capacity must be a positive whole number."
      );
      return;
    }

    setLoading(true);

    try {
      const formattedPapers = papers.map((paper) => ({
        ...paper,
        id: Number(paper.id),
      }));

      const formattedReviewers = reviewers.map((reviewer) => ({
        ...reviewer,
        id: Number(reviewer.id),
        capacity: Number(reviewer.capacity),
      }));

      const response =
        method === "capacity"
          ? await allocateWithCapacity(
              formattedPapers,
              formattedReviewers
            )
          : await allocatePapers(
              formattedPapers,
              formattedReviewers
            );

      let finalResults;

      if (method === "capacity") {
        const assignments = response.assignments ?? [];
        const unassignedPapers =
          response.unassigned_papers ??
          formattedPapers
            .filter(
              (paper) =>
                !assignments.some(
                  (item) => item.paper_id === paper.id
                )
            )
            .map((paper) => ({
              paper_id: paper.id,
              paper_title: paper.title,
            }));

        finalResults = {
          total_assigned: response.total_assigned ?? assignments.length,
          total_unassigned: unassignedPapers.length,
          assignments,
          unassigned_papers: unassignedPapers,
        };
      } else {
        const assignments = Array.isArray(response) ? response : [];
        const unassignedPapers = formattedPapers
          .filter(
            (paper) =>
              !assignments.some(
                (item) => item.paper_id === paper.id
              )
          )
          .map((paper) => ({
            paper_id: paper.id,
            paper_title: paper.title,
          }));

        finalResults = {
          total_assigned: assignments.length,
          total_unassigned: unassignedPapers.length,
          assignments,
          unassigned_papers: unassignedPapers,
        };
      }

      setResults(finalResults);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to allocate papers. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const workloadData = results
    ? reviewers.map((reviewer) => ({
        name: reviewer.name,
        assigned: results.assignments.filter(
          (item) => item.reviewer_name === reviewer.name
        ).length,
        capacity: Number(reviewer.capacity),
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">
        Reviewer Allocation
      </h1>

      <p className="mb-6 text-gray-600">
        Match research papers with suitable reviewers.
      </p>

      {/* Research Papers */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Research Papers
        </h2>

        {papers.map((paper, index) => (
          <div key={paper.id} className="mb-5 border-b pb-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-medium">
                Paper {index + 1} Title
              </label>

              <button
                type="button"
                onClick={() => removePaper(paper.id)}
                disabled={papers.length === 1 || loading}
                className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove Paper
              </button>
            </div>

            <input
              className="mb-3 w-full rounded-lg border p-2"
              value={paper.title}
              onChange={(e) =>
                updatePaper(index, "title", e.target.value)
              }
              placeholder="Enter research paper title"
            />

            <label className="mb-1 block font-medium">
              Abstract
            </label>

            <textarea
              className="w-full rounded-lg border p-2"
              rows="3"
              value={paper.abstract}
              onChange={(e) =>
                updatePaper(index, "abstract", e.target.value)
              }
              placeholder="Enter paper abstract"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addPaper}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Add Paper
        </button>
      </div>

      {/* Reviewers */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Reviewers
        </h2>

        {reviewers.map((reviewer, index) => (
          <div key={reviewer.id} className="mb-5 border-b pb-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-medium">
                Reviewer {index + 1} Name
              </label>

              <button
                type="button"
                onClick={() => removeReviewer(reviewer.id)}
                disabled={reviewers.length === 1 || loading}
                className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove Reviewer
              </button>
            </div>

            <input
              className="mb-3 w-full rounded-lg border p-2"
              value={reviewer.name}
              onChange={(e) =>
                updateReviewer(index, "name", e.target.value)
              }
              placeholder="Enter reviewer name"
            />

            <label className="mb-1 block font-medium">
              Research Interests
            </label>

            <input
              className="mb-3 w-full rounded-lg border p-2"
              value={reviewer.interests}
              onChange={(e) =>
                updateReviewer(index, "interests", e.target.value)
              }
              placeholder="e.g. Machine learning, AI"
            />

            <label className="mb-1 block font-medium">
              Maximum Paper Capacity
            </label>

            <input
              type="number"
              min="1"
              step="1"
              className="w-full rounded-lg border p-2"
              value={reviewer.capacity}
              onChange={(e) =>
                updateReviewer(index, "capacity", e.target.value)
              }
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addReviewer}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Add Reviewer
        </button>
      </div>

      {/* Allocation Method */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 text-xl font-semibold">
          Allocation Method
        </h2>

        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            setResults(null);
          }}
          className="w-full rounded-lg border p-2"
        >
          <option value="capacity">
            Capacity-Based Allocation (Edmonds-Karp)
          </option>
          <option value="matching">
            One-to-One Matching (Bipartite Matching)
          </option>
        </select>
      </div>

      {/* Allocate Button */}
      <button
        onClick={handleAllocation}
        disabled={loading}
        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Allocating..." : "Allocate Papers"}
      </button>

      {error && (
        <p className="mt-4 text-red-600">{error}</p>
      )}

      {/* Results */}
      {results && (
        <div className="mt-8 rounded-xl bg-white p-5 shadow">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-800">
              Allocation Results
            </h2>

            <button
              onClick={exportResults}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              Export Results as CSV
            </button>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-gray-600">Total Papers</p>
              <h3 className="text-2xl font-bold text-blue-700">
                {papers.length}
              </h3>
            </div>

            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm text-gray-600">Total Reviewers</p>
              <h3 className="text-2xl font-bold text-purple-700">
                {reviewers.length}
              </h3>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-600">Assigned Papers</p>
              <h3 className="text-2xl font-bold text-green-700">
                {results.total_assigned}
              </h3>
            </div>

            <div className="rounded-lg bg-orange-50 p-4">
              <p className="text-sm text-gray-600">Unassigned Papers</p>
              <h3 className="text-2xl font-bold text-orange-700">
                {results.total_unassigned}
              </h3>
            </div>
          </div>

          {/* Assigned Papers */}
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Assigned Papers
          </h3>

          {results.assignments.length === 0 ? (
            <p className="mb-6 text-gray-600">
              No compatible assignments found.
            </p>
          ) : (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="p-3">Paper</th>
                    <th className="p-3">Reviewer</th>
                    <th className="p-3">Similarity</th>
                  </tr>
                </thead>

                <tbody>
                  {results.assignments.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{item.paper_title}</td>
                      <td className="p-3">{item.reviewer_name}</td>
                      <td className="p-3">
                        {(item.similarity_score * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Unassigned Papers */}
          {results.unassigned_papers.length > 0 && (
            <div className="mb-8 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-orange-800">
                Unassigned Papers
              </h3>

              <p className="mb-3 text-sm text-orange-700">
                These papers could not be assigned with the available
                reviewer compatibility and capacity.
              </p>

              <ul className="list-inside list-disc space-y-2 text-gray-800">
                {results.unassigned_papers.map((paper, index) => (
                  <li key={paper.paper_id ?? index}>
                    {paper.paper_title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviewer Workload Chart */}
          {results.assignments.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Reviewer Workload
              </h3>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />

                    <Bar
                      dataKey="assigned"
                      fill="#2563eb"
                      name="Assigned Papers"
                    />

                    <Bar
                      dataKey="capacity"
                      fill="#a78bfa"
                      name="Maximum Capacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewerAllocation;
