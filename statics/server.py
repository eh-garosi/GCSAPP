# server.py - A simple Flask server that correctly serves static files
# Save this file in your project root and run with: python server.py

from flask import Flask, send_from_directory, jsonify
import os
import json

app = Flask(__name__)

# Mock data for the API
MOCK_PATIENTS = [
    {
        "id": 1,
        "name": "علی محمدی",
        "age": 45,
        "gender": "male",
        "department": "neurology",
        "bed_number": "N-12",
        "medical_history": "سابقه فشار خون بالا، تصادف با وسیله نقلیه موتوری",
        "diagnosis": "آسیب تروماتیک مغزی",
        "admission_date": "2025-05-01"
    },
    {
        "id": 2,
        "name": "زهرا کریمی",
        "age": 32,
        "gender": "female",
        "department": "emergency",
        "bed_number": "E-05",
        "medical_history": "سقوط از ارتفاع",
        "diagnosis": "خونریزی زیر عنکبوتیه",
        "admission_date": "2025-05-04"
    },
    {
        "id": 3,
        "name": "محمد رضایی",
        "age": 67,
        "gender": "male",
        "department": "icu",
        "bed_number": "ICU-03",
        "medical_history": "سکته مغزی قبلی، دیابت نوع 2",
        "diagnosis": "خونریزی داخل مغزی",
        "admission_date": "2025-05-07"
    }
]

MOCK_SCORES = [
    {
        "id": 1,
        "patient_id": 1,
        "timestamp": "2025-05-01T08:30:00",
        "eye_score": 2,
        "verbal_score": 3,
        "motor_score": 4,
        "total_score": 9,
        "notes": "ارزیابی اولیه پس از پذیرش"
    },
    {
        "id": 2,
        "patient_id": 1,
        "timestamp": "2025-05-02T08:30:00",
        "eye_score": 3,
        "verbal_score": 3,
        "motor_score": 5,
        "total_score": 11,
        "notes": "بهبود در پاسخگویی"
    }
]

# API routes
@app.route('/api/patients', methods=['GET'])
def get_patients():
    return jsonify(MOCK_PATIENTS)

@app.route('/api/patients/<int:patient_id>/scores', methods=['GET'])
def get_patient_scores(patient_id):
    scores = [s for s in MOCK_SCORES if s["patient_id"] == patient_id]
    return jsonify(scores)

# Serve static files from the root directory
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/css/<path:path>')
def serve_css(path):
    return send_from_directory('css', path)

@app.route('/js/<path:path>')
def serve_js(path):
    return send_from_directory('js', path)

# The critical part - properly serving images
@app.route('/images/<path:path>')
def serve_images(path):
    # Log the requested image path for debugging
    print(f"Serving image: {path}")
    return send_from_directory('images', path)

# Handle other static assets
@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    else:
        return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    # Verify if the images directory exists
    if not os.path.exists('images'):
        print("WARNING: 'images' directory not found in the current location.")
        print("Creating an empty 'images' directory...")
        os.makedirs('images')
        
    # Check for image files
    image_count = len([f for f in os.listdir('images') if f.endswith('.jpg') or f.endswith('.png')])
    print(f"Found {image_count} image files in the 'images' directory.")
    
    if image_count == 0:
        print("WARNING: No image files found. Make sure to add your GCS images.")
    
    # List all directories for debugging
    print("Current directory structure:")
    for root, dirs, files in os.walk('.', topdown=True):
        if '.git' in root:
            continue
        level = root.count(os.sep)
        indent = ' ' * 4 * level
        print(f"{indent}{os.path.basename(root)}/")
        sub_indent = ' ' * 4 * (level + 1)
        for file in files:
            if file.endswith(('.jpg', '.png', '.html', '.css', '.js')):
                print(f"{sub_indent}{file}")
    
    # Start the server
    print("\nStarting server on http://127.0.0.1:5000")
    app.run(debug=True)