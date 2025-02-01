import AsyncStorage from '@react-native-async-storage/async-storage';
  
const PROOF_HISTORY_KEY = 'proof_history';
const PENDING_PROOFS_KEY = 'pending_proofs';
const PROOF_BALANCE_KEY = 'proof_balance'

export async function claimProof(proofCode: string) {
  try {

      if (!proofCode) {
          throw new Error('No proof code provided');
        }

      const submittedProofs = await getSubmittedProofs();
      const proof = submittedProofs.find(p => p.proof === proofCode);

      if (!proof) {
        throw new Error('Proof not found');
      }

      if (proof.claimed) {
      throw new Error('Proof has already been claimed');
      }

      // updating proof balance
      const currentBalance = await getProofBalance();
      const newBalance = currentBalance + proof.amount;
      await AsyncStorage.setItem(PROOF_BALANCE_KEY, newBalance.toString());

      const updatedProofs = submittedProofs.map(p =>
        p.proof === proofCode ? { ...p, claimed: true } : p
      );

      await AsyncStorage.setItem(PROOF_HISTORY_KEY, JSON.stringify(updatedProofs));
      return proof.amount;
  } catch (error) {
        console.error('Error claiming proof:', error);
        throw error;
  }
}


export async function markProofAsSubmitted(proofCode: string) {
  try {
      if (!proofCode) {
          throw new Error('No proof code provided');
        }

        const submittedProofsString = await AsyncStorage.getItem(PROOF_HISTORY_KEY);
        const submittedProofs = submittedProofsString ? JSON.parse(submittedProofsString) : [];
      
        //check if the proof has already been submitted
        if (submittedProofs.some((proof: { proof: string}) => proof.proof === proofCode)) {
          console.log('Proof already submitted:', proofCode);
          return; //exit if the proof already exits
        }


        let amount = 0;
        const parts = proofCode.split('_');
        if (parts.length >= 2) {
          amount = parseFloat(parts[1]);
        }

        const newProof = {
          proof:proofCode,
          amount: amount || 0,
          date: new Date().toISOString(),
          claimed: false
        }


      //get the current pending proofs 
      const pendingProofsString = await AsyncStorage.getItem(PENDING_PROOFS_KEY);
      const pendingProofs = pendingProofsString ? JSON.parse(pendingProofsString) : [];

      const proofToSubmit = pendingProofs.find((proof: { proof: string; }) => proof.proof === proofCode);
      let newSubmittedProof;

      if (proofToSubmit) {
        // if there, pending proof then remove it from pending proofs
        const updatedPendingProofs = pendingProofs.filter((proof: { proof: string; }) => proof.proof !== proofCode);
        await AsyncStorage.setItem(PENDING_PROOFS_KEY, JSON.stringify(updatedPendingProofs));

        newSubmittedProof = {
          ...proofToSubmit,
          date: new Date().toISOString()
        };
      } else {

        // if it's a direct submission (not from pending proofs in addProof page)
        // then extract the amount from proof code if it follows the format proof_amount_timestamp
        let amount = 0;
        const parts = proofCode.split('_');
        if (parts.length >= 2) {
          amount = parseFloat(parts[1]);
        }

        newSubmittedProof = {
          proof:proofCode,
          amount: amount || 0,
          date: new Date().toISOString()
        };
      }

      // adding to submitted proofs
      const updatedSubmittedProofs = [...submittedProofs, newSubmittedProof];
      await AsyncStorage.setItem(PROOF_HISTORY_KEY, JSON.stringify(updatedSubmittedProofs));

      
      const updatedProofs = [...submittedProofs, newProof];
      await AsyncStorage.setItem(PROOF_HISTORY_KEY, JSON.stringify(updatedProofs));
  } catch (error) {
      console.error('Error marking proof as submitted:', error);
      throw error;
  }
}


export async function getProofBalance(): Promise<number> {
  try {
    const balance = await AsyncStorage.getItem(PROOF_BALANCE_KEY);
    if (!balance) return 0;
    
    const parsedBalance = parseFloat(balance);
    return Number.isFinite(parsedBalance) ? parsedBalance : 0;
  } catch (error) {
    console.error('Error getting proof balance:', error);
    return 0;
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
  } catch (error) {
      console.error('Error getting submitted proofs:', error);
      return [];
  }
}



