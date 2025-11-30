#!/usr/bin/env python3
"""Utility script to load sample CSV data into PostgreSQL tables."""
from __future__ import annotations

import csv
import os
from pathlib import Path
from typing import Dict, Iterable, List

import psycopg2
from psycopg2 import sql
from psycopg2.extras import execute_batch

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
ENV_PATH = BASE_DIR / ".env"

DATASETS = [
    {"table": "persons", "file": "persons.csv"},
    {"table": "assets", "file": "assets.csv"},
    {"table": "skills", "file": "skills.csv"},
    {"table": "work_orders", "file": "work_orders.csv"},
    {"table": "work_activities", "file": "work_activities.csv"},
    {"table": "work_order_assets", "file": "work_order_assets.csv"},
    {"table": "work_order_skills", "file": "work_order_skills.csv"},
    {"table": "tickets", "file": "tickets.csv"},
    {"table": "attachments", "file": "attachments.csv"},
]


class DataLoadError(RuntimeError):
    """Raised when required input data is missing."""


def parse_env_file(env_path: Path) -> None:
    """Populate os.environ with key/value pairs from a dotenv-style file."""

    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def db_config() -> Dict[str, str]:
    """Return database connection parameters sourced from env vars."""

    return {
        "dbname": os.environ.get("DB_NAME", "postgres"),
        "user": os.environ.get("DB_USER", "postgres"),
        "password": os.environ.get("DB_PASSWORD", "postgres"),
        "host": os.environ.get("DB_HOST", "127.0.0.1"),
        "port": int(os.environ.get("DB_PORT", "5432")),
    }


def read_csv_rows(path: Path) -> List[Dict[str, str | None]]:
    if not path.exists():
        raise DataLoadError(f"Missing expected CSV file: {path}")

    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        rows: List[Dict[str, str | None]] = []
        for row in reader:
            rows.append({key: (value if value != "" else None) for key, value in row.items()})
    return rows


def truncate_tables(conn, table_names: Iterable[str]) -> None:
    if not table_names:
        return

    with conn.cursor() as cur:
        cur.execute(
            sql.SQL("TRUNCATE TABLE {} RESTART IDENTITY CASCADE;").format(
                sql.SQL(", ").join(sql.Identifier(name) for name in table_names)
            )
        )


def insert_rows(conn, table: str, rows: List[Dict[str, str | None]]) -> None:
    if not rows:
        return

    columns = list(rows[0].keys())
    query = sql.SQL("INSERT INTO {table} ({columns}) VALUES ({placeholders});").format(
        table=sql.Identifier(table),
        columns=sql.SQL(", ").join(sql.Identifier(col) for col in columns),
        placeholders=sql.SQL(", ").join(sql.Placeholder() for _ in columns),
    )

    values = [[row[col] for col in columns] for row in rows]
    with conn.cursor() as cur:
        execute_batch(cur, query, values)


def load_data() -> None:
    parse_env_file(ENV_PATH)
    config = db_config()

    with psycopg2.connect(**config) as conn:
        conn.autocommit = False
        table_sequence = [dataset["table"] for dataset in DATASETS]
        truncate_tables(conn, table_sequence[::-1])  # reverse to handle FK dependencies

        for dataset in DATASETS:
            csv_path = DATA_DIR / dataset["file"]
            rows = read_csv_rows(csv_path)
            insert_rows(conn, dataset["table"], rows)
            print(f"Loaded {len(rows)} rows into {dataset['table']}")

        conn.commit()
        print("Data load complete.")


def main() -> None:
    try:
        load_data()
    except DataLoadError as exc:
        raise SystemExit(str(exc))


if __name__ == "__main__":
    main()
