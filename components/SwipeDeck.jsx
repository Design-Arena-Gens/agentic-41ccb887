"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import profilesData from "../data/profiles.json";

const STORAGE_KEYS = {
  likes: "spark_likes",
  passes: "spark_passes",
};

function loadSet(key) {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
}

export default function SwipeDeck() {
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState(() => loadSet(STORAGE_KEYS.likes));
  const [passes, setPasses] = useState(() => loadSet(STORAGE_KEYS.passes));
  const [matchToast, setMatchToast] = useState(null);

  const profiles = useMemo(() => profilesData.filter(p => !likes.has(p.id) && !passes.has(p.id)), [likes, passes]);
  const active = profiles[index] ?? null;

  useEffect(() => { saveSet(STORAGE_KEYS.likes, likes); }, [likes]);
  useEffect(() => { saveSet(STORAGE_KEYS.passes, passes); }, [passes]);

  const like = useCallback((p) => {
    setLikes(prev => new Set(prev).add(p.id));
    setIndex(i => i + 1);
    setMatchToast({ profile: p });
    setTimeout(() => setMatchToast(null), 3000);
  }, []);

  const nope = useCallback((p) => {
    setPasses(prev => new Set(prev).add(p.id));
    setIndex(i => i + 1);
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="deck-shell">
        {profiles.slice(index, index + 3).map((p, idx) => (
          <DraggableCard key={p.id} profile={p} onLike={like} onNope={nope} isTop={idx === 0} />
        ))}
        {active == null && (
          <div className="empty card" style={{ position: "relative", inset: 0 }}>
            <div>
              <h3>You're all caught up</h3>
              <p style={{ color: "var(--muted)" }}>Come back later for more profiles</p>
              <div style={{ marginTop: 8 }}>
                <a href="/matches">See your matches ?</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {matchToast && (
        <div className="match-toast" role="status">
          <div>
            <strong>It's a match!</strong> You and {matchToast.profile.name.split(" ")[0]} like each other.
          </div>
          <div className="actions">
            <a href="/matches">Open matches</a>
            <button onClick={() => setMatchToast(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DraggableCard({ profile, onLike, onNope, isTop }) {
  const ref = useRef(null);
  const start = useRef({ x: 0, y: 0 });
  const point = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onDown = (e) => {
      dragging.current = true;
      const p = pointFrom(e);
      start.current = p;
      point.current = p;
      el.setPointerCapture?.(e.pointerId ?? 1);
      el.style.transition = "none";
    };

    const onMove = (e) => {
      if (!dragging.current) return;
      point.current = pointFrom(e);
      const dx = point.current.x - start.current.x;
      const dy = point.current.y - start.current.y;
      const rot = Math.max(-15, Math.min(15, dx / 12));
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      const likeBadge = el.querySelector(".badge.like");
      const nopeBadge = el.querySelector(".badge.nope");
      const likeVisible = dx > 20;
      const nopeVisible = dx < -20;
      toggleBadge(likeBadge, likeVisible);
      toggleBadge(nopeBadge, nopeVisible);
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      const dx = point.current.x - start.current.x;
      const dy = point.current.y - start.current.y;
      const threshold = 110;
      if (dx > threshold) {
        fling(el, dx, dy, 1);
        onLike(profile);
      } else if (dx < -threshold) {
        fling(el, dx, dy, -1);
        onNope(profile);
      } else {
        el.style.transition = "transform 160ms ease";
        el.style.transform = "translate(0px, 0px) rotate(0deg)";
        const likeBadge = el.querySelector(".badge.like");
        const nopeBadge = el.querySelector(".badge.nope");
        toggleBadge(likeBadge, false);
        toggleBadge(nopeBadge, false);
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [onLike, onNope, profile]);

  return (
    <article ref={ref} className="card" style={{ zIndex: isTop ? 3 : 1 }}>
      <div className="card-badges">
        <span className="badge like">Like</span>
        <span className="badge nope">Nope</span>
      </div>
      <img src={profile.image} alt="" />
      <div className="card-content">
        <div className="card-header">
          <div className="card-name">{profile.name}</div>
          <div className="card-age">{profile.age}</div>
        </div>
        <div className="card-bio">{profile.bio}</div>
        <div className="tags">
          {profile.tags.map(t => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
      </div>
      <div className="card-actions">
        <button className="action nope" onClick={(e) => { e.stopPropagation(); onNope(profile); }}>?</button>
        <button className="action like" onClick={(e) => { e.stopPropagation(); onLike(profile); }}>?</button>
      </div>
    </article>
  );
}

function pointFrom(e) {
  const x = e.clientX ?? (e.touches?.[0]?.clientX ?? 0);
  const y = e.clientY ?? (e.touches?.[0]?.clientY ?? 0);
  return { x, y };
}

function toggleBadge(el, show) {
  if (!el) return;
  if (show) el.classList.add("show");
  else el.classList.remove("show");
}

function fling(el, dx, dy, dir) {
  const mag = Math.sqrt(dx * dx + dy * dy);
  const normX = (dx / (mag || 1)) * 600 * dir;
  const normY = (dy / (mag || 1)) * 200;
  el.style.transition = "transform 250ms ease-out, opacity 250ms ease-out";
  el.style.transform = `translate(${normX}px, ${normY}px) rotate(${dir * 25}deg)`;
  el.style.opacity = "0";
}
