"use client";

import "./Home.sass";
import { useState, useEffect } from "react";
import { randomString } from "./lib/oauth";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const REDIRECT_URI = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;

interface ProviderData {
  provider: string;
  tokens: any;
  userInfo: any;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const [createModal, setCreateModal] = useState(false);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  useEffect(() => {
    const storedProviders = JSON.parse(
      localStorage.getItem("oauth_providers") || "[]",
    );

    const timeout = setTimeout(() => {
      setLoading(false);
      setProviders(storedProviders);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const handleDeleteAccount = async (index: number) => {
    setRemovingIndex(index);

    setTimeout(async () => {
      const providerToDelete = providers[index];
      const newProviders = providers.filter((_, i) => i !== index);
      localStorage.setItem("oauth_providers", JSON.stringify(newProviders));
      setProviders(newProviders);
      setRemovingIndex(null);

      if (providerToDelete.provider === "google") {
        try {
          await fetch(
            `https://oauth2.googleapis.com/revoke?token=${providerToDelete.tokens.access_token}`,
            {
              method: "POST",
              headers: {
                "Content-type": "application/x-www-form-urlencoded",
              },
            },
          );
        } catch (error) {
          console.error("Failed to revoke token:", error);
        }
      }
    }, 300);
  };

  function handleGoogleAuth() {
    const state = randomString(16);
    const nonce = randomString(16);

    sessionStorage.setItem("google_oauth_state", state);
    sessionStorage.setItem("google_oauth_nonce", nonce);

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "token id_token",
      scope: "openid profile email",
      state,
      nonce,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  return (
    <div className="home">
      <span>
        <img src="/logo.svg" alt="Logo" width="54" />
      </span>
      <div className="accounts-container">
        <div className="accounts-list">
          <AnimatePresence>
            {loading &&
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="account-item skeleton"
                  initial={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="account-info-container">
                    <div className="skeleton-icon" />
                    <div className="account-info">
                      <div className="skeleton-text short" />
                      <div className="skeleton-text long" />
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>

          {!loading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="account-list"
            >
              <AnimatePresence>
                {providers.map((provider, index) => (
                  <motion.div
                    key={provider.createdAt}
                    layout
                    variants={itemVariants}
                    className={`account-item ${removingIndex === index ? "removing" : ""}`}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="account-info-container">
                      <img
                        src={`/${provider.provider}.svg`}
                        alt={provider.provider}
                        width="32"
                        className="provider-icon"
                      />
                      <div className="account-info">
                        <span className="account-name">
                          {provider.userInfo.name || provider.userInfo.email}
                        </span>
                        <span className="account-provider">
                          {provider.provider}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteAccount(index)}
                    >
                      <img src="/delete.svg" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={() => setCreateModal(true)}
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src="/add.svg" />
          <span>new account</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {createModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setCreateModal(false)}
                className="btn-close"
              >
                <img src="/close.svg" alt="Close" width="16" />
              </button>

              <div className="providers-grid">
                <motion.button
                  onClick={handleGoogleAuth}
                  className="provider-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/google.svg" alt="Google" width="32" />
                  <span>Google</span>
                </motion.button>

                <motion.button
                  className="provider-btn telegram"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/telegram.svg" alt="Telegram" width="32" />
                  <span>Telegram</span>
                </motion.button>

                <motion.button
                  className="provider-btn discord"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/discord.svg" alt="Discord" width="32" />
                  <span>Discord</span>
                </motion.button>

                <motion.button
                  className="provider-btn microsoft"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/microsoft.svg" alt="Microsoft" width="32" />
                  <span>Microsoft</span>
                </motion.button>

                <motion.button
                  className="provider-btn github"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/githubl.svg" alt="GitHub" width="32" />
                  <span>GitHub</span>
                </motion.button>

                <motion.button
                  className="provider-btn reddit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/reddit.svg" alt="Reddit" width="32" />
                  <span>Reddit</span>
                </motion.button>

                <motion.button
                  className="provider-btn spotify"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src="/spotify.svg" alt="Spotify" width="32" />
                  <span>Spotify</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <span>
        <Link href="https://github.com/Faynot/INF-auth">
          <img src="/github.svg" alt="GitHub" width="64" />
        </Link>
      </span>
    </div>
  );
}
