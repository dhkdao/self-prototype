import { NextRequest, NextResponse } from "next/server";
import {
  countries,
  Country3LetterCode,
  SelfAppDisclosureConfig,
} from "@selfxyz/common";
import {
  countryCodes,
  SelfBackendVerifier,
  AllIds,
  DefaultConfigStore,
  VerificationConfig,
} from "@selfxyz/core";

export async function POST(req: NextRequest) {
  console.log("Received request");
  console.log(req);

  try {
    const body = await req.json();
    const { attestationId, proof, publicSignals, userContextData } = body;

    if (!attestationId || !proof || !publicSignals || !userContextData) {
      return NextResponse.json(
        {
          message:
            "Proof, publicSignals, attestationId and userContextData are required",
        },
        {
          status: 400,
        },
      );
    }

    const requirements: VerificationConfig = {
      minimumAge: 18,
      ofac: false,
      excludedCountries: [],
    };

    const configStore = new DefaultConfigStore(requirements);

    const selfBackendVerifier = new SelfBackendVerifier(
      process.env.NEXT_PUBLIC_SELF_SCOPE || "",
      process.env.NEXT_PUBLIC_SELF_ENDPOINT || "",
      false,
      AllIds,
      configStore,
      "hex",
    );

    const result = await selfBackendVerifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData,
    );

    if (!result.isValidDetails.isValid) {
      return NextResponse.json(
        {
          status: "error",
          result: false,
          message: "Verification failed",
          details: result.isValidDetails,
        },
        { status: 500 },
      );
    }

    const saveOptions = (await configStore.getConfig(
      result.userData.userIdentifier,
    )) as unknown as SelfAppDisclosureConfig;

    return NextResponse.json({
      status: "success",
      result: result.isValidDetails.isValid,
      credentialSubject: result.discloseOutput,
      verificationOptions: {
        minimumAge: saveOptions.minimumAge,
        ofac: saveOptions.ofac,
        excludedCountries: saveOptions.excludedCountries?.map(
          (countryName: string) => {
            const entry = Object.entries(countryCodes).find(
              ([_, name]) => name === countryName,
            );
            return entry ? entry[0] : countryName;
          },
        ),
      },
    });
  } catch (error) {
    console.error("Error verifying proof:", error);
    return NextResponse.json({
      status: "error",
      result: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
