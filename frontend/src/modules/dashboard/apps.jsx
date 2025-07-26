import React, { useEffect, useState } from "react";

function localhost(port) {
  return `http://localhost:${port}`;
}
var __backendUrl = localhost(5000);
export default function AppsDashboard() {
  const [appsByCategory, setAppsByCategory] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
  fetch(__backendUrl + "/api/apps")
    .then((res) => res.json())
    .then((apps) => {
      console.log("Loaded apps:", apps); // ✅ Add this
      const grouped = {};
      const expanded = {};
      apps.forEach((app) => {
        const category = app.category || "Uncategorized";
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(app);
        expanded[category] = true; // auto-expand
      });
      setAppsByCategory(grouped);
      setExpandedFolders(expanded);
    })
    .catch((err) => {
      console.error("Failed to fetch apps:", err);
      setAppsByCategory({});
    });
  }, []);


  const toggleFolder = (category) => {
  setExpandedFolders((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };


  return (
    <div style={{ display: "flex", gap: 32 }}>
      {/* Folder View */}
      <div style={{ minWidth: 280 }}>
        <h2 style={{ marginBottom: 16 }}>Apps</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {Object.entries(appsByCategory).map(([category, apps]) => (
            <li key={category} style={{ marginBottom: 20 }}>
              <div
                onClick={() => toggleFolder(category)}
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  background: "#333",
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "#eee",
                  border: "1px solid #444",
                }}
              >
                📁 {category} ({apps.length})
              </div>
              {expandedFolders[category] && (
                <ul style={{ listStyle: "none", paddingLeft: 12, marginTop: 8 }}>
                  {apps.map((app) => (
                    <li
                      key={`${category}-${app.name}`}
                      onClick={() => setSelectedApp(app)}
                      style={{
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 6,
                        background: selectedApp?.name === app.name ? "#1976d2" : "#222",
                        color: selectedApp?.name === app.name ? "#fff" : "#ccc",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        border: "1px solid #333",
                      }}
                    >
                      {app.icon && (
                        <img
                          src={__backendUrl + app.icon}
                          alt={app.name}
                          style={{ width: 28, height: 28, borderRadius: 4 }}
                        />
                      )}
                      <span>{app.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* App Details */}
      <div style={{ flex: 1 }}>
        {selectedApp ? (
          <div>
            <h2>{selectedApp.name}</h2>
            {selectedApp.icon && (
              <img
                src={__backendUrl + selectedApp.icon}
                alt={selectedApp.name}
                style={{ width: 64, height: 64, borderRadius: 10, marginBottom: 16 }}
              />
            )}
            <p style={{ color: "#aaa" }}>{selectedApp.description}</p>
            <p style={{ fontSize: "0.9em", color: "#777" }}>
              <strong>Source:</strong> {selectedApp.source} <br />
              <strong>Category:</strong> {selectedApp.category}
            </p>
            <button
              style={{
                marginTop: 16,
                padding: "10px 24px",
                borderRadius: 8,
                background: "#00e676",
                color: "#222",
                fontWeight: 700,
                fontSize: "1.1rem",
                border: "none",
                cursor: "pointer",
              }}
              onClick={async () => {
                try {
                  const res = await fetch("http://localhost:5500/api/supervisor/launch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      source: selectedApp.source,
                      category: selectedApp.category,
                      folder: selectedApp.folder,
                    }),
                  });
                  const data = await res.json();
                  if (data.success && data.url) {
                    window.open(data.url, "_blank");
                  } else {
                    alert("Launch failed: " + (data.error || data.message || "Unknown error"));
                  }
                } catch (err) {
                  console.error("Launch error:", err);
                  alert("An unexpected error occurred.");
                }
              }}
            >
              Open App
            </button>
          </div>
        ) : (
          <div style={{ color: "#888" }}>Select an app to view details.</div>
        )}
      </div>
    </div>
  );
}