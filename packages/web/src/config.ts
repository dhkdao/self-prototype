import type { Abi, Address } from "viem";
import SelfVerificationABI from "@/abi/SelfVerification.json";

export const selfVerificationContract = {
  address: (process.env.NEXT_PUBLIC_VERIFICATION_DEPLOYED_ADDR ||
    "0x") as Address,
  abi: SelfVerificationABI.abi as Abi,
};

export const appName = "DHK dao Identity Verification";
