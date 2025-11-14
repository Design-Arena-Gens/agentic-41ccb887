"use client";
import SwipeDeck from "../../components/SwipeDeck";

export default function SwipePage() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", placeItems: "center" }}>
      <h2 style={{ margin: 0 }}>Swipe</h2>
      <SwipeDeck />
    </div>
  );
}
