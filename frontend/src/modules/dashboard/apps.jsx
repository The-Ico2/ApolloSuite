import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function localhost(port) {
    return `http://localhost:${port}`;
}
const __backendUrl = localhost(5000);

export default function AppsDashboard() {
    const [appsBySource, setAppsBySource] = useState({});
    const [openFolder, setOpenFolder] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null);

    const folderRef = useRef();
    const detailsRef = useRef();

    useEffect(() => {
        fetch(__backendUrl + "/api/apps")
            .then((res) => res.json())
            .then((apps) => {
                const grouped = {};
                apps.forEach((app) => {
                    const source = app.source || "Uncategorized";
                    grouped[source] = grouped[source] || [];
                    grouped[source].push(app);
                });
                console.log("[Fetch Success] Loaded Apps:", grouped);
                setAppsBySource(grouped);
            })
            .catch((err) => console.error("[Fetch Error]", err));
    }, []);

    useEffect(() => {
        if (openFolder !== null) {
            console.log(`[Effect] openFolder is now: ${openFolder}`);
        }
    }, [openFolder]);

    const open = (source) => {
        try {
            console.log(`Trying to open folder "${source}" (Current open: ${openFolder})`);
            if (openFolder === source) {
                console.log("Folder already open. No action taken.");
                return;
            }

            setSelectedApp(null);
            setOpenFolder(source);
            console.log(`Called setOpenFolder("${source}"). State will update asynchronously.`);
        } catch (err) {
            console.error("[Open Folder Error]", err);
        }
    };

    const closeDetails = () => setSelectedApp(null);
    const closeFolder = () => {
      console.log(`Closing folder "${openFolder}"`);
      setOpenFolder(null);
    };

    // Shared flag to prevent double close
    const clickedInsideDetails = useRef(false);

    const handleClick = (e) => {
        try {
            // Check for details overlay first
            if (selectedApp) {
                if (detailsRef.current && detailsRef.current.contains(e.target)) {
                    clickedInsideDetails.current = true;
                    return;
                }
                if (!detailsRef.current.contains(e.target)) {
                    closeDetails();
                    return;
                }
            }

            // After details are closed, check for folder overlay
            if (openFolder && !folderRef.current.contains(e.target)) {
                closeFolder();
            }
        } catch (err) {
            console.error("[Outer Click Handler Error]", err);
        }
    };

    useEffect(() => {
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, [openFolder, selectedApp]);

    return (
        <div style={{ padding: 32, background: "#111", color: "#eee", minHeight: "100vh", position: "relative" }}>
            {/* Folder icons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 24 }}>
                {Object.entries(appsBySource).map(([source, apps]) => (
                    <div
                        key={source}
                        onClick={(e) => {
                            e.stopPropagation();
                            open(source);
                        }}
                        style={{
                            height: 120,
                            aspectRatio: "1 / 1",
                            padding: 8,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            background: "#333",
                            borderRadius: 8,
                            cursor: "pointer",
                            textTransform: "capitalize",
                            fontWeight: "bold",
                            position: "relative",
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                            {apps.slice(0, 4).map((app) => (
                                <div
                                    key={app.name}
                                    style={{
                                        background: "#444",
                                        borderRadius: 6,
                                        padding: 4,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {app.icon ? (
                                        <img
                                            src={__backendUrl + app.icon}
                                            alt={app.name}
                                            style={{ width: 24, height: 24, borderRadius: 4 }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: "1rem" }}>📦</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span>{source}</span>
                            <span style={{ color: "#aaa" }}>{apps.length}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Expanded folder (overlay) with animation */}
            <AnimatePresence>
                {openFolder && appsBySource[openFolder]?.length > 0 && (
                    <motion.div
                        key="folderOverlay"
                        onClick={() => closeFolder()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.6)",
                            zIndex: 100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 20,
                        }}
                    >
                        <motion.div
                            key="folderContent"
                            ref={folderRef}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                height: "85vh",
                                aspectRatio: "1 / 1",
                                background: "#222",
                                borderRadius: 16,
                                padding: 16,
                                overflowY: "auto",
                                display: "flex",
                                gap: 12,
                                border: "1px solid #444",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.7)",
                            }}
                        >
                            {appsBySource[openFolder].map((app) => (
                                <div
                                    key={app.name}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedApp(app);
                                    }}
                                    style={{
                                        background: selectedApp?.name === app.name ? "#1976d2" : "#333",
                                        borderRadius: 12,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        aspectRatio: "1 / 1",
                                        height: 120,
                                        gap: 12,
                                        cursor: "pointer",
                                        padding: 12,
                                        textAlign: "center",
                                        overflow: "hidden",
                                    }}
                                >
                                    {app.icon ? (
                                        <img
                                            src={__backendUrl + app.icon}
                                            alt={app.name}
                                            style={{ width: 48, height: 48, borderRadius: 8 }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: "1.5rem" }}>📦</span>
                                    )}
                                    <div>{app.name}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* App details overlay with animation */}
            <AnimatePresence>
                {selectedApp && (
                    <motion.div
                        key="detailsOverlay"
                        onClick={(e) => {
                          closeDetails();
                          e.stopPropagation(); // prevents bubbling to window
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.6)",
                            zIndex: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <motion.div
                            key="detailsContent"
                            ref={detailsRef}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                height: "80vh",
                                aspectRatio: "10 / 11",
                                background: "#333",
                                color: "#fff",
                                borderRadius: 16,
                                padding: 24,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                overflowY: "auto",
                            }}
                        >
                            <div>
                                {selectedApp.icon && (
                                    <img
                                        src={__backendUrl + selectedApp.icon}
                                        alt={selectedApp.name}
                                        style={{
                                            height: 100,
                                            aspectRatio: "1 / 1",
                                            objectFit: "cover",
                                            objectPosition: "left",
                                            borderRadius: 8,
                                            marginBottom: 16,
                                        }}
                                    />
                                )}
                                <h2>{selectedApp.name}</h2>
                                <p style={{ color: "#ccc" }}>{selectedApp.description}</p>
                            </div>

                            {/* Bottom row: Source and Open button */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: 24,
                                }}
                            >
                                <p style={{ margin: 0, color: "#aaa", fontSize: "1.25em", fontWeight: 500, fontFamily: "monospace" }}>
                                    {selectedApp.source}
                                </p>
                                <button
                                    style={{
                                        padding: "8px 20px",
                                        borderRadius: 8,
                                        background: "#00e676",
                                        color: "#222",
                                        fontWeight: 600,
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
                                                    folder: selectedApp.folder,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (data.success && data.url) window.open(data.url, "_blank");
                                            else alert("Launch failed: " + (data.error || data.message));
                                        } catch (err) {
                                            alert("Unexpected error: " + err.message);
                                        }
                                    }}
                                >
                                    Open App
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
