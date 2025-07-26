import os
import subprocess
import socket
import threading
import pathlib
import random
import time
import signal
from flask import Flask, request, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import requests

env = os.environ.copy()
env["PYTHONIOENCODING"] = "utf-8"

app = Flask(__name__)
CORS(app, resources={r"/api/*"})
running_apps = {}
assigned_ports = {}
process_lock = threading.Lock()

# Automatically find ApolloSuite root from this file's location
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
print(f"[Supervisor] Project root detected: {PROJECT_ROOT}")
def is_executable_available(cmd):
    from shutil import which
    return which(cmd[0]) is not None

core_services = {
    "backend": {
        "path": os.path.join(PROJECT_ROOT, "backend"),
        "start_cmd": ["python", "app.py"],
        "port": 5000,
        "process": None,
    },
    "frontend": {
        "path": os.path.join(PROJECT_ROOT, "frontend"),
        "start_cmd": ["npm", "run", "dev"],
        "port": 5173,
        "process": None,
    },
}

print("[Supervisor] Initializing core services...")
print(core_services["backend"]["path"])
print(core_services["frontend"]["path"])

def is_process_alive(proc):
    return proc and proc.poll() is None

def stream_output(pipe, label):
    for line in iter(pipe.readline, b''):
        print(f"[{label}] {line.decode(errors='replace').rstrip()}")

