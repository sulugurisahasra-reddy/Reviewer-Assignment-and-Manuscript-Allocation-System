
from db_connection import get_connection


def save_allocation_history(method, result):
    conn = get_connection()

    try:
        cursor = conn.cursor()

        assignments = result.get("assignments", [])
        unassigned = result.get("unassigned_papers", [])

        # Save the allocation run.
        cursor.execute(
            """
            INSERT INTO allocation_runs
                (method, total_assigned, total_unassigned)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (method, len(assignments), len(unassigned))
        )

        run_id = cursor.fetchone()[0]

        # Save assigned papers.
        for item in assignments:
            cursor.execute(
                """
                INSERT INTO allocation_results
                    (run_id, paper_id, paper_title, reviewer_id,
                     reviewer_name, similarity_score, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    run_id,
                    item.get("paper_id", 0),
                    item.get("paper_title", "Untitled paper"),
                    item.get("reviewer_id"),
                    item.get("reviewer_name"),
                    item.get("similarity_score"),
                    "assigned"
                )
            )

        # Save unassigned papers.
        for paper in unassigned:
            if isinstance(paper, dict):
                paper_id = paper.get("id", paper.get("paper_id", 0))
                paper_title = paper.get("title", paper.get("paper_title", "Untitled paper"))
            else:
                paper_id = 0
                paper_title = str(paper)

            cursor.execute(
                """
                INSERT INTO allocation_results
                    (run_id, paper_id, paper_title, status)
                VALUES (%s, %s, %s, %s)
                """,
                (run_id, paper_id, paper_title, "unassigned")
            )

        conn.commit()
        return run_id

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


def get_allocation_history():
    conn = get_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, method, total_assigned,
                   total_unassigned, created_at
            FROM allocation_runs
            ORDER BY created_at DESC
            """
        )

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "method": row[1],
                "total_assigned": row[2],
                "total_unassigned": row[3],
                "created_at": row[4].isoformat()
            }
            for row in rows
        ]

    finally:
        conn.close()


def get_allocation_details(run_id):
    conn = get_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id, paper_id, paper_title, reviewer_id,
                   reviewer_name, similarity_score, status
            FROM allocation_results
            WHERE run_id = %s
            ORDER BY id
            """,
            (run_id,)
        )

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "paper_id": row[1],
                "paper_title": row[2],
                "reviewer_id": row[3],
                "reviewer_name": row[4],
                "similarity_score": row[5],
                "status": row[6]
            }
            for row in rows
        ]

    finally:
        conn.close()
