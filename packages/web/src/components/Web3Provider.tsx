"use client";

import React from "react";
import { WagmiProvider, createConfig, webSocket } from "wagmi";
import { celoAlfajores, foundry } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { type Chain } from "viem";
import { appName } from "@/config";

const chains =
  process.env.NODE_ENV === "development"
    ? ([foundry, celoAlfajores] as const)
    : ([celoAlfajores] as const);

const transports: Record<number, ReturnType<typeof webSocket>> = {
  [foundry.id]: process.env.NODE_ENV === "development"
    ? webSocket("http://localhost:8545")
    : undefined as unknown as ReturnType<typeof webSocket>,
  [celoAlfajores.id]: webSocket(
    `https://celo-alfajores.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
  ),
};
// Remove undefined keys (for production)
Object.keys(transports).forEach(
  (key) => transports[key as unknown as number] === undefined && delete transports[key as unknown as number]
);

export const ckConfig = getDefaultConfig({
  // Your dApps chains
  chains,
  transports,

  // Required API Keys
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

  // Required App Info
  appName,

  // Optional App Info
  appDescription: "DHK dao self-prototype",
  appUrl: "https://dhkdao-self.vercel.app", // your app's url
  appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
});

const config = createConfig(ckConfig);
const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
