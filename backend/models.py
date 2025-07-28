import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy_utils import create_database, database_exists

# Example schema definition for the user-specific DB (simplified Drive table)
from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

# User DB connection string (e.g., PostgreSQL)
PRIMARY_DB_URL = "postgresql://user:password@localhost/primarydb"

# Template DB URL (user-specific DB URL pattern)
USER_DB_URL_TEMPLATE = "postgresql://user:password@localhost/userdb_{}"

# Metadata for user DB
user_metadata = MetaData()

drive_table = Table(
    "drive",
    user_metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(255), nullable=False),
    Column("description", String(1024)),
    Column("created_at", DateTime, default=datetime.utcnow),
    Column("owner_id", Integer, nullable=False),  # Assuming owner_id is kept here for reference
)

def create_user_database(username: str):
    user_db_url = USER_DB_URL_TEMPLATE.format(username)
    if not database_exists(user_db_url):
        print(f"Creating database for user {username} at {user_db_url}")
        create_database(user_db_url)
    else:
        print(f"Database for user {username} already exists")

    engine = create_engine(user_db_url)
    user_metadata.create_all(engine)
    print(f"Created schema for user {username}")

def add_user_and_db(username: str, password_hash: str):
    # Connect to primary DB and add user record (simplified)
    primary_engine = create_engine(PRIMARY_DB_URL)
    with primary_engine.connect() as conn:
        result = conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id",
            (username, password_hash)
        )
        user_id = result.scalar()
        print(f"Added user {username} with id {user_id}")

    # Create user-specific DB and tables
    create_user_database(username)

# Example usage:
if __name__ == "__main__":
    new_username = "alice"
    password_hash = "hashedpassword"
    add_user_and_db(new_username, password_hash)
