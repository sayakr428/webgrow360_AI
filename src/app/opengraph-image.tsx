import { ImageResponse } from "next/og";

export const alt = "WebGrow360 .AI: The Intelligence Edition";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#e8e5dd", position: "relative", overflow: "hidden", color: "#111111" }}>
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 120,
            width: 380,
            height: 380,
            borderRadius: 9999,
            border: "64px solid #0070f8",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
          <div style={{ fontSize: 30, fontWeight: 700, display: "flex" }}>WebGrow360 .AI</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 700, lineHeight: 0.92, letterSpacing: -4 }}>
            <span>The</span>
            <span>Intell//gence</span>
            <span>Edition</span>
          </div>
          <div style={{ fontSize: 30, display: "flex" }}>AI agents, automation and data systems. Kolkata, India.</div>
        </div>
      </div>
    ),
    size
  );
}
