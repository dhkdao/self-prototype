"use client";

import { useEffect, useState } from "react";
import type { VerificationResult } from "@/types";
import {
  appName,
  alfajoresTxUrlPrefix,
  thresholdTokenAmt,
  opMainnetAddrUrlPrefix,
} from "@/config";

export default function VerificationResultPage() {
  const linkClasses =
    "mt-4 bg-transparent text-blue-600 underline hover:text-blue-800 hover:underline p-0 border-0 font-normal";

  const [verificationResult, setVerificationResult] =
    useState<VerificationResult>();

  useEffect(() => {
    const _verificationResult = JSON.parse(
      localStorage.getItem("verificationResult") || "",
    ) as VerificationResult;
    setVerificationResult(_verificationResult);
  }, []);

  return (
    <div className="verification-result-container flex flex-col items-center">
      <h1 className="text-lg/8 font-medium">{appName}</h1>

      <section className="flex flex-col items-center my-4">
        <h1 className="text-base/8">Result</h1>
        <ul>
          <li>
            User address:{" "}
            {verificationResult?.sender && (
              <strong>
                <a
                  className={linkClasses}
                  href={opMainnetAddrUrlPrefix + verificationResult?.sender}
                  target="_blank"
                >
                  {verificationResult?.sender}
                </a>
              </strong>
            )}
          </li>
          <li>
            User is self.xyz verified?{" "}
            {verificationResult?.txHash ? (
              <strong>
                <a
                  className={linkClasses}
                  href={alfajoresTxUrlPrefix + verificationResult?.txHash}
                  target="_blank"
                >
                  true
                </a>
              </strong>
            ) : (
              <strong>false</strong>
            )}
          </li>
          <li>
            User has threshold amount of DHK token (
            {thresholdTokenAmt.toString()})?{" "}
            <strong>
              {verificationResult?.aboveTokenThreshold ? "true" : "false"}
            </strong>
          </li>
          <li>
            User has DHK ID Subname (mocked)?{" "}
            <strong>{verificationResult?.hasSubname ? "true" : "false"}</strong>
          </li>
        </ul>
      </section>
    </div>
  );
}
