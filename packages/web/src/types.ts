import type { Address, Log, Hash } from "viem";

export type VerificationCompletedEventArgs = {
  txHash: Hash;
  sender: Address;
  nationality: string;
  times: number;
  userData: string;
};

export type EventLog = Log & { args: any };

export type VerificationResult = {
  status: string;
  sender: Address;
  result: boolean;
  txHash: Hash;
  aboveTokenThreshold: boolean;
  hasSubname: boolean;
};
