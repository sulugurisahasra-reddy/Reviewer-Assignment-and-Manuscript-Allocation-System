import { useState } from "react";
import { Search } from "lucide-react";
import { searchPapers, keywordSearchPapers } from "../api";

function PaperSearch() {
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchMode, setSearchMode] = useState("normal");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a research topic.");
      return;
    }

    if (searchMode === "keyword" && !keyword.trim()) {
      setError("Please enter a keyword for KMP search.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPapers([]);

      let data;

      if (searchMode === "keyword") {
        data = await keywordSearchPapers(query, keyword, 10);
      } else {
        data = await searchPapers(query, 10);
      }

      console.log("API response:", data);
      console.log("Papers received:", data.papers);

      setPapers(data.papers || []);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch papers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Convert DOI / Springer DOI URL into a proper DOI URL
  const getDoiUrl = (doi) => {
    if (!doi) {
      return null;
    }

    // If it is already a doi.org URL
    if (doi.includes("doi.org/")) {
      return doi;
    }

    // If backend returns a Springer URL like:
    // https://link.springer.com/10.1007/xxxxx
    if (doi.includes("link.springer.com/")) {
      const doiPart = doi.split("link.springer.com/")[1];

      return `https://doi.org/${doiPart}`;
    }

    // If backend returns only:
    // 10.1007/xxxxx
    if (doi.startsWith("10.")) {
      return `https://doi.org/${doi}`;
    }

    // Fallback
    return doi;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">
        Research Paper Search
      </h1>

      <p className="text-gray-500 mb-6">
        Discover papers using OpenAlex and filter them using KMP.
      </p>

      {/* Search Mode */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setSearchMode("normal")}
          className={`px-4 py-2 rounded-lg ${
            searchMode === "normal"
              ? "bg-violet-600 text-white"
              : "bg-white border"
          }`}
        >
          Normal Search
        </button>

        <button
          type="button"
          onClick={() => setSearchMode("keyword")}
          className={`px-4 py-2 rounded-lg ${
            searchMode === "keyword"
              ? "bg-violet-600 text-white"
              : "bg-white border"
          }`}
        >
          KMP Keyword Search
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Research topic, e.g. machine learning"
          className="w-full border rounded-lg px-4 py-3"
        />

        {searchMode === "keyword" && (
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Keyword, e.g. neural"
            className="w-full border rounded-lg px-4 py-3"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Search size={18} />
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p className="text-red-600 mb-4">
          {error}
        </p>
      )}

      <p className="text-slate-500 mb-4">
        {papers.length} paper(s) found
      </p>

      {/* Paper Results */}
      <div className="space-y-4">
        {papers.map((paper, index) => {
          const doiUrl = getDoiUrl(paper.doi);

          return (
            <div
              key={paper.id || index}
              className="border rounded-xl p-5 shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold mb-2">
                {paper.title}
              </h2>

              <p className="text-gray-600 mb-2">
                {paper.authors?.join(", ") || "Authors unavailable"}
              </p>

              <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                <span>
                  Year: {paper.year || "Unknown"}
                </span>

                <span>
                  Citations: {paper.cited_by_count}
                </span>
              </div>

              {searchMode === "keyword" && (
                <p className="text-sm text-violet-700 mt-3">
                  Title matches: {paper.title_matches} |
                  Abstract matches: {paper.abstract_matches}
                </p>
              )}

              {paper.abstract && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-4">
                  {paper.abstract}
                </p>
              )}

              {doiUrl && (
                <a
                  href={doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm mt-3 inline-block"
                >
                  View DOI
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PaperSearch;