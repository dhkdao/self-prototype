import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  getContract,
  type Address,
  type Abi,
} from "viem";
import { optimism } from "viem/chains";
import { erc20Abi } from "@/config";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("request:", body);

  const { txHash, sender, nationality, times, userData } = body;

  try {
    // 1. verify the event from the txHash
    if (!sender) throw new Error("Sender undefined");
    if (!txHash) throw new Error("txHash undefined");

    // TODO: verify verificationCompleted event happen on the txHash with the sender

    // 2. check on OP that it has DHK token >= 1
    const dhkTokenPublicClient = createPublicClient({
      chain: optimism,
      transport: http(
        `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
    });

    const dhkTokenContract = getContract({
      address: (process.env.NEXT_PUBLIC_DHKTOKEN_ADDR || "") as Address,
      abi: erc20Abi,
      client: dhkTokenPublicClient,
    });

    const decimals = BigInt((await dhkTokenContract.read.decimals()) as number);
    const balance = BigInt(
      (await dhkTokenContract.read.balanceOf([sender])) as bigint,
    );
    const voteThreshold =
      BigInt(process.env.NEXT_PUBLIC_DHKTOKEN_THRESHOLD || "1") * decimals;

    // TODO: 3. check user has a DHK subname in https://app.namespace.ninja
    const senderHasSubname = true;

    const aboveTokenThreshold = balance >= voteThreshold;
    const result = aboveTokenThreshold && senderHasSubname;

    return NextResponse.json({
      status: "success",
      sender,
      result,
      aboveTokenThreshold,
      hasSubname: senderHasSubname,
    });
  } catch (err) {
    console.log("Error verifying proof:", err);

    return NextResponse.json(
      {
        status: "error",
        result: false,
        message: err instanceof Error ? err.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
