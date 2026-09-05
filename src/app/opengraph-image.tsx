import { ImageResponse } from "next/og";

export const alt = "NYKE FPS profiles, aim settings and gear";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#ffffff",
        color: "#18181b",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ display: "flex", fontSize: 104, fontStyle: "italic", fontWeight: 800, lineHeight: 1 }}>
          NYKE<span style={{ color: "#fb7185" }}>.</span>
        </div>
        <div style={{ background: "#fb7185", height: 4, marginTop: 42, width: 72 }} />
        <div style={{ display: "flex", fontSize: 42, fontWeight: 650, marginTop: 38 }}>
          FPS profiles, aim settings &amp; gear
        </div>
        <div style={{ color: "#71717a", display: "flex", fontSize: 26, marginTop: 22 }}>nyke.life</div>
      </div>
    </div>,
    size,
  );
}
