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

    //get the current pending proofs 
    const pendingProofsString = await AsyncStorage.getItem(PENDING_PROOFS_KEY);
    const pendingProofs = pendingProofsString ? JSON.parse(pendingProofsString) : [];


    const proofToSubmit = pendingProofs.find((proof: any) => proof.proof === proofCode);

    if (!proofToSubmit) {
      throw new Error('Proof not found found in pending proofs');
    }

    // remove proof from pending proofs
    // const pendingProofs = await getPendingProofs();
    const updatedPendingProofs = pendingProofs.filter((proof: any) => proof.proof !== proofCode);
    await AsyncStorage.setItem(PENDING_PROOFS_KEY, JSON.stringify(updatedPendingProofs));


    const submittedProofsString = await AsyncStorage.getItem(PROOF_HISTORY_KEY);
    const submittedProofs = submittedProofsString ? JSON.parse(submittedProofsString) : [];
    // const submittedProofs = await getSubmittedProofs();

    const newSubmittedProof = {
      ...proofToSubmit,
      date: new Date().toISOString()
    };

    // await AsyncStorage.setItem(
    //     PROOF_HISTORY_KEY, 
    //     JSON.stringify([
    //       ...submittedProofs, 
    //       {
    //         ...proofData, 
    //         date: new Date().toISOString() // Add a date if not already present
    //       }
    //     ])
    //   );

    const updatedSubmittedProofs = [...submittedProofs, newSubmittedProof];
    await AsyncStorage.setItem(PROOF_HISTORY_KEY, JSON.stringify(updatedSubmittedProofs));

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
    if (!submittedProofsString) {
      return [];
    }
    const submittedProofs = JSON.parse(submittedProofsString);
    return Array.isArray(submittedProofs) ? submittedProofs : [];
    // return submittedProofsString ? JSON.parse(submittedProofsString) : [];
} catch (error) {
    console.error('Error getting submitted proofs:', error);
    return [];
}
}



