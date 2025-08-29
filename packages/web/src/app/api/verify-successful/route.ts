import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("Received request");
  console.log(req);

  // 1. get the account address
  // 2. check on OP that it has DHK token >= 1
}
