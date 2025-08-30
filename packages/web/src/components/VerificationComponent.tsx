"use client";

import React, { useState, useEffect } from "react";
import { getUniversalLink } from "@selfxyz/core";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import {
  SelfAppBuilder,
  SelfQRcodeWrapper,
  type SelfApp,
} from "@selfxyz/qrcode";
import { clsx } from "clsx";
import type { Log } from "viem";
import { useAccount, useConfig, useWatchContractEvent } from "wagmi";
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
import type { VerificationCompletedEventArgs, EventLog } from "@/types";

export default function VerificationComponent() {
  const account = useAccount();
  const config = useConfig();
  const router = useRouter();

  const [selfApp, setSelfApp] = useState<SelfApp>();
  const [universalLink, setUniversalLink] = useState("");
  const [message, setMessage] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isFNCallback, setFNCallback] = useState(false);
  const [evReceived, setEvReceived] =
    useState<VerificationCompletedEventArgs>();

  // watch for VerificationCompleted event
  useWatchContractEvent({
    address: selfVerificationContract.address,
    abi: selfVerificationContract.abi,
    eventName: "VerificationCompleted",
    onLogs(logs: Log[]) {
      // Use the last log only
      if (logs.length > 1) {
        console.error(
          "Unexpected more than one VerificationCompleted event:",
          logs.length,
        );
      }

      // Extract the event arguments out
      const lastLog = logs[logs.length - 1] as unknown as EventLog;
      const args = {
        txHash: lastLog.transactionHash,
        ...lastLog.args,
      };
      setEvReceived(args);
    },
  });

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
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setTimeout(() => {
      setSelfApp(undefined);
      setUniversalLink("");
    }, 1500);
  };

  // If the two states are set, call the backend /api/verify-successful
  useEffect(() => {
    if (!isFNCallback || !evReceived) return;

    (async () => {
      const ev = { ...evReceived };

      setFNCallback(false);
      setEvReceived(undefined);

      // call backend function check api
      try {
        const res = await fetch("/api/verify-successful", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ev),
        });

        if (!res.ok) throw new Error("API request failed");

        localStorage.setItem(
          "verificationResult",
          JSON.stringify(await res.json()),
        );
        router.push("/result");
      } catch (err) {
        console.error("Error calling verify-successful API:", err);
      }
    })();
  }, [isFNCallback, evReceived, router]);

  return (
    <>
      <div className="verification-container flex flex-col items-center">
        <h1 className="text-lg/8 font-medium">{appName}</h1>

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
                    onSuccess={() => {
                      setFNCallback(true);
                      closeDialog();
                    }}
                    onError={() => {
                      console.error("Error: Failed to verify identity");
                    }}
                  />
                  <button
                    className="mt-4 bg-transparent text-blue-600 underline hover:text-blue-800 hover:underline p-0 border-0 font-normal"
                    onClick={() => {
                      universalLink && window.open(universalLink, "_blank");
                    }}
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
