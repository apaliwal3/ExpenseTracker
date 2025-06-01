import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# Load and prepare data
with open('training_data.json', 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data)

if 'description' not in df or 'category' not in df:
    raise ValueError("training_data.json must contain 'description' and 'category' fields")

X_train, X_test, y_train, y_test = train_test_split(
    df['description'], df['category'], test_size=0.2, random_state=42)

# Train pipeline: TF-IDF + Naive Bayes
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english', lowercase=True)),
    ('clf', MultinomialNB())
])

pipeline.fit(X_train, y_train)

# Evaluate
y_pred = pipeline.predict(X_test)
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(pipeline, 'expense_classifier.pkl')
print("Model saved to 'expense_classifier.pkl'")