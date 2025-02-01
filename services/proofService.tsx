import AsyncStorage from '@react-native-async-storage/async-storage';
  
const PROOF_HISTORY_KEY = 'proof_history';
const PENDING_PROOFS_KEY = 'pending_proofs';

export async function claimProof(proofCode: any) {
try {

    if (!proofCode) {
        throw new Error('No proof code provided');
      }


    const submittedProofs = await getSubmittedProofs();
    if (submittedProofs.some((proof: { proof: any; }) => proof.proof === proofCode)) {
    throw new Error('Proof has already been submitted');
    }

    console.log('Proof claimed successfully:', proofCode);
    await markProofAsSubmitted(proofCode);
} catch (error) {
    console.error('Error claiming proof:', error);
    throw error;
}
}

export async function markProofAsSubmitted(proofCode: any) {
try {
     if (!proofCode) {
        throw new Error('No proof code provided');
      }


    const pendingProofs = await getPendingProofs();
    const updatedPendingProofs = pendingProofs.filter((proof: { proof: any; }) => proof.proof !== proofCode);
    await AsyncStorage.setItem(PENDING_PROOFS_KEY, JSON.stringify(updatedPendingProofs));

    const submittedProofs = await getSubmittedProofs();
    const proofData = pendingProofs.find((proof: { proof: any; }) => proof.proof === proofCode);
    await AsyncStorage.setItem(
        PROOF_HISTORY_KEY, 
        JSON.stringify([
          ...submittedProofs, 
          {
            ...proofData, 
            date: new Date().toISOString() // Add a date if not already present
          }
        ])
      );
} catch (error) {
    console.error('Error marking proof as submitted:', error);
    throw error;
}
}

export async function getPendingProofs() {
try {
    const pendingProofsString = await AsyncStorage.getItem(PENDING_PROOFS_KEY);
    return pendingProofsString ? JSON.parse(pendingProofsString) : [];
} catch (error) {
    console.error('Error getting pending proofs:', error);
    return [];
}
}

export async function getSubmittedProofs() {
try {
    const submittedProofsString = await AsyncStorage.getItem(PROOF_HISTORY_KEY);
    return submittedProofsString ? JSON.parse(submittedProofsString) : [];
} catch (error) {
    console.error('Error getting submitted proofs:', error);
    return [];
}
}



