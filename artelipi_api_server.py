# FastAPI Service for Artelipi-Only Recommendations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from artelipi_recommender import ArtelipiRecommender

# Initialize FastAPI
app = FastAPI(
    title="Artelipi Recommendation API",
    description="Content-based article recommendation system (Artelipi articles only)",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://artelipi.vercel.app",  # Vercel production
        "https://artelipi-git-main-shashwat-dev1s-projects.vercel.app",  # Vercel preview
        "https://artelipi-frontend-production.up.railway.app",  # Railway frontend (legacy)
        "http://localhost:3000",  # Local development
        "http://localhost:3001"   # Alternative local port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommender
recommender = ArtelipiRecommender()

# Load model on startup
@app.on_event("startup")
async def load_model():
    """Load Artelipi articles and build model"""
    try:
        # Try to load saved model first
        if not recommender.load_model('ml_models_artelipi'):
            # If no saved model, load from Firestore and build
            print("No saved model found. Loading from Firestore...")
            recommender.initialize_firebase()
            recommender.load_artelipi_articles()
            
            if len(recommender.df) >= recommender.min_articles_for_ml:
                recommender.build_ml_model()
                recommender.save_model()
            else:
                print(f"⚠️ Only {len(recommender.df)} articles. ML disabled until {recommender.min_articles_for_ml} articles exist.")
        
        print("✅ Artelipi Recommender ready!")
    except Exception as e:
        print(f"❌ Error loading recommender: {e}")


# API Endpoints
@app.get("/")
async def root():
    """Health check"""
    article_count = len(recommender.df) if recommender.df is not None else 0
    ml_enabled = recommender.similarity_matrix is not None
    
    return {
        "status": "healthy",
        "service": "Artelipi Recommendation API",
        "version": "2.0.0",
        "article_count": article_count,
        "ml_enabled": ml_enabled,
        "data_source": "Artelipi Firestore Only"
    }


@app.get("/health")
async def health_check():
    """Simple health check for Render"""
    return {"status": "ok"}


@app.get("/trending")
async def get_trending(limit: int = 10):
    """Get trending articles (Artelipi only, based on engagement)"""
    try:
        # Refresh data from Firestore
        recommender.load_artelipi_articles()
        
        trending = recommender.get_trending_articles(limit)
        return {
            "articles": trending,
            "count": len(trending),
            "source": "artelipi_platform"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recent")
async def get_recent(limit: int = 10):
    """Get most recent articles (cold start fallback)"""
    try:
        # Refresh data from Firestore
        recommender.load_artelipi_articles()
        
        recent = recommender.get_recent_articles(limit)
        return {
            "articles": recent,
            "count": len(recent),
            "source": "artelipi_platform"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations/{article_id}")
async def get_recommendations(article_id: str, limit: int = 5):
    """Get recommendations for a specific article (Artelipi only)"""
    try:
        # Refresh data from Firestore
        recommender.load_artelipi_articles()
        
        # Rebuild model if needed
        if len(recommender.df) >= recommender.min_articles_for_ml and recommender.similarity_matrix is None:
            recommender.build_ml_model()
        
        recommendations = recommender.get_recommendations(article_id, limit)
        
        return {
            "recommendations": recommendations,
            "count": len(recommendations),
            "ml_enabled": recommender.similarity_matrix is not None,
            "source": "artelipi_platform"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations/by-content")
async def get_recommendations_by_content(content: str, limit: int = 5):
    """Get recommendations based on content (Artelipi only)"""
    try:
        # Refresh data from Firestore
        recommender.load_artelipi_articles()
        
        # Rebuild model if needed
        if len(recommender.df) >= recommender.min_articles_for_ml and recommender.similarity_matrix is None:
            recommender.build_ml_model()
        
        recommendations = recommender.get_recommendations_by_content(content, limit)
        
        return {
            "recommendations": recommendations,
            "count": len(recommendations),
            "ml_enabled": recommender.similarity_matrix is not None,
            "source": "artelipi_platform"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
async def get_stats():
    """Get recommendation system statistics"""
    try:
        article_count = len(recommender.df) if recommender.df is not None else 0
        ml_enabled = recommender.similarity_matrix is not None
        
        return {
            "total_articles": article_count,
            "ml_enabled": ml_enabled,
            "min_articles_for_ml": recommender.min_articles_for_ml,
            "data_source": "Artelipi Firestore Only",
            "recommendation_strategy": "ML-based" if ml_enabled else "Rule-based (engagement + recency)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/refresh")
async def refresh_data():
    """Manually refresh articles from Firestore"""
    try:
        recommender.load_artelipi_articles()
        
        if len(recommender.df) >= recommender.min_articles_for_ml:
            recommender.build_ml_model()
            recommender.save_model()
        
        return {
            "status": "refreshed",
            "article_count": len(recommender.df),
            "ml_enabled": recommender.similarity_matrix is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run the server
if __name__ == "__main__":
    uvicorn.run(
        "artelipi_api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
