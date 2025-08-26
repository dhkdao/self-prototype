'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfAppBuilder,
  SelfQRcodeWrapper,
  type SelfApp
} from "@selfxyz/qrcode";
import { zeroAddress } from 'viem';

// const SelfQRcodeWrapper = dynamic(
//   () => import('@selfxyz/qrcode').then(mod => mod.SelfQRcodeWrapper),
//   { ssr: false }
// );

export default function Home() {

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <VerificationComponent />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}

function VerificationComponent() {
  const [selfApp, setSelfApp] = useState<SelfApp>();
  const [universalLink, setUniversalLink] = useState("");
  const [userId] = useState(zeroAddress);

  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        // Contract integration settings
        endpoint: process.env.NEXT_PUBLIC_VERIFICATION_DEPLOYED_ADDR,
        endpointType: "staging_celo",
        userIdType: "hex",
        version: 2,

        // app details
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || "",
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        userDefinedData: "DHK dao self-prototype",
        disclosures: {
          /* 1. what you want to verify from users' identity */
          minimumAge: 18,
          ofac: false,
          excludedCountries: [],

          /* 2. what you want users to reveal */
          // name: false,
          // issuing_state: true,
          nationality: true,
          // date_of_birth: true,
          // passport_number: false,
          // gender: true,
          // expiry_date: false,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [userId]);

  const handleSuccessfulVerification = () => {
    console.log("Verification successful!");
  };

  const openSelfApp = () => {
    if (universalLink) {
      window.open(universalLink, "_blank");
    }
  };
  return (
    <div className="verification-container">
      <h1>Verify Your Identity</h1>
      <p>Scan this QR code with the Self app</p>

      {selfApp && SelfQRcodeWrapper ? (
        <div className="flex flex-col">
          <SelfQRcodeWrapper
            selfApp={selfApp}
            size={150}
            onSuccess={handleSuccessfulVerification}
            onError={() => {
              console.error("Error: Failed to verify identity");
            }}
          />
          <button className="mt-4 mx-auto" onClick={openSelfApp}>
            Open Self App
          </button>
        </div>
      ) : (
        <div>Loading QR Code...</div>
      )}
    </div>
  );
}
