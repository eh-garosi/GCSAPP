from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import json
from datetime import datetime

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Create database if it doesn't exist
def init_db():
    conn = sqlite3.connect('gcs_data.db')
    cursor = conn.cursor()
    
    # Create patients table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        medical_history TEXT,
        admission_date TEXT
    )
    ''')
    
    # Create GCS scores table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS gcs_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        timestamp TEXT NOT NULL,
        eye_score INTEGER NOT NULL,
        verbal_score INTEGER NOT NULL,
        motor_score INTEGER NOT NULL,
        total_score INTEGER NOT NULL,
        notes TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize the database at startup
init_db()

# Serve static files from the static folder
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# API endpoint to get all patients
@app.route('/api/patients', methods=['GET'])
def get_patients():
    conn = sqlite3.connect('gcs_data.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM patients ORDER BY name')
    patients = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(patients)

# API endpoint to add a new patient
@app.route('/api/patients', methods=['POST'])
def add_patient():
    patient_data = request.json
    
    conn = sqlite3.connect('gcs_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO patients (name, age, gender, medical_history, admission_date)
    VALUES (?, ?, ?, ?, ?)
    ''', (
        patient_data.get('name', ''),
        patient_data.get('age', None),
        patient_data.get('gender', ''),
        patient_data.get('medical_history', ''),
        patient_data.get('admission_date', datetime.now().strftime('%Y-%m-%d'))
    ))
    
    patient_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': patient_id, 'message': 'Patient added successfully'})

# API endpoint to get a specific patient
@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    conn = sqlite3.connect('gcs_data.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM patients WHERE id = ?', (patient_id,))
    patient = dict(cursor.fetchone() or {})
    
    conn.close()
    return jsonify(patient)

# API endpoint to update a patient
@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    patient_data = request.json
    
    conn = sqlite3.connect('gcs_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    UPDATE patients
    SET name = ?, age = ?, gender = ?, medical_history = ?, admission_date = ?
    WHERE id = ?
    ''', (
        patient_data.get('name', ''),
        patient_data.get('age', None),
        patient_data.get('gender', ''),
        patient_data.get('medical_history', ''),
        patient_data.get('admission_date', ''),
        patient_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Patient updated successfully'})

# API endpoint to add a GCS score for a patient
@app.route('/api/patients/<int:patient_id>/scores', methods=['POST'])
def add_gcs_score(patient_id):
    score_data = request.json
    
    # Calculate total score
    eye_score = int(score_data.get('eye_score', 0))
    verbal_score = int(score_data.get('verbal_score', 0))
    motor_score = int(score_data.get('motor_score', 0))
    total_score = eye_score + verbal_score + motor_score
    
    conn = sqlite3.connect('gcs_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO gcs_scores (patient_id, timestamp, eye_score, verbal_score, motor_score, total_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        patient_id,
        score_data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
        eye_score,
        verbal_score,
        motor_score,
        total_score,
        score_data.get('notes', '')
    ))
    
    score_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': score_id, 
        'total_score': total_score,
        'message': 'GCS score added successfully'
    })

# API endpoint to get all GCS scores for a patient
@app.route('/api/patients/<int:patient_id>/scores', methods=['GET'])
def get_gcs_scores(patient_id):
    conn = sqlite3.connect('gcs_data.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM gcs_scores
    WHERE patient_id = ?
    ORDER BY timestamp DESC
    ''', (patient_id,))
    
    scores = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(scores)

# API endpoint to get GCS trends for a patient
@app.route('/api/patients/<int:patient_id>/trends', methods=['GET'])
def get_gcs_trends(patient_id):
    conn = sqlite3.connect('gcs_data.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT timestamp, eye_score, verbal_score, motor_score, total_score
    FROM gcs_scores
    WHERE patient_id = ?
    ORDER BY timestamp ASC
    ''', (patient_id,))
    
    scores = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(scores)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
