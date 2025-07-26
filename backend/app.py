import os
import secrets
import base64
import hashlib
import configparser
import time
import mimetypes

from flask import (
    Flask, redirect, url_for, render_template,
    flash, session, request, jsonify, abort,
    send_from_directory
)
from flask_login import (
    LoginManager, login_user, current_user,
    login_required, logout_user
)
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from models import db, User, SocialAccount, Notification

app = Flask(__name__)
CORS(app, resources={r"/api/*"})

app.config.from_object("config.Config")

# Make sure you have a secret key for sessions
app.secret_key = app.config.get("SECRET_KEY", os.urandom(24))

db.init_app(app)

login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/")
def root():
    return redirect(url_for("index"))

@app.route("/api")
def index():
    # List only /api routes and their endpoint names, with sample data included
    routes = []
    seen_rules = set()
    with app.test_request_context():
        for rule in app.url_map.iter_rules():
            if not str(rule).startswith("/api/"):
                continue
            if str(rule) in seen_rules:
                continue
            seen_rules.add(str(rule))
            route_obj = {
                "endpoint": rule.endpoint,
                "methods": list(rule.methods),
                "rule": str(rule)
            }
            # Try to get data for GET routes (except /api itself)
            if "GET" in route_obj["methods"] and route_obj["rule"] != "/api":
                try:
                    view_func = app.view_functions[rule.endpoint]
                    resp = view_func()
                    from flask import Response
                    if isinstance(resp, Response):
                        route_obj["data"] = resp.get_json()
                    else:
                        route_obj["data"] = resp
                except Exception:
                    route_obj["data"] = "Error loading data"
            routes.append(route_obj)
    return jsonify({"routes": routes})

@app.route("/api/apps")
def list_apps():
    base_apps_dir = os.path.join(os.path.dirname(__file__), "../apps")
    apps = []

    for source in os.listdir(base_apps_dir):  # Apollo, Additional
        source_path = os.path.join(base_apps_dir, source)
        if not os.path.isdir(source_path):
            continue

        for category in os.listdir(source_path):  # e.g., productivity, socials, etc.
            category_path = os.path.join(source_path, category)
            if not os.path.isdir(category_path):
                continue

            for app_folder in os.listdir(category_path):
                app_path = os.path.join(category_path, app_folder)
                if not os.path.isdir(app_path):
                    continue

                config_path = os.path.join(app_path, "config.ini")
                if os.path.isfile(config_path):
                    config = configparser.ConfigParser()
                    config.read(config_path)
                    section = config["App"] if "App" in config else config["DEFAULT"]
                    
                    apps.append({
                        "name": section.get("name", app_folder),
                        "description": section.get("description", ""),
                        "icon": f"/api/icons/{source}/{category}/{app_folder}",
                        "launchUrl": section.get("launchUrl", f"/apps/{source}/{category}/{app_folder}/start.py"),
                        "source": source,
                        "category": category,
                        "folder": app_folder
                    })

    return jsonify(apps)


@app.route("/apidashboard")
def api_dashboard():
    return render_template("api_dashboard.html")

# Storage for settings, notifications, logs, users, apps registry in-memory (demo only)
# Replace with DB or persistent storage as needed
app_settings = {}
app_notifications = []
app_logs = []
app_registry = [
    # Example entries for the registry, you might load this from a remote source or DB
    {
        "name": "Apollo Docs",
        "description": "Documentation Viewer and Editor",
        "icon": "/apps/Apollo/productivity/docs/icons/icon.png",
        "launchUrl": "/apps/Apollo/productivity/docs/index.html",
        "source": "Apollo",
        "category": "productivity",
        "folder": "docs"
    },
    {
        "name": "Apollo Slides",
        "description": "Presentation Viewer and Editor",
        "icon": "/apps/Apollo/productivity/slides/icons/icon.png",
        "launchUrl": "/apps/Apollo/productivity/slides/index.html",
        "source": "Apollo",
        "category": "productivity",
        "folder": "slides"
    }
]

users = {
    1: {"id": 1, "username": "alice", "avatar": "/avatars/alice.png"},
    2: {"id": 2, "username": "bob", "avatar": "/avatars/bob.png"},
}

current_user_id = 1  # Simplified: in real app, use flask-login current_user


### 1. App Registry API ###

@app.route("/api/registry")
def get_registry():
    return jsonify(app_registry)


@app.route("/api/apps/install", methods=["POST"])
@login_required
def install_app():
    data = request.json
    # Example: accept 'name' and 'source' to simulate installation
    if not data or "name" not in data or "source" not in data:
        return abort(400, description="Missing required fields")
    
    # For demo, just append to app_registry if not present
    exists = any(a for a in app_registry if a["name"] == data["name"])
    if exists:
        return jsonify({"message": "App already installed"}), 400
    
    app_registry.append({
        "name": data["name"],
        "description": data.get("description", ""),
        "icon": data.get("icon", ""),
        "launchUrl": data.get("launchUrl", ""),
        "source": data["source"],
        "category": data.get("category", "Uncategorized"),
        "folder": data.get("folder", data["name"].lower().replace(" ", "_"))
    })
    return jsonify({"message": "App installed successfully"}), 201


