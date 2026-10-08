
from db_connection import get_connection

try:
    conn = get_connection()
    print("Database connected successfully!")

    cursor = conn.cursor()
    cursor.execute("SELECT current_database();")
    print("Database:", cursor.fetchone()[0])

    cursor.close()
    conn.close()

except Exception as e:
    print("Database connection failed:", e)
