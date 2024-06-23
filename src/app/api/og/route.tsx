import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const revalidate = "force-cache";
export const runtime = "nodejs";
export const alt = "OGP画像";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export async function GET(req: NextRequest) {
  // default, user, articleの3種類のOGP画像を生成する
  const OGPType = req.nextUrl.searchParams.get("OGPType") || "default";
  const userID = req.nextUrl.searchParams.get("userID") || "";
  const userIcon = req.nextUrl.searchParams.get("userIcon") || "";
  const userStatusMessage = req.nextUrl.searchParams.get("userStatusMessage") || "";
  const articleTitle = req.nextUrl.searchParams.get("articleTitle") || "";
  const articleUser = req.nextUrl.searchParams.get("articleUser") || "";

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <div style={{ height: 40, backgroundColor: "#5AC8D8", width: "100%" }} />
        {OGPType === "user" ? (
          <h1
            style={{
              flex: 1,
              maxWidth: "80%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <h1
              style={{
                display: "flex",
              }}
            >
              <img
                src={userIcon}
                alt=""
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  marginRight: 20,
                }}
              />
              <span
                style={{
                  borderBottom: "solid 2px #333333",
                  color: "#202020",
                  height: 80,
                  fontSize: 48,
                }}
              >
                @{userID}
              </span>
            </h1>
            <span
              style={{
                position: "relative",
                top: -100,
                color: "#434343",
                fontSize: 20,
              }}
            >
              {userStatusMessage}
            </span>
          </h1>
        ) : OGPType === "article" ? (
          <h1
            style={{
              flex: 1,
              maxWidth: "80%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <h1
              style={{
                display: "flex",
              }}
            >
              <span
                style={{
                  borderBottom: "solid 2px #333333",
                  color: "#202020",
                  height: 40,
                  fontSize: 24,
                }}
              >
                {articleTitle}
              </span>
            </h1>
            <span
              style={{
                position: "relative",
                top: -120,
                color: "#434343",
                fontSize: 20,
              }}
            >
              @{articleUser}
            </span>
          </h1>
        ) : (
          <h1
            style={{
              flex: 1,
              maxWidth: "80%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                borderBottom: "solid 2px #333333",
                color: "#202020",
              }}
            >
              TellPro
            </span>
          </h1>
        )}
        <img
          src={`${process.env.NEXT_PUBLIC_TRUTH_URL}/svg/logo.svg`}
          alt=""
          style={{
            width: 80,
            height: 80,
            position: "absolute",
            bottom: 80,
            right: 80,
          }}
        />
        <div style={{ height: 40, backgroundColor: "#5AC8D8", width: "100%" }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
