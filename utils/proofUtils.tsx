export function generateProofCode(amount: number) {
    const timestamp = Date.now();
    return `PROOF_${amount.toFixed(2)}_${timestamp}`;
  }