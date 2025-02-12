import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { generateProofCode } from '@/utils/proofUtils';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getContract, prepareContractCall, readContract, sendTransaction, toWei } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { thirdwebClient } from '@/config/client';
import { scrollSepoliaTestnet, sepolia } from 'thirdweb/chains';
import { networkConfig } from '@/config/networkConfig';
import { ethers } from 'ethers';
import $u from '@/utils/$u';


const PENDING_PROOFS_KEY = 'pending_proofs';

type RootStackParamList = {
    addProof: undefined;
    downloadProof: { proofCode: string };
    historyProof: undefined;
  };

interface Proof {
    amount: number;
    proof: string;
  }

  const { chainId, uZarContractAddress } = networkConfig;

  const uzarContract = getContract({
    client: thirdwebClient,
    chain: sepolia,
    address: uZarContractAddress,
  
  });



export default function AddProofScreen() {
  const [amount, setAmount] = useState('');
  const [pendingProofs, setPendingProofs] = useState<Proof[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  // loading pending proofs from AsyncStorage when the component mounts
  useEffect(() => {
    loadingPendingProofs();
  }, []);

  const loadingPendingProofs = async () => {
    try {
      const storedProofs = await AsyncStorage.getItem(PENDING_PROOFS_KEY);
      if (storedProofs) {
        setPendingProofs(JSON.parse(storedProofs));
      }
    } catch (error) {
      console.error('Error loading pending proofs: ', error);
    }
  }

  const account = useActiveAccount();

 const handleTransfer = async (amount: number): Promise<boolean> => {
  try {
    if (!account) {
      console.error('No account connected');
      return false;
    }

    // Read current allowance
    const allowance = await readContract({
      contract: uzarContract,
      method: "function allowance(address,address)",
      params: [
        account.address,
        "0xC1245E360B99d22D146c513e41fcB8914BA0bA44" // Consider moving this to a constant or config
      ]
    });
    console.log("Current allowance:", allowance);

    const amountInWei = toWei(amount.toString());

    // If allowance is less than amount, approve more
    if (allowance < amountInWei) {
      const approvalTransaction = prepareContractCall({
        contract: uzarContract,
        method: "function approve(address,uint256)",
        params: [
          "0xC1245E360B99d22D146c513e41fcB8914BA0bA44",
          amountInWei
        ]
      });

      const { transactionHash: approvalHash } = await sendTransaction({ 
        transaction: approvalTransaction, 
        account 
      });
      console.log("Approval transaction hash:", approvalHash);
    }

    // Send the transfer transaction
    const transferTransaction = prepareContractCall({
      contract: uzarContract,
      method: "function transfer(address,uint256)",
      params: [
        "0xC1245E360B99d22D146c513e41fcB8914BA0bA44",
        amountInWei
      ]
    });

    const { transactionHash: transferHash } = await sendTransaction({ 
      transaction: transferTransaction, 
      account 
    });
    console.log("Transfer transaction hash:", transferHash);

    return true;
  } catch (error) {
    console.error('Transfer failed:', error);
    return false;
  }
};
  const handleGenerateProof = async () => {
  const amountNumber = parseFloat(amount);
  
  // First attempt the transfer
  const transferSuccess = await handleTransfer(amountNumber);
  
  if (transferSuccess) {
    const proofCode = generateProofCode(amountNumber);
    const newProof = { amount: amountNumber, proof: proofCode };

    // Update both the state and AsyncStorage
    const updatedProofs = [...pendingProofs, newProof];
    setPendingProofs(updatedProofs);
    await AsyncStorage.setItem(PENDING_PROOFS_KEY, JSON.stringify(updatedProofs));
    setAmount('');
  } else {
    // Handle transfer failure - you might want to show an error message to the user
    console.error('Failed to process transfer');
  }
};

  const handleViewProof = (proof: Proof) => {
    navigation.navigate('downloadProof', { proofCode: proof.proof });
  };

  const secretProof = ()=> {
    const secret = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();
      const nullifier = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();
  
      const input = {
        secret: $u.BN256ToBin(secret).split(""),
        nullifier: $u.BN256ToBin(nullifier).split("")
      };
      console.log("Proof Input:", input);
  }
  console.log("Secret Proof", secretProof());

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <ThemedText style={styles.title}>Enter Amount to Generate Proof</ThemedText>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
        />
        <Button title="Generate Proof" onPress={handleGenerateProof}

        disabled={!amount || isNaN(parseFloat(amount))}/>
      </View>

      {pendingProofs.length > 0 && (
        <View style={styles.pendingProofsContainer}>
          <ThemedText style={styles.title}>Pending Proofs</ThemedText>
          <FlatList
            data={pendingProofs}
            keyExtractor={(item) => item.proof}
            renderItem={({ item }) => (
              <View style={styles.proofItem}>
                <ThemedText style={styles.proofAmount}>{item.amount} uzar</ThemedText>
                <Button title="View" onPress={() => handleViewProof(item)} />
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  pendingProofsContainer: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingVertical: 16,
  },
  proofItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    marginVertical: 8,
  },
  proofAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});