@app.route("/api/apps/<app_name>", methods=["DELETE"])
@login_required
def uninstall_app(app_name):
    global app_registry
    before_count = len(app_registry)
    app_registry = [a for a in app_registry if a["name"] != app_name]
    if len(app_registry) == before_count:
        return abort(404, description="App not found")
    return jsonify({"message": "App uninstalled successfully"})


### 2. Plugin Communication API (Simple Message Bus) ###

plugin_messages = {}

@app.route("/api/messages/send", methods=["POST"])
@login_required
def send_message():
    data = request.json
    # Expecting: sender, receiver, message
    sender = data.get("sender")
    receiver = data.get("receiver")
    message = data.get("message")
    if not sender or not receiver or not message:
        return abort(400, description="Missing sender, receiver, or message")
    
    plugin_messages.setdefault(receiver, []).append({
        "from": sender,
        "message": message,
        "timestamp": int(time.time())
    })
    return jsonify({"message": "Message sent"})


@app.route("/api/messages/<app_name>")
@login_required
def get_messages(app_name):
    msgs = plugin_messages.get(app_name, [])
    # Clear messages after fetching for demo purposes
    plugin_messages[app_name] = []
    return jsonify(msgs)


### 3. Settings API ###

@app.route("/api/settings/<app_name>", methods=["GET", "POST"])
@login_required
def app_settings_route(app_name):
    if request.method == "GET":
        return jsonify(app_settings.get(app_name, {}))
    elif request.method == "POST":
        data = request.json
        if not isinstance(data, dict):
            return abort(400, description="Invalid settings format")
        app_settings[app_name] = data
        return jsonify({"message": "Settings saved"})


### 4. User Profiles API ###

@app.route("/api/user")
@login_required
def get_current_user():
    user = users.get(current_user_id)
    if not user:
        return abort(404)
    return jsonify(user)


@app.route("/api/users")
@login_required
def list_users():
    return jsonify(list(users.values()))


### 5. Filesystem / Storage API (Very simplified) ###

file_storage = {}

@app.route("/api/files/<app_name>", methods=["GET"])
@login_required
def list_files(app_name):
    return jsonify(file_storage.get(app_name, []))


@app.route("/api/files/<app_name>", methods=["POST"])
@login_required
def upload_file(app_name):
    if "file" not in request.files:
        return abort(400, description="No file provided")
    file = request.files["file"]
    content = file.read()
    # Store file in-memory for demo purposes
    file_storage.setdefault(app_name, []).append({
        "filename": file.filename,
        "content": base64.b64encode(content).decode("utf-8")
    })
    return jsonify({"message": "File uploaded"})


@app.route("/api/files/<app_name>/<filename>", methods=["DELETE"])
@login_required
def delete_file(app_name, filename):
    files = file_storage.get(app_name, [])
    before = len(files)
    files = [f for f in files if f["filename"] != filename]
    if len(files) == before:
        return abort(404, description="File not found")
    file_storage[app_name] = files
    return jsonify({"message": "File deleted"})


### 6. Event Log / Audit Trail API ###

@app.route("/api/logs", methods=["GET", "POST"])
@login_required
def logs():
    if request.method == "GET":
        return jsonify(app_logs)
    elif request.method == "POST":
        data = request.json
        if not data or "event" not in data:
            return abort(400, description="Missing event data")
        app_logs.append({
            "event": data["event"],
            "timestamp": int(time.time())
        })
        return jsonify({"message": "Log added"})


### 7. Notification API ###

@app.route("/api/notify", methods=["POST"])
@login_required
def notify():
    data = request.json
    if not data or "message" not in data:
        return abort(400, description="Missing message")
    app_notifications.append({
        "message": data["message"],
        "timestamp": int(time.time()),
        "read": False
    })
    return jsonify({"message": "Notification created"})


@app.route("/api/notifications", methods=["GET"])
@login_required
def get_notifications():
    return jsonify(app_notifications)


### 8. Auth & Permissions API (Basic stubs) ###

@app.route("/api/auth/status")
def auth_status():
    if current_user.is_authenticated:
        return jsonify({"authenticated": True, "user": current_user.username})
    else:
        return jsonify({"authenticated": False})


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    # Simplified: authenticate user here, for demo assume success
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        login_user(user)
        return jsonify({"message": "Logged in"})
    else:
        return abort(401, description="Invalid credentials")


@app.route("/api/auth/logout", methods=["POST"])
@login_required
def auth_logout():
    logout_user()
    return jsonify({"message": "Logged out"})


@app.route("/api/permissions/<app_name>")
@login_required
def get_app_permissions(app_name):
    # Stub: for demo, return full permissions
    return jsonify({"app": app_name, "permissions": ["read", "write", "execute"]})

@app.route("/api/icons/<source>/<category>/<folder>")
def get_app_icon(source, category, folder):
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps"))
    icon_dir = os.path.join(base_path, source, category, folder, "icons")

    for filename in ["icon.png", "icon.webp", "icon.svg", "icon.jpg"]:
        file_path = os.path.join(icon_dir, filename)
        if os.path.isfile(file_path):
            return send_from_directory(icon_dir, filename, mimetype=mimetypes.guess_type(file_path)[0])

    abort(404, description="Icon not found")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Logged out.", "info")
    return redirect(url_for("index"))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
