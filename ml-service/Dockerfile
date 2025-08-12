FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run training script *during build*
RUN python train_expense_classifier.py

# Run API server *when container starts*
CMD ["python", "classifier_api.py"]