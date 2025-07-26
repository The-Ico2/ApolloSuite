from flask import Flask, jsonify, redirect, url_for, render_template
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

@app.route('/')
def homepage():
    return render_template('index.html')

@app.route("/health")
def health_check():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting app on port {port}...")
    app.run(host="0.0.0.0", port=port)