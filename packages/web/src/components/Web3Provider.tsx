"use client"

import { WagmiProvider, createConfig, webSocket } from "wagmi";
import { celoAlfajores } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

export const ckConfig = getDefaultConfig({
  // Your dApps chains
  chains: [celoAlfajores],
  transports: {
    // RPC URL for each chain
    [celoAlfajores.id]: webSocket(
      `https://celo-alfajores.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
  },

  // Required API Keys
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

  // Required App Info
  appName: "DHK dao self-prototype",

  // Optional App Info
  appDescription: "DHK dao self-prototype",
  appUrl: "https://dhkdao-self.vercel.app", // your app's url
  appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
});

const config = createConfig(ckConfig);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