def start_core_service(name):
    with process_lock:
        svc = core_services[name]
        proc = svc.get("process")

        if name == "backend":
            target = os.path.join(svc["path"], "app.py")
        elif name == "frontend":
            target = os.path.join(svc["path"], "package.json")

        if not os.path.exists(target):
            return f"ERROR: Missing required file for {name} at {target}"

        if is_process_alive(proc):
            return f"{name} already running (PID: {proc.pid}) at http://localhost:{svc['port']}"

        if not is_executable_available(svc["start_cmd"]):
            return f"ERROR: Command '{svc['start_cmd'][0]}' not found in PATH"

        print(f"[Supervisor] Starting '{name}' in {svc['path']} with command: {svc['start_cmd']}")

        if not os.path.isdir(svc["path"]):
            return f"ERROR: Working directory {svc['path']} does not exist"

        cmd = svc["start_cmd"]
        if os.name == "nt" and isinstance(cmd, list):
            cmd = " ".join(cmd)  # convert to string for shell=True

        process = subprocess.Popen(
            cmd,
            cwd=svc["path"],
            shell=(os.name == "nt"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0,
            env=env
        )

        threading.Thread(target=stream_output, args=(process.stdout, f"{name} stdout"), daemon=True).start()
        threading.Thread(target=stream_output, args=(process.stderr, f"{name} stderr"), daemon=True).start()

        svc["process"] = process

def stop_core_service(name):
    with process_lock:
        svc = core_services[name]
        proc = svc.get("process")
        if not is_process_alive(proc):
            svc["process"] = None
            return f"{name} is not running"

        try:
            if os.name == "nt":
                proc.terminate()
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            proc.wait(timeout=10)
        except Exception:
            proc.kill()
        svc["process"] = None
        return f"{name} stopped"

def monitor_core_services():
    with process_lock:
        for name, svc in core_services.items():
            proc = svc.get("process")
            if not is_process_alive(proc):
                print(f"[Supervisor] Core service '{name}' is not running, restarting...")
                msg = start_core_service(name)
                print(f"[Supervisor] {msg}")

scheduler = BackgroundScheduler()
scheduler.add_job(monitor_core_services, "interval", seconds=10)
scheduler.start()

def monitor_health(app_folder, port):
    while app_folder in running_apps:
        try:
            resp = requests.get(f"http://localhost:{port}/health", timeout=2)
            running_apps[app_folder]["status"] = "healthy" if resp.ok else "unresponsive"
        except Exception:
            running_apps[app_folder]["status"] = "unreachable"
        time.sleep(30)

def find_free_port():
    PORT_RANGE = range(7000, 8000)
    for port in PORT_RANGE:
        if port in assigned_ports.values():
            continue
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
    raise RuntimeError("No free port available")

@app.route("/api/supervisor/start_core", methods=["POST"])
def start_core():
    results = []
    for name in core_services.keys():
        msg = start_core_service(name)
        results.append(msg)
    return jsonify({"message": "Core services start attempted", "details": results})

@app.route("/api/supervisor/stop_core", methods=["POST"])
def stop_core():
    results = []
    for name in core_services.keys():
        msg = stop_core_service(name)
        results.append(msg)
    return jsonify({"message": "Core services stop attempted", "details": results})

@app.route("/api/supervisor/core_status", methods=["GET"])
def core_status():
    status = {}
    with process_lock:
        for name, svc in core_services.items():
            proc = svc.get("process")
            status[name] = {
                "running": is_process_alive(proc),
                "pid": proc.pid if is_process_alive(proc) else None,
                "port": svc.get("port")
            }
    return jsonify(status)

@app.route("/api/supervisor/start", methods=["POST"])
def start_app():
    data = request.get_json()
    app_source = data.get("source")
    app_category = data.get("category")
    app_folder = data.get("folder")

    if not (app_source and app_category and app_folder):
        return jsonify({"error": "Missing required fields"}), 400

    app_path = os.path.abspath(os.path.join(PROJECT_ROOT, "apps", app_source, app_category, app_folder))
    start_script = os.path.join(app_path, "start.py")
    venv_python = os.path.join(app_path, "venv", "bin", "python")
    if os.name == "nt":
        venv_python = os.path.join(app_path, "venv", "Scripts", "python.exe")

    if not os.path.isfile(start_script):
        return jsonify({"error": f"No start.py found in {app_path}"}), 404

    if not os.path.isfile(venv_python):
        return jsonify({"error": f"No Python interpreter found in venv for {app_folder}"}), 500

    with process_lock:
        if app_folder in running_apps and is_process_alive(running_apps[app_folder]["process"]):
            return jsonify({"message": f"{app_folder} is already running"}), 200

        port = find_free_port()
        env = os.environ.copy()
        env["PORT"] = str(port)

        process = subprocess.Popen(
            [venv_python, start_script],
            cwd=app_path,
            env=env
        )

        assigned_ports[process.pid] = port
        running_apps[app_folder] = {
            "process": process,
            "pid": process.pid,
            "port": port,
            "status": "starting"
        }

        threading.Thread(target=monitor_health, args=(app_folder, port), daemon=True).start()

    return jsonify({"message": f"{app_folder} started", "pid": process.pid, "port": port})

@app.route("/api/supervisor/stop", methods=["POST"])
def stop_app():
    data = request.get_json()
    app_folder = data.get("folder")

    with process_lock:
        if app_folder not in running_apps:
            return jsonify({"error": f"{app_folder} is not running"}), 404

        process_info = running_apps[app_folder]
        proc = process_info["process"]

        try:
            if os.name == "nt":
                proc.terminate()
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            proc.wait(timeout=10)
        except Exception:
            proc.kill()

        del assigned_ports[proc.pid]
        del running_apps[app_folder]

    return jsonify({"message": f"{app_folder} stopped"})

@app.route("/api/supervisor/launch", methods=["POST"])
def launch_app():
    data = request.get_json()
    app_source = data.get("source")
    app_category = data.get("category")
    app_folder = data.get("folder")

    if not (app_source and app_category and app_folder):
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    with process_lock:
        # If already running, return URL immediately
        if app_folder in running_apps and is_process_alive(running_apps[app_folder]["process"]):
            port = running_apps[app_folder]["port"]
            return jsonify({
                "success": True,
                "message": f"{app_folder} already running",
                "url": f"http://localhost:{port}"
            })

    # Call start_app() which may return either a Response or (Response, status_code)
    result = start_app()

    # Properly unpack result if it is a tuple
    if isinstance(result, tuple):
        response_obj, status_code = result
    else:
        response_obj = result
        status_code = response_obj.status_code  # default status code from Response

    # Check if start_app failed
    if status_code != 200:
        # Extract error message from JSON if possible
        try:
            error_json = response_obj.get_json()
            error_msg = error_json.get("error", "Failed to start app")
        except Exception:
            error_msg = "Failed to start app"

        return jsonify({"success": False, "error": error_msg}), status_code

    # Extract port from response JSON
    start_data = response_obj.get_json()
    port = start_data.get("port")
    if not port:
        return jsonify({"success": False, "error": "Port assignment missing"}), 500

    return jsonify({
        "success": True,
        "message": f"{app_folder} launched",
        "url": f"http://localhost:{port}"
    })

@app.route("/api/supervisor/status", methods=["GET"])
def get_status():
    with process_lock:
        statuses = {
            name: {
                "pid": info["pid"],
                "port": info["port"],
                "status": info["status"]
            } for name, info in running_apps.items()
        }
    return jsonify(statuses)

if __name__ == "__main__":
    print("[Supervisor] Starting backend and frontend core services...")
    for name in core_services.keys():
        print("→", start_core_service(name))
    app.run(port=5500, debug=False, use_reloader=False)