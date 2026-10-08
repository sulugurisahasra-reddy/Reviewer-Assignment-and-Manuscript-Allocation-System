
from algorithms.kmp import kmp_search


def search_papers_by_keyword(papers, keyword):
    if not keyword or not keyword.strip():
        return []

    keyword = keyword.strip().lower()
    matching_papers = []

    for paper in papers:
        title = paper.get("title", "")
        abstract = paper.get("abstract", "")

        title_matches = kmp_search(title.lower(), keyword)
        abstract_matches = kmp_search(abstract.lower(), keyword)

        if title_matches or abstract_matches:
            paper_result = paper.copy()

            paper_result["title_matches"] = len(title_matches)
            paper_result["abstract_matches"] = len(abstract_matches)

            matching_papers.append(paper_result)

    return matching_papers