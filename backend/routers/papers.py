
from fastapi import APIRouter, Query, HTTPException
from services.openalex_service import search_papers
from services.keyword_search import search_papers_by_keyword
router = APIRouter()


@router.get("/papers")
def get_papers(
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50)
):
    try:
        papers = search_papers(query, limit)

        return {
            "query": query,
            "total": len(papers),
            "papers": papers
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error)
        )


@router.get("/papers/keyword")
def keyword_search(
    query: str = Query(..., min_length=1),
    keyword: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50)
):
    try:
        # Fetch more papers first so KMP has enough papers to search
        papers = search_papers(query, 50)

        matching_papers = search_papers_by_keyword(
            papers, keyword
        )

        # Return only the requested number of matches
        matching_papers = matching_papers[:limit]

        return {
            "query": query,
            "keyword": keyword,
            "total": len(matching_papers),
            "papers": matching_papers
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error)
        )