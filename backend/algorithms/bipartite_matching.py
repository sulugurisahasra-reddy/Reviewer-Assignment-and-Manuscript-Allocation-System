def maximum_bipartite_matching(graph, num_reviewers):
    """
    Find the maximum matching between papers and reviewers.

    graph: Dictionary where each paper index maps to a list
           of compatible reviewer indices.
    num_reviewers: Total number of reviewers.

    Returns: Dictionary mapping paper indices to reviewer indices.
    """
    reviewer_to_paper = [-1] * num_reviewers

    def assign(paper, visited):
        for reviewer in graph.get(paper, []):
            if visited[reviewer]:
                continue

            visited[reviewer] = True

            if reviewer_to_paper[reviewer] == -1 or assign(
                reviewer_to_paper[reviewer], visited
            ):
                reviewer_to_paper[reviewer] = paper
                return True

        return False

    for paper in graph:
        visited = [False] * num_reviewers
        assign(paper, visited)

    paper_to_reviewer = {}

    for reviewer, paper in enumerate(reviewer_to_paper):
        if paper != -1:
            paper_to_reviewer[paper] = reviewer

    return paper_to_reviewer