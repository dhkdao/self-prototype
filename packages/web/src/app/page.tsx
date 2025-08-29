"use client";

import React, { useState } from "react";
import { getUniversalLink } from "@selfxyz/core";
import { ConnectKitButton } from "connectkit";
import {
  SelfAppBuilder,
  SelfQRcodeWrapper,
  type SelfApp,
} from "@selfxyz/qrcode";
import { clsx } from "clsx";
import { useAccount, useConfig } from "wagmi";
import { watchContractEvent } from "wagmi/actions";
import {
  Button,
  Field,
  Input,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import { appName, selfVerificationContract } from "@/config";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <VerificationComponent />
      </main>
    </div>
  );
}

function VerificationComponent() {
  const account = useAccount();
  const [selfApp, setSelfApp] = useState<SelfApp>();
  const [universalLink, setUniversalLink] = useState("");
  const [message, setMessage] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [unwatch, setUnwatch] = useState<() => void>();
  const config = useConfig();

  const openDialog = () => {
    if (!account.address) return;

    try {
      const app = new SelfAppBuilder({
        // Contract integration settings
        endpoint: process.env.NEXT_PUBLIC_VERIFICATION_DEPLOYED_ADDR,
        endpointType: "staging_celo",
        userIdType: "hex",
        version: 2,

        // app details
        appName,
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
        },
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      return;
    }

    setDialogOpen(true);

    // watch for VerificationCompleted event
    console.log("watching...");
    console.log("address:", account.address);
    console.log("config:", config);

    const { abi, address } = selfVerificationContract;
    const unwatch = watchContractEvent(config, {
      abi,
      address,
      eventName: "VerificationCompleted",
      args: {
        sender: account.address,
      },
      onLogs(logs) {
        console.log("Event received", logs);
      },
    });

    setUnwatch(unwatch);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setTimeout(() => {
      setSelfApp(undefined);
      setUniversalLink("");
      if (unwatch) {
        unwatch();
        setUnwatch(undefined);
      }
    }, 1500);
  };

  const handleSuccessfulVerification = async () => {
    console.log("Verification successful!");
    closeDialog();

    // call backend function check api
    try {
      const res = await fetch("/api/verify-successful", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account.address,
          message,
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      console.log("result:", res.json());
    } catch (err) {
      console.error("Error calling verify-successful API:", err);
    }
  };

  const openSelfApp = () => {
    if (universalLink) {
      window.open(universalLink, "_blank");
    }
  };

  return (
    <>
      <div className="verification-container flex flex-col items-center">
        <h1 className="text-lg/8 font-medium">DHK dao Self Prototype</h1>

        <section className="flex flex-col items-center my-4">
          <p className="text-base/8">1. Sign in with your wallet</p>
          <ConnectKitButton />
        </section>

        {account.address && (
          <section className="flex flex-col items-center my-4">
            <p className="text-base/8">2. Write your custom message</p>
            <Field>
              <Input
                className={clsx(
                  "mt-3 block w-full rounded-lg border-none bg-gray-100 px-3 py-1.5",
                  "text-sm/6 text-black focus:outline-2 focus:outline-blue-300",
                )}
                placeholder="Optional"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
          </section>
        )}

        {account.address && (
          <section className="flex flex-col items-center my-4">
            <p className="text-base/8">3. Verify yourself</p>
            <Button
              onClick={openDialog}
              className={clsx(
                "inline-flex justify-center items-center gap-2 rounded-md bg-blue-500 px-3 py-1.5",
                "text-sm/6 font-semibold text-white shadow-inner shadow-white/10 data-focus:outline",
                "data-focus:outline-white data-hover:bg-blue-700 data-open:bg-blue-700 w-40",
              )}
            >
              Verify
            </Button>
          </section>
        )}
      </div>
      <Dialog
        as="div"
        open={isDialogOpen}
        onClose={closeDialog}
        className="relative z-10 focus:outline-none"
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 border border-gray-500"
            >
              <DialogTitle
                as="h2"
                className="text-base/8 font-medium text-black text-center"
              >
                Scan Self QR Code
              </DialogTitle>

              {selfApp && SelfQRcodeWrapper ? (
                <div className="flex flex-col justify-center">
                  <SelfQRcodeWrapper
                    selfApp={selfApp}
                    size={150}
                    onSuccess={handleSuccessfulVerification}
                    onError={() => {
                      console.error("Error: Failed to verify identity");
                    }}
                  />
                  <button
                    className="mt-4 bg-transparent text-blue-600 underline hover:text-blue-800 hover:underline p-0 border-0 font-normal"
                    onClick={openSelfApp}
                  >
                    Open Self App
                  </button>
                </div>
              ) : (
                <div>Loading QR Code...</div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
