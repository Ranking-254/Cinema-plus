import React, { useEffect, useState } from "react";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("Install prompt event fired!");
    };

    const handleAppInstalled = () => {
      console.log("App was installed!");
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return alert("App already installed or browser does not support.");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted install!");
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt || isInstalled) return null;

  return (
    <button
      onClick={handleInstallClick}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        padding: "15px 25px",
        backgroundColor: "#E50914",
        color: "white",
        border: "none",
        borderRadius: "50px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        fontWeight: "bold",
        fontSize: "16px",
        cursor: "pointer"
      }}
    >
      Install App 📲
    </button>
  );
};

export default InstallButton;
