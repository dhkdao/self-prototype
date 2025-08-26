import * as fs from 'fs';
import * as path from 'path';
import "dotenv/config";

import { createPublicClient, webSocket, parseAbi } from 'viem';

const RPC_URL = "http://localhost:8545";
const contractAddress = process.env.NEXT_PUBLIC_VERIFICATION_DEPLOYED_ADDR || '';

const publicClient = createPublicClient({
  transport: webSocket(RPC_URL),
});

console.log(`Listening to on-chain events\nrpc-url: ${RPC_URL}, address: ${contractAddress}`);

// Event types listen to
const unwatch = publicClient.watchEvent({
  address: contractAddress,
  events: parseAbi([
    'event VerificationCompleted(address indexed sender, string indexed nationality, bytes userData)'
  ]),
  onLogs: (logs) => console.log(logs)
});
