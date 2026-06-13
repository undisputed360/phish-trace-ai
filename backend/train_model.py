import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from feature_extractor import extract_features, get_feature_names

print("=" * 50)
print("PhishTrace AI - Model Training")
print("=" * 50)

# Load dataset
dataset_path = "../dataset/phishing_urls.csv"
if not os.path.exists(dataset_path):
    print(f"Error: Dataset not found at {dataset_path}")
    exit(1)

df = pd.read_csv(dataset_path)
print(f"\nLoaded {len(df)} URLs ({sum(df['label'])} phishing, {len(df) - sum(df['label'])} legitimate)")

# Extract features from all URLs
print("\nExtracting features...")
feature_list = []
labels = []

for i, row in df.iterrows():
    try:
        features = extract_features(row['url'])
        feature_list.append(features)
        labels.append(row['label'])
    except Exception as e:
        print(f"  Skipping {row['url'][:50]}... ({e})")

# Convert to DataFrame
X = pd.DataFrame(feature_list)
y = np.array(labels)

print(f"Features extracted: {X.shape[1]} features from {X.shape[0]} URLs")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining set: {len(X_train)} URLs")
print(f"Test set: {len(X_test)} URLs")

# Train model
print("\nTraining Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print(f"\n{'='*50}")
print("Model Performance")
print(f"{'='*50}")
print(f"Accuracy:  {accuracy:.2%}")
print(f"Precision: {precision:.2%}")
print(f"Recall:    {recall:.2%}")
print(f"F1 Score:  {f1:.2%}")

print(f"\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(f"  True Negatives:  {cm[0][0]}")
print(f"  False Positives: {cm[0][1]}")
print(f"  False Negatives: {cm[1][0]}")
print(f"  True Positives:  {cm[1][1]}")

# Show top important features
feature_names = get_feature_names()
importances = model.feature_importances_
indices = np.argsort(importances)[::-1]

print(f"\nTop 10 Most Important Features:")
for i in range(min(10, len(feature_names))):
    print(f"  {i+1}. {feature_names[indices[i]]}: {importances[indices[i]]:.4f}")

# Save model
model_path = "phish_model.pkl"
with open(model_path, "wb") as f:
    pickle.dump(model, f)

print(f"\nModel saved to: {model_path}")
print(f"\n{'='*50}")
print("Training complete!")
print(f"{'='*50}")