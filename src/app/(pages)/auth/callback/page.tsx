"use client";

import "./Callback.sass";
import { useEffect, useState } from "react";

export default function CallbackPage() {
  const [message, setMessage] = useState("Loading...");
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const idToken = hashParams.get("id_token");
      const state = hashParams.get("state");
      const error = hashParams.get("error");

      if (error) {
        setMessage(`Error authorizing: ${error}`);
        setStatus("error");
        return;
      }

      if (!accessToken || !idToken || !state) {
        setMessage("The required authorization parameters are missing");
        setStatus("error");
        return;
      }

      const storedState = sessionStorage.getItem("google_oauth_state");
      const storedNonce = sessionStorage.getItem("google_oauth_nonce");

      if (state !== storedState) {
        setMessage("Authorization state mismatch");
        setStatus("error");
        return;
      }

      try {
        const tokenParts = idToken.split(".");
        if (tokenParts.length !== 3) {
          throw new Error("Invalid ID token format");
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.nonce !== storedNonce) {
          throw new Error("Nonce mismatch");
        }

        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        const userInfo = await userInfoResponse.json();

        const authData = {
          provider: "google",
          tokens: { access_token: accessToken, id_token: idToken },
          userInfo,
          createdAt: new Date().toISOString(),
        };

        const existingData = JSON.parse(
          localStorage.getItem("oauth_providers") || "[]",
        );
        existingData.push(authData);
        localStorage.setItem("oauth_providers", JSON.stringify(existingData));

        setMessage("Authorization successful! Tokens saved");
        setStatus("success");

        sessionStorage.removeItem("google_oauth_nonce");
        sessionStorage.removeItem("google_oauth_state");

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (err: any) {
        console.error("Auth error:", err);
        setMessage(`Authorization error: ${err.message}`);
        setStatus("error");
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="callback-container">
      <div className="callback-message">{message}</div>

      {status === null && (
        <div className="spinner">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}

      {status === "success" && <img src="/complete.svg" alt="Success" />}
      {status === "error" && <img src="/error.svg" alt="Error" />}
    </div>
  );
}
