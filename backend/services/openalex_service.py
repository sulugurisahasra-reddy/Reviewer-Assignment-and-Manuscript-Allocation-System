import requests

OPENALEX_URL = "https://api.openalex.org/works"


def reconstruct_abstract(inverted_index):
    if not inverted_index:
        return ""

    words = {}

    for word, positions in inverted_index.items():
        for position in positions:
            words[position] = word

    return " ".join(
        words[position]
        for position in sorted(words)
    )


def search_papers(query, limit=10):
    if not query or not query.strip():
        return []

    params = {
        "search": query.strip(),
        "per_page": limit,
    }

    try:
        response = requests.get(
            OPENALEX_URL,
            params=params,
            timeout=15
        )

        response.raise_for_status()

        data = response.json()
        papers = []

        for work in data.get("results", []):
            authors = []

            for authorship in work.get("authorships", []):
                author = authorship.get("author", {})
                name = author.get("display_name")

                if name:
                    authors.append(name)

            abstract = reconstruct_abstract(
                work.get("abstract_inverted_index")
            )

            paper = {
                "id": work.get("id"),
                "title": work.get("title") or "Untitled",
                "authors": authors,
                "year": work.get("publication_year"),
                "doi": work.get("doi"),
                "cited_by_count": work.get(
                    "cited_by_count", 0
                ),
                "openalex_url": work.get("id"),
                "abstract": abstract,
            }

            papers.append(paper)

        return papers

    except requests.RequestException as error:
        raise RuntimeError(
            f"OpenAlex request failed: {error}"
        ) from error