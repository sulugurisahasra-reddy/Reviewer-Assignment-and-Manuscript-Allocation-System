
from algorithms.cosine_similarity import cosine_similarity
from algorithms.edmonds_karp import edmonds_karp


def allocate_with_capacity(papers, reviewers, threshold=0.1):
    """
    Allocate papers to reviewers using maximum flow.

    Each paper is assigned to at most one reviewer.
    Each reviewer can receive multiple papers up to capacity.
    Unassigned papers are also returned.
    """
    paper_count = len(papers)
    reviewer_count = len(reviewers)

    source = 0
    paper_start = 1
    reviewer_start = paper_start + paper_count
    sink = reviewer_start + reviewer_count

    node_count = sink + 1
    graph = [[0] * node_count for _ in range(node_count)]

    scores = {}

    # Source to papers.
    for i in range(paper_count):
        graph[source][paper_start + i] = 1

    # Papers to compatible reviewers.
    for i, paper in enumerate(papers):
        paper_text = (
            paper.get("title", "") + " " + paper.get("abstract", "")
        ).strip()

        for j, reviewer in enumerate(reviewers):
            interests = reviewer.get("interests", "")
            score = cosine_similarity(paper_text, interests)

            if score >= threshold:
                graph[paper_start + i][reviewer_start + j] = 1
                scores[(i, j)] = score

    # Reviewers to sink, using their capacity.
    for j, reviewer in enumerate(reviewers):
        capacity = max(0, int(reviewer.get("capacity", 1)))
        graph[reviewer_start + j][sink] = capacity

    # Run maximum flow.
    max_flow, residual = edmonds_karp(
        graph, source, sink, return_residual=True
    )

    assignments = []
    assigned_paper_indices = set()

    # Extract assignments from used paper-reviewer edges.
    for i, paper in enumerate(papers):
        paper_node = paper_start + i

        for j, reviewer in enumerate(reviewers):
            reviewer_node = reviewer_start + j

            if (
                graph[paper_node][reviewer_node] == 1
                and residual[paper_node][reviewer_node] == 0
            ):
                assignments.append({
                    "paper_id": paper.get("id"),
                    "paper_title": paper.get("title"),
                    "reviewer_id": reviewer.get("id"),
                    "reviewer_name": reviewer.get("name"),
                    "similarity_score": scores[(i, j)]
                })

                assigned_paper_indices.add(i)
                break

    # Identify papers that were not assigned.
    unassigned_papers = [
        {
            "paper_id": paper.get("id"),
            "paper_title": paper.get("title")
        }
        for i, paper in enumerate(papers)
        if i not in assigned_paper_indices
    ]

    return {
        "total_assigned": max_flow,
        "total_unassigned": len(unassigned_papers),
        "assignments": assignments,
        "unassigned_papers": unassigned_papers
    }
