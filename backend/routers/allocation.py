
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from db_connection import get_connection
from services.paper_allocation import allocate_papers
from services.capacity_allocation import allocate_with_capacity
from services.history_service import (
    save_allocation_history,
    get_allocation_history,
    get_allocation_details
)

router = APIRouter(prefix="/allocation", tags=["Allocation"])


class Paper(BaseModel):
    id: int
    title: str
    abstract: str = ""


class Reviewer(BaseModel):
    id: int
    name: str
    interests: str
    capacity: int = 1


class AllocationRequest(BaseModel):
    papers: List[Paper]
    reviewers: List[Reviewer]


@router.post("/matching")
def matching_allocation(request: AllocationRequest):
    papers = [paper.model_dump() for paper in request.papers]
    reviewers = [reviewer.model_dump() for reviewer in request.reviewers]

    result = allocate_papers(papers, reviewers)

    assignments = (
        result if isinstance(result, list)
        else result.get("assignments", [])
    )

    assigned_ids = {
        item.get("paper_id")
        for item in assignments
        if item.get("paper_id") is not None
    }

    unassigned = [
        paper for paper in papers
        if paper["id"] not in assigned_ids
    ]

    history_result = {
        "assignments": assignments,
        "unassigned_papers": unassigned
    }

    try:
        save_allocation_history("matching", history_result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Allocation completed, but saving history failed: {str(e)}"
        )

    return result


@router.post("/capacity")
def capacity_allocation(request: AllocationRequest):
    papers = [paper.model_dump() for paper in request.papers]
    reviewers = [reviewer.model_dump() for reviewer in request.reviewers]

    result = allocate_with_capacity(papers, reviewers)

    try:
        save_allocation_history("capacity", result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Allocation completed, but saving history failed: {str(e)}"
        )

    return result


@router.get("/history")
def allocation_history():
    try:
        return get_allocation_history()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve allocation history: {str(e)}"
        )


@router.get("/history/{run_id}")
def allocation_history_details(run_id: int):
    try:
        history = get_allocation_history()

        matching_run = next(
            (run for run in history if run["id"] == run_id),
            None
        )

        if matching_run is None:
            raise HTTPException(
                status_code=404,
                detail="Allocation run not found"
            )

        details = get_allocation_details(run_id)

        return {
            "run": matching_run,
            "results": details
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not retrieve allocation details: {str(e)}"
        )


# DASHBOARD ANALYTICS
@router.get("/analytics")
def allocation_analytics():
    conn = get_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_runs,
                COALESCE(SUM(total_assigned), 0) AS total_assigned,
                COALESCE(SUM(total_unassigned), 0) AS total_unassigned
            FROM allocation_runs
            """
        )

        row = cursor.fetchone()

        total_runs = row[0]
        total_assigned = row[1]
        total_unassigned = row[2]

        total_papers = total_assigned + total_unassigned

        efficiency = (
            round((total_assigned / total_papers) * 100, 2)
            if total_papers > 0
            else 0
        )

        return {
            "total_runs": total_runs,
            "total_assigned": total_assigned,
            "total_unassigned": total_unassigned,
            "total_papers_processed": total_papers,
            "matching_efficiency": efficiency
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not calculate analytics: {str(e)}"
        )

    finally:
        conn.close()
