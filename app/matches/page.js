"use client";
import { useEffect, useMemo, useState } from "react";
import profilesData from "../../data/profiles.json";

const STORAGE_KEYS = { likes: "spark_likes" };

function loadLikes() {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.likes) || "[]")); }
  catch { return new Set(); }
}

export default function MatchesPage() {
  const [likes, setLikes] = useState(() => loadLikes());

  useEffect(() => {
    const on = () => setLikes(loadLikes());
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  const matches = useMemo(() => profilesData.filter(p => likes.has(p.id)), [likes]);

  if (matches.length === 0) {
    return (
      <div className="empty">
        <div>
          <h3>No matches yet</h3>
          <p style={{ color: "var(--muted)" }}>Swipe right on people you like and you'll see them here.</p>
          <div style={{ marginTop: 8 }}>
            <a href="/swipe">Start swiping ?</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "min(880px, 94vw)", display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Matches</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {matches.map(m => (
          <li key={m.id} style={{ background: "var(--card)", border: "1px solid #1f2937", borderRadius: 16, overflow: "hidden" }}>
            <img src={m.image} alt="" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
            <div style={{ padding: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <strong>{m.name}</strong>
                <span style={{ color: "var(--muted)" }}>{m.age}</span>
              </div>
              <p style={{ margin: "6px 0 0", color: "#cbd5e1" }}>{m.bio}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
