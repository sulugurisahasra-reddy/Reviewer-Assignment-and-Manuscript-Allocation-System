from algorithms.bipartite_matching import maximum_bipartite_matching
from algorithms.cosine_similarity import cosine_similarity


def allocate_papers(papers, reviewers, threshold=0.1):
    """
    Allocate papers to reviewers using cosine similarity
    and bipartite matching.

    Each paper and reviewer should be a dictionary.

    Papers: id, title, abstract
    Reviewers: id, name, interests
    """
    graph = {}
    similarity_scores = {}

    # Step 1: Find compatible reviewers for each paper.
    for paper_index, paper in enumerate(papers):
        paper_text = (
            paper.get("title", "") + " " + paper.get("abstract", "")
        ).strip()

        graph[paper_index] = []

        for reviewer_index, reviewer in enumerate(reviewers):
            interests = reviewer.get("interests", "")

            score = cosine_similarity(paper_text, interests)

            if score >= threshold:
                graph[paper_index].append(reviewer_index)
                similarity_scores[(paper_index, reviewer_index)] = score

    # Step 2: Assign papers to reviewers.
    matching = maximum_bipartite_matching(graph, len(reviewers))

    # Step 3: Prepare the final assignments.
    assignments = []

    for paper_index, reviewer_index in matching.items():
        assignments.append({
            "paper_id": papers[paper_index].get("id"),
            "paper_title": papers[paper_index].get("title"),
            "reviewer_id": reviewers[reviewer_index].get("id"),
            "reviewer_name": reviewers[reviewer_index].get("name"),
            "similarity_score": similarity_scores[
                (paper_index, reviewer_index)
            ]
        })

    return assignments