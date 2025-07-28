import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFolder, FaFileAlt, FaUpload, FaPlus } from "react-icons/fa";

const STORAGE_DATA = {
  id: "root",
  name: "My Drive",
  type: "folder",
  children: [
    {
      id: "f1",
      name: "Projects",
      type: "folder",
      children: [
        { id: "file1", name: "Report.docx", type: "file", extension: "docx" },
        { id: "file2", name: "Presentation.pptx", type: "file", extension: "pptx" },
      ],
    },
    {
      id: "f2",
      name: "Photos",
      type: "folder",
      children: [
        { id: "file3", name: "Vacation.jpg", type: "file", extension: "jpg" },
      ],
    },
    { id: "file4", name: "Todo.txt", type: "file", extension: "txt" },
  ],
};

// Utility: Icon based on type or extension
const FileIcon = ({ type, extension }) => {
  if (type === "folder") return <FaFolder size={48} color="#f7b500" />;
  switch (extension) {
    case "docx":
    case "doc":
      return <FaFileAlt size={48} color="#1a73e8" />;
    case "pptx":
    case "ppt":
      return <FaFileAlt size={48} color="#d93025" />;
    case "txt":
      return <FaFileAlt size={48} color="#5f6368" />;
    case "jpg":
    case "png":
    case "gif":
      return <FaFileAlt size={48} color="#0f9d58" />; // You may replace with image icon
    default:
      return <FaFileAlt size={48} color="#9aa0a6" />;
  }
};

export default function Drive() {
  const [currentFolder, setCurrentFolder] = useState(STORAGE_DATA);
  const [path, setPath] = useState([STORAGE_DATA]); // breadcrumb

  const openFolder = useCallback(
    (folder) => {
      setCurrentFolder(folder);
      setPath((prev) => [...prev, folder]);
    },
    [setCurrentFolder, setPath]
  );

  const navigateTo = useCallback(
    (index) => {
      setPath((prev) => prev.slice(0, index + 1));
      setCurrentFolder(path[index]);
    },
    [path]
  );

  const [selectedItems, setSelectedItems] = useState(new Set());

  // Toggle select
  const toggleSelect = (id) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Google Sans', Arial, sans-serif",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#1a73e8",
            border: "none",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 4,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <FaUpload />
          Upload
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#34a853",
            border: "none",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 4,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <FaPlus />
          New Folder
        </button>
      </div>

      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid #e0e0e0",
          fontSize: 14,
          color: "#5f6368",
          display: "flex",
          gap: 8,
          userSelect: "none",
        }}
      >
        {path.map((folder, i) => (
          <React.Fragment key={folder.id}>
            <button
              onClick={() => navigateTo(i)}
              style={{
                background: "none",
                border: "none",
                color: "#1a73e8",
                cursor: i === path.length - 1 ? "default" : "pointer",
                fontWeight: i === path.length - 1 ? "600" : "400",
                textDecoration: i === path.length - 1 ? "underline" : "none",
                pointerEvents: i === path.length - 1 ? "none" : "auto",
              }}
              aria-current={i === path.length - 1 ? "page" : undefined}
            >
              {folder.name}
            </button>
            {i !== path.length - 1 && <span style={{ color: "#5f6368" }}> / </span>}
          </React.Fragment>
        ))}
      </nav>

      {/* Content Grid */}
      <main
        style={{
          flex: 1,
          padding: 24,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
          backgroundColor: "#f8f9fa",
        }}
      >
        <AnimatePresence initial={false}>
          {currentFolder.children &&
            currentFolder.children.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() =>
                  item.type === "folder" ? openFolder(item) : alert(`Opening file: ${item.name}`)
                }
                onDoubleClick={() =>
                  item.type === "folder" ? openFolder(item) : alert(`Opening file: ${item.name}`)
                }
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  backgroundColor: selectedItems.has(item.id) ? "#e8f0fe" : "#fff",
                  border: selectedItems.has(item.id)
                    ? "2px solid #1a73e8"
                    : "1px solid #dfe1e5",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 1px 3px rgb(60 64 67 / 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  transition: "background-color 0.2s ease, border-color 0.2s ease",
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  alert(`Right-click menu placeholder for ${item.name}`);
                }}
                onMouseDown={(e) => {
                  if (e.detail === 1) {
                    toggleSelect(item.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${item.type} named ${item.name}`}
              >
                <FileIcon type={item.type} extension={item.extension} />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#202124",
                    textAlign: "center",
                    wordBreak: "break-word",
                  }}
                >
                  {item.name}
                </span>
              </motion.div>
            ))}
        </AnimatePresence>
      </main>
    </div>
  );
}
