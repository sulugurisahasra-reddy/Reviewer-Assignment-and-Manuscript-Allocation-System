
from algorithms.cosine_similarity import cosine_similarity


def rank_reviewers(paper_text, reviewers):
    """
    Rank reviewers based on similarity to a research paper.

    Each reviewer should be a dictionary containing:
    id, name, and interests.
    """
    results = []

    for reviewer in reviewers:
        interests = reviewer.get("interests", "")

        score = cosine_similarity(paper_text, interests)

        results.append({
            "id": reviewer.get("id"),
            "name": reviewer.get("name"),
            "interests": interests,
            "similarity_score": score
        })

    results.sort(
        key=lambda reviewer: reviewer["similarity_score"],
        reverse=True
    )

    return results