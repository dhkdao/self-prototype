"use client";

import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { type Chain } from "viem";
import { appName } from "@/config";

// Celo Sepolia custom chain (testnet)
const celoSepolia: Chain = {
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
    public: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
};

const chains = [celoSepolia] as const;
const transports: Record<number, ReturnType<typeof http>> = {
  [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org" as string),
};

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
