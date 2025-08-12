from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# Load model using joblib
model = joblib.load('expense_classifier.pkl')

@app.route('/predict-category', methods=['POST'])
def predict_category():
    data = request.get_json()
    description = data.get('description', '')
    if not description:
        return jsonify({'error': 'Missing description'}), 400

    prediction = model.predict([description])[0]
    return jsonify({'category': prediction})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)