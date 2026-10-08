from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import papers
from routers import allocation
app = FastAPI(title="ScholarMatch AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(papers.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to ScholarMatch AI",
        "status": "Backend is running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
app.include_router(allocation.router)