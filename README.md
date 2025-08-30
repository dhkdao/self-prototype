# Self Prototype

DHK dao snapshot-self plugin prototype

- Self: https://self.xyz
  - docs: https://docs.self.xyz/
  - Self Developer Tools: https://tools.self.xyz/

Snapshot
- Snapshot: https://docs.snapshot.box/developer-guides/validation-strategy
- [DHK dao snapshot page](https://snapshot.box/#/s:dhkdao.eth)

Getting Celo Alfajores testnet token
- Get Celo Alfajores testnet token at: [learnweb3](https://learnweb3.io/)
- Get LINK testnet token: https://faucets.chain.link/celo-alfajores-testnet
- Swap for Celo native tokens: https://app.mento.org/

## Deployment

- Before deploying the verification contract on Celo network, make sure to run DeploySelfVerification script in simulation mode, get the contract deployment address, and use the [Self Developer Tools](https://tools.self.xyz/) to generate the correct scope value and set it to **SELF_SCOPE** inside `.env` file.

- frontend: https://dhkdao-self.vercel.app

- SelfVerification:
  Celo Alfajores Testnet: [`0x0Ea37D3264b940C94D68DA1EB34C291D62Ba8Ab5`](https://celo-alfajores.blockscout.com/address/0x0Ea37D3264b940C94D68DA1EB34C291D62Ba8Ab5)

## Demo

- [demo video (web-side)](https://www.loom.com/share/9b7b2bc04d884c9ea24d934085a0ee79?sid=0473c41d-4c9c-48ff-92d7-895d2ef2623c)
- [demo video (mobile-side)](https://www.dropbox.com/scl/fi/4ogz6l14iip4zl3rde3ak/dhkdao-self-demo.MP4?rlkey=t7tmer0w390ado2rg6gmtbn8d&dl=0)

## Verification Flow

The verification flow is as follow:

1. Showing the Self QR code. The QR Code is configured [here](https://github.com/dhkdao/self-prototype/blob/a6a5ab229c76188df8f22a93f9e2d694bb4eccfb/packages/web/src/components/VerificationComponent.tsx#L69-L97).

2. On-chain verification happens in [the smart contract](https://github.com/dhkdao/self-prototype/blob/main/packages/contracts/src/SelfVerification.sol), with the callback function implemented at [**customVerificationHook()**](https://github.com/dhkdao/self-prototype/blob/a6a5ab229c76188df8f22a93f9e2d694bb4eccfb/packages/contracts/src/SelfVerification.sol#L37-L52), emitting the **VerificationCompleted** event.

3. Front-end [listens to](https://github.com/dhkdao/self-prototype/blob/a6a5ab229c76188df8f22a93f9e2d694bb4eccfb/packages/web/src/components/VerificationComponent.tsx#L42-L53) VerificationCompleted event. Upon event emitted, it will call [backend `/api/verify-successful` route](https://github.com/dhkdao/self-prototype/blob/a6a5ab229c76188df8f22a93f9e2d694bb4eccfb/packages/web/src/components/VerificationComponent.tsx#L128-L143).

4. The backend checks the user DHK token balance >= 1, and other logics (e.g. check for subname), and return a JSON corresponding if a user satisfy all the conditions.
