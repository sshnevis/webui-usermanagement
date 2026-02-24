from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, subscriptions, chats
from .database import models
from .database.database import engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WebUI User Management API",
    description="API for managing users, subscriptions, and chat credits for Open WebUI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(subscriptions.router, prefix="/api/v1", tags=["Subscriptions"])
app.include_router(chats.router, prefix="/api/v1", tags=["Chats"])

@app.get("/")
async def root():
    return {"message": "WebUI User Management API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)