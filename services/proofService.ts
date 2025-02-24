import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateProofCode } from '@/utils/proofUtils';
import { networkConfig, proofSystemAdress } from '@/config/networkConfig';
import { thirdwebClient } from '@/config/client';
import { getContract, prepareContractCall, readContract, sendTransaction, toEther, toWei } from 'thirdweb';
import { sepolia } from 'thirdweb/chains';

const PROOF_HISTORY_KEY = 'proof_history';
const PENDING_PROOFS_KEY = 'pending_proofs';
const PROOF_BALANCE_KEY = 'proof_balance'
const LOCKED_BALANCE_KEY = 'locked_balance';


interface ProofTransaction {
  amount: number;
  timestamp: number;
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
}


const { uZarContractAddress } = networkConfig;

const uzarContract = getContract({
  client: thirdwebClient,
  chain: sepolia,
  address: uZarContractAddress,
});


export async function transferToProofSystem(amount: number, account: any): Promise<string> {
  try {
    // Check on-chain balance first
    const balance = await readContract({
      contract: uzarContract,
      method: "function balanceOf(address) returns (uint256)",
      params: [account.address],
    });
    
    const currentBalance = Number(toEther(balance));
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // Track the locked balance to prevent double-spending
    const lockedBalance = await getLockedBalance();
    const availableBalance = currentBalance - lockedBalance;
    
    if (availableBalance < amount) {
      throw new Error('Insufficient available balance');
    }

    // Lock the amount before proceeding
    await setLockedBalance(lockedBalance + amount);

    try {
    const proofCode = generateProofCode(amount);

    const amountInWei = toWei(amount.toString());
    const preparedCall = prepareContractCall({
      contract: uzarContract,
      method: "function transfer(address,uint256)",
      params: [
        proofSystemAdress, // Burn address
        amountInWei
      ]
    });


    const tx = await sendTransaction({
      transaction: preparedCall,
      account: account
    });


    // Record the transaction
    const transaction: ProofTransaction = {
      amount,
      timestamp: Date.now(),
      txHash: tx.transactionHash,
      status: 'pending'
    };

    const pendingProof = {
      proof: proofCode,
      amount,
      transaction
    };

    const pendingProofs = await getPendingProofs();
    await AsyncStorage.setItem(PENDING_PROOFS_KEY, JSON.stringify([...pendingProofs, pendingProof]));

    return proofCode;
    } catch (txError) {
      // If transaction fails, unlock the balance
      await setLockedBalance(lockedBalance);
      console.error('Transaction failed:', txError);
      throw txError;
    }
  } catch (error) {
    console.error('Error in transferToProofSystem:', error);
    throw error;
  }
}



async function getLockedBalance(): Promise<number> {
  try {
    const lockedBalance = await AsyncStorage.getItem(LOCKED_BALANCE_KEY);
    return lockedBalance ? parseFloat(lockedBalance) : 0;
  } catch (error) {
    console.error('Error getting locked balance:', error);
    return 0;
  }
}


async function setLockedBalance(amount: number): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCKED_BALANCE_KEY, amount.toString());
  } catch (error) {
    console.error('Error setting locked balance:', error);
    throw error;
  }
}

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


      const lockedBalance = await getLockedBalance();
      await setLockedBalance(Math.max(0, lockedBalance - proof.amount));
      
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
          date: new Date().toISOString(),
          claimed: false
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

  } catch (error) {
      console.error('Error marking proof as submitted:', error);
      throw error;
  }
}


export async function getProofBalance(): Promise<number> {
  try {
    const balance = await AsyncStorage.getItem(PROOF_BALANCE_KEY);
    return balance ? parseFloat(balance) : 0;
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



