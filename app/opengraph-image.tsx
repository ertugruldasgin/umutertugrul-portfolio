import { ImageResponse } from "next/og";
import { getOGFonts } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = "Umut Ertuğrul - Computer Engineer Sophomore & Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ASCII_NAME = `   __  __                __     ______     __                         __
  / / / /___ ___  __  __/ /_   / ____/____/ /___  ______ ________  __/ /
 / / / / __ \`__ \\/ / / / __/  / __/ / ___/ __/ / / / __ \`/ ___/ / / / / 
/ /_/ / / / / / / /_/ / /_   / /___/ /  / /_/ /_/ / /_/ / /  / /_/ / /  
\\____/_/ /_/ /_/\\__,_/\\__/  /_____/_/   \\__/\\__,_/\\__, /_/   \\__,_/_/   
                                                 /____/`;

export default async function Image() {
  const fonts = await getOGFonts();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0d1117",
        padding: "50px",
        fontFamily: "JetBrains Mono",
      }}
    >
      {/* Terminal pencere */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0d1117",
          border: "2px solid #24c391",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 32px",
            borderBottom: "1px solid #3b4d68",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", fontSize: "20px" }}
          >
            <span style={{ color: "#8b949e" }}>~/whoami</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#3b4d68",
            }}
          >
            <span>umutertugrul.com</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "48px 64px",
            justifyContent: "center",
            gap: "36px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "14px",
              fontSize: "22px",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#24c391" }}>$</span>
            <span style={{ color: "#8b949e" }}>cat</span>
            <span style={{ color: "#e8ecf2" }}>~/whoami</span>
          </div>

          <pre
            style={{
              margin: 0,
              fontFamily: "JetBrains Mono",
              fontSize: "20px",
              color: "#24c391",
              whiteSpace: "pre",
              letterSpacing: 0,
            }}
          >
            {ASCII_NAME}
          </pre>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginLeft: "8px",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                color: "#8b949e",
                display: "flex",
                gap: "10px",
              }}
            >
              <span style={{ color: "#3b4d68" }}>~</span>
              <span>computer-engineering-sophomore@yeditepe</span>
            </div>

            <div
              style={{
                fontSize: "22px",
                color: "#24bac3",
                display: "flex",
                gap: "12px",
              }}
            >
              <span style={{ color: "#3b4d68" }}>&gt;</span>
              <span>
                i build things i wish existed, usually the ones that fit how i
                live.
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 32px",
            borderTop: "1px solid #3b4d68",
            fontSize: "16px",
            color: "#3b4d68",
          }}
        >
          <span>github - hugging face - linkedin</span>
          <span style={{ color: "#24c391" }}>█</span>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
    },
  );
}
