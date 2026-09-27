from flask import Flask, render_template, request, jsonify
from database import create_table, get_db_connection

app = Flask(__name__)


# ==========================================
# HOME PAGE
# ==========================================

@app.route("/")
def home():
    return render_template("index.html")


# ==========================================
# ADMIN PAGE
# ==========================================

@app.route("/admin")
def admin():
    return render_template("admin.html")


# ==========================================
# CREATE TOKEN
# ==========================================

@app.route("/api/token", methods=["POST"])
def create_token():

    data = request.get_json()

    location = data["location"]
    service = data["service"]

    connection = get_db_connection()

    # Count waiting customers for the same
    # location and service
    cursor = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM tokens
        WHERE location = ?
        AND service = ?
        AND status = 'Waiting'
        """,
        (location, service)
    )

    people_ahead = cursor.fetchone()["count"]

    token_number = people_ahead + 1

    token = f"T{token_number:03d}"

    connection.execute(
        """
        INSERT INTO tokens
        (token, location, service, status)
        VALUES (?, ?, ?, ?)
        """,
        (
            token,
            location,
            service,
            "Waiting"
        )
    )

    connection.commit()
    connection.close()

    wait_time = people_ahead * 5

    return jsonify({
        "token": token,
        "people_ahead": people_ahead,
        "wait_time": wait_time
    })


# ==========================================
# GET WAITING QUEUE
# ==========================================

@app.route("/api/queue", methods=["GET"])
def get_queue():

    location = request.args.get("location")

    connection = get_db_connection()

    rows = connection.execute(
        """
        SELECT *
        FROM tokens
        WHERE location = ?
        AND status = 'Waiting'
        ORDER BY id ASC
        """,
        (location,)
    ).fetchall()

    connection.close()

    queue = []

    for row in rows:

        queue.append({
            "id": row["id"],
            "token": row["token"],
            "location": row["location"],
            "service": row["service"],
            "status": row["status"]
        })

    return jsonify(queue)


# ==========================================
# GET CURRENT SERVING TOKEN
# ==========================================

@app.route("/api/current", methods=["GET"])
def get_current_token():

    location = request.args.get("location")

    connection = get_db_connection()

    row = connection.execute(
        """
        SELECT *
        FROM tokens
        WHERE location = ?
        AND status = 'Serving'
        ORDER BY id ASC
        LIMIT 1
        """,
        (location,)
    ).fetchone()

    connection.close()

    if row:

        return jsonify({
            "id": row["id"],
            "token": row["token"],
            "location": row["location"],
            "service": row["service"],
            "status": row["status"]
        })

    return jsonify({
        "id": None,
        "token": "--",
        "location": location,
        "service": "",
        "status": "None"
    })


# ==========================================
# CALL NEXT TOKEN
# ==========================================

@app.route("/api/token/<int:token_id>/call", methods=["POST"])
def call_token(token_id):

    connection = get_db_connection()

    # Find the selected waiting token
    selected_token = connection.execute(
        """
        SELECT *
        FROM tokens
        WHERE id = ?
        AND status = 'Waiting'
        """,
        (token_id,)
    ).fetchone()

    if selected_token is None:

        connection.close()

        return jsonify({
            "message": "Token is no longer waiting."
        }), 400

    location = selected_token["location"]

    # Check if another customer is already
    # being served at this location
    current = connection.execute(
        """
        SELECT *
        FROM tokens
        WHERE location = ?
        AND status = 'Serving'
        LIMIT 1
        """,
        (location,)
    ).fetchone()

    if current:

        connection.close()

        return jsonify({
            "message": "Please complete the current token first."
        }), 400

    # Move waiting token to Serving
    connection.execute(
        """
        UPDATE tokens
        SET status = 'Serving'
        WHERE id = ?
        AND status = 'Waiting'
        """,
        (token_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Token called successfully"
    })


# ==========================================
# COMPLETE CURRENT TOKEN
# ==========================================

@app.route("/api/token/<int:token_id>/complete", methods=["POST"])
def complete_token(token_id):

    connection = get_db_connection()

    cursor = connection.execute(
        """
        UPDATE tokens
        SET status = 'Completed'
        WHERE id = ?
        AND status = 'Serving'
        """,
        (token_id,)
    )

    connection.commit()

    updated_rows = cursor.rowcount

    connection.close()

    if updated_rows == 0:

        return jsonify({
            "message": "Token could not be completed."
        }), 400

    return jsonify({
        "message": "Token completed successfully"
    })


# ==========================================
# CREATE TABLE
# ==========================================

create_table()


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":
    app.run(debug=True)