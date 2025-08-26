'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getUniversalLink } from "@selfxyz/core";
import { ConnectKitButton } from "connectkit";
import {
  SelfAppBuilder,
  SelfQRcodeWrapper,
  type SelfApp
} from "@selfxyz/qrcode";
import { clsx } from 'clsx';
import { useAccount } from 'wagmi';
import { zeroAddress } from 'viem';

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
  const account = useAccount();
  const [selfApp, setSelfApp] = useState<SelfApp>();
  const [universalLink, setUniversalLink] = useState("");
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!account.address) return;

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
        userId: account.address,
        userDefinedData: message,
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
  }, [account, message]);

  const handleSuccessfulVerification = () => {
    console.log("Verification successful!");
  };

  const openSelfApp = () => {
    if (universalLink) {
      window.open(universalLink, "_blank");
    }
  };
  return (
    <div className="verification-container flex flex-col items-center">
      <h1 className="text-lg/8 font-medium">DHK dao Self Prototype</h1>

      <section className="flex flex-col items-center my-4">
        <p className="text-base/8">1. Sign in with your wallet</p>
        <ConnectKitButton />
      </section>

      { account.address && (<section className="flex flex-col items-center">
        <p className="text-base/8">2. Scan the QR code to verify you are a human</p>

        {selfApp && SelfQRcodeWrapper ? (
          <div className="flex flex-col">
            <InputTextBox
              value={message}
              onChange={setMessage}
              placeholder="Additional message"
            />
            <SelfQRcodeWrapper
              selfApp={selfApp}
              size={150}
              onSuccess={handleSuccessfulVerification}
              onError={() => {
                console.error("Error: Failed to verify identity");
              }}
            />
            <button className="mt-4 mx-auto bg-transparent text-blue-600 underline hover:text-blue-800 hover:underline p-0 border-0 font-normal" onClick={openSelfApp}>
              Open Self App
            </button>
          </div>
        ) : (
          <div>Loading QR Code...</div>
        )}
      </section>)}
    </div>
  );
}

function InputTextBox({ value, onChange, placeholder = '', ...props }) {
  return (
    <input
      className={clsx(
        'mt-3 block w-full rounded-lg border-none bg-gray-100 px-3 py-1.5 text-sm/6 text-black',
        'focus:outline-2 focus:outline-blue-300'
      )}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      {...props}
    />
  );
}
