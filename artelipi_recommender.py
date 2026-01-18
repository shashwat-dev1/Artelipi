# Artelipi-Only Recommendation System
# Uses ONLY articles from Artelipi platform (Firestore)

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

import json

class ArtelipiRecommender:
    def __init__(self):
        """Initialize recommender with Firestore connection"""
        self.db = None
        self.df = None
        self.tfidf_matrix = None
        self.vectorizer = None
        self.similarity_matrix = None
        self.min_articles_for_ml = 10  # Minimum articles before using ML
        
    def initialize_firebase(self):
        """Initialize Firebase connection"""
        try:
            # Check if already initialized
            app = firebase_admin.get_app()
            self.db = firestore.client(app)
            print("✅ Using existing Firebase app")
        except ValueError:
            # Initialize new app
            try:
                # First, try to load from FIREBASE_SERVICE_ACCOUNT_JSON env var
                firebase_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
                if firebase_json:
                    firebase_config = json.loads(firebase_json)
                    cred = credentials.Certificate(firebase_config)
                    firebase_admin.initialize_app(cred)
                    self.db = firestore.client()
                    print(f"✅ Initialized Firebase from JSON env var for project: {firebase_config.get('project_id')}")
                else:
                    # Fallback: Try default credentials
                    cred = credentials.ApplicationDefault()
                    firebase_admin.initialize_app(cred)
                    self.db = firestore.client()
                    print("✅ Initialized Firebase with default credentials")
            except Exception as e:
                # Fallback: Initialize without credentials (will use environment)
                print(f"⚠️ Could not initialize Firebase: {e}")
                print("⚠️ Make sure FIREBASE_SERVICE_ACCOUNT_JSON is set")
                # For now, we'll create empty dataframe
                self.df = pd.DataFrame()
                return
        
        if not self.db:
            self.db = firestore.client()
    
    def load_artelipi_articles(self):
        """Load articles ONLY from Artelipi Firestore"""
        print("Loading Artelipi articles from Firestore...")
        
        if not self.db:
            self.initialize_firebase()
        
        # Fetch all published articles from Firestore
        posts_ref = self.db.collection('posts')
        docs = posts_ref.where('status', '==', 'published').stream()
        
        articles = []
        for doc in docs:
            data = doc.to_dict()
            articles.append({
                'id': doc.id,
                'title': data.get('title', ''),
                'content': data.get('content', ''),
                'author': data.get('authorName', 'Unknown'),
                'slug': data.get('slug', ''),
                'tags': data.get('tags', []),
                'likeCount': data.get('likeCount', 0),
                'viewCount': data.get('viewCount', 0),
                'bookmarkCount': data.get('bookmarkCount', 0),
                'createdAt': data.get('createdAt'),
            })
        
        self.df = pd.DataFrame(articles)
        
        if len(self.df) == 0:
            print("⚠️ No articles found in Artelipi platform")
            return self.df
        
        # Combine title and content
        self.df['full_content'] = self.df['title'] + ' ' + self.df['content']
        
        print(f"✅ Loaded {len(self.df)} articles from Artelipi")
        return self.df
    
    def get_trending_articles(self, limit=10):
        """Get trending articles based on engagement (internal only)"""
        if self.df is None or len(self.df) == 0:
            return []
        
        # Calculate engagement score
        self.df['engagement_score'] = (
            self.df['likeCount'] * 3 +
            self.df['viewCount'] * 1 +
            self.df['bookmarkCount'] * 5
        )
        
        # Sort by engagement and recency
        trending = self.df.nlargest(limit, 'engagement_score')
        
        return trending.to_dict('records')
    
    def get_recent_articles(self, limit=10):
        """Get most recent articles (cold start fallback)"""
        if self.df is None or len(self.df) == 0:
            return []
        
        # Sort by creation date
        recent = self.df.nlargest(limit, 'createdAt') if 'createdAt' in self.df.columns else self.df.head(limit)
        
        return recent.to_dict('records')
    
    def build_ml_model(self):
        """Build ML model ONLY if enough articles exist"""
        if self.df is None or len(self.df) < self.min_articles_for_ml:
            print(f"⚠️ Not enough articles ({len(self.df) if self.df is not None else 0}) for ML. Need at least {self.min_articles_for_ml}")
            return False
        
        print("Building TF-IDF model from Artelipi articles...")
        
        # Build TF-IDF matrix
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.9
        )
        
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['full_content'])
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        
        print(f"✅ ML model built with {len(self.df)} Artelipi articles")
        return True
    
    def get_recommendations(self, article_id, limit=5):
        """Get recommendations for a specific article (Artelipi only)"""
        if self.df is None or len(self.df) == 0:
            return []
        
        # Find article index
        try:
            article_idx = self.df[self.df['id'] == article_id].index[0]
        except IndexError:
            print(f"Article {article_id} not found")
            return self.get_recent_articles(limit)
        
        # If not enough articles for ML, return recent articles
        if len(self.df) < self.min_articles_for_ml or self.similarity_matrix is None:
            print("Using rule-based recommendations (not enough data for ML)")
            # Return other articles, sorted by engagement
            other_articles = self.df[self.df['id'] != article_id]
            return other_articles.nlargest(limit, 'engagement_score').to_dict('records')
        
        # Use ML-based similarity
        similarity_scores = list(enumerate(self.similarity_matrix[article_idx]))
        similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
        
        # Get top N (excluding the article itself)
        top_indices = [i[0] for i in similarity_scores[1:limit+1]]
        
        recommendations = []
        for idx in top_indices:
            rec = self.df.iloc[idx].to_dict()
            rec['similarity_score'] = similarity_scores[idx][1]
            recommendations.append(rec)
        
        return recommendations
    
    def get_recommendations_by_content(self, content, limit=5):
        """Get recommendations based on content (Artelipi only)"""
        if self.df is None or len(self.df) == 0:
            return []
        
        # If not enough articles, return recent
        if len(self.df) < self.min_articles_for_ml or self.vectorizer is None:
            return self.get_recent_articles(limit)
        
        # Transform content and find similar articles
        content_vector = self.vectorizer.transform([content])
        similarities = cosine_similarity(content_vector, self.tfidf_matrix)[0]
        
        top_indices = similarities.argsort()[-limit:][::-1]
        
        recommendations = []
        for idx in top_indices:
            rec = self.df.iloc[idx].to_dict()
            rec['similarity_score'] = float(similarities[idx])
            recommendations.append(rec)
        
        return recommendations
    
    def save_model(self, path='ml_models_artelipi'):
        """Save the model"""
        os.makedirs(path, exist_ok=True)
        
        if self.vectorizer:
            with open(f'{path}/vectorizer.pkl', 'wb') as f:
                pickle.dump(self.vectorizer, f)
        
        if self.tfidf_matrix is not None:
            with open(f'{path}/tfidf_matrix.pkl', 'wb') as f:
                pickle.dump(self.tfidf_matrix, f)
        
        if self.similarity_matrix is not None:
            with open(f'{path}/similarity_matrix.pkl', 'wb') as f:
                pickle.dump(self.similarity_matrix, f)
        
        if self.df is not None:
            self.df.to_csv(f'{path}/articles.csv', index=False)
        
        print(f"✅ Model saved to {path}/")
    
    def load_model(self, path='ml_models_artelipi'):
        """Load saved model"""
        try:
            with open(f'{path}/vectorizer.pkl', 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            with open(f'{path}/tfidf_matrix.pkl', 'rb') as f:
                self.tfidf_matrix = pickle.load(f)
            
            with open(f'{path}/similarity_matrix.pkl', 'rb') as f:
                self.similarity_matrix = pickle.load(f)
            
            self.df = pd.read_csv(f'{path}/articles.csv')
            
            print(f"✅ Model loaded from {path}/")
            return True
        except FileNotFoundError:
            print(f"⚠️ No saved model found at {path}/")
            return False


# Example usage
if __name__ == "__main__":
    recommender = ArtelipiRecommender()
    
    # Load articles from Firestore
    recommender.load_artelipi_articles()
    
    # Build ML model if enough articles
    recommender.build_ml_model()
    
    # Save model
    recommender.save_model()
    
    # Test recommendations
    if len(recommender.df) > 0:
        print("\n" + "="*80)
        print("Trending Articles (Artelipi Only)")
        print("="*80)
        trending = recommender.get_trending_articles(5)
        for i, article in enumerate(trending, 1):
            print(f"\n{i}. {article['title']}")
            print(f"   By: {article['author']}")
            print(f"   Engagement: {article.get('engagement_score', 0)}")
