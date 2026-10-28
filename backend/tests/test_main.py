import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import get_db, Base

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_list_todos_empty():
    response = client.get("/todos")
    assert response.status_code == 200
    assert response.json() == []


def test_create_todo():
    response = client.post("/todos", json={"title": "学习 CI/CD"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "学习 CI/CD"
    assert data["completed"] is False
    assert "id" in data


def test_update_todo():
    create_response = client.post("/todos", json={"title": "待完成任务"})
    todo_id = create_response.json()["id"]

    response = client.patch(f"/todos/{todo_id}", json={"completed": True})
    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_delete_todo():
    create_response = client.post("/todos", json={"title": "要删除的任务"})
    todo_id = create_response.json()["id"]

    response = client.delete(f"/todos/{todo_id}")
    assert response.status_code == 204

    list_response = client.get("/todos")
    assert list_response.json() == []


def test_update_nonexistent_todo():
    response = client.patch("/todos/9999", json={"completed": True})
    assert response.status_code == 404
