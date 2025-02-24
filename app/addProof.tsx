import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, ToastAndroid } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useActiveAccount } from 'thirdweb/react';
import { ethers } from 'ethers';
import $u from '@/utils/$u';
import { getPendingProofs, transferToProofSystem } from '@/services/proofService';

type RootStackParamList = {
    addProof: undefined;
    downloadProof: { proofCode: string };
    historyProof: undefined;
  };

interface Proof {
    amount: number;
    proof: string;
  }


export default function AddProofScreen() {
  const [amount, setAmount] = useState('');
  const [pendingProofs, setPendingProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const account = useActiveAccount();



  // loading pending proofs from AsyncStorage when the component mounts
  useEffect(() => {
    loadingPendingProofs();
  }, []);

  const loadingPendingProofs = async () => {
    try {
      const storedProofs = await getPendingProofs();
      setPendingProofs(storedProofs);
    } catch (error) {
      console.error('Error loading pending proofs: ', error);
      ToastAndroid.show('Error loading proofs', ToastAndroid.SHORT);

    }
  }


  const handleGenerateProof = async () => {
    try {
      
      setIsLoading(true);
      const amountNumber = parseFloat(amount);

      if (isNaN(amountNumber) || amountNumber <= 0) {
        ToastAndroid.show('Please enter a valid amount', ToastAndroid.SHORT);
        return;
      }
      

      if (!account) {
        ToastAndroid.show('Please connect your wallet', ToastAndroid.SHORT);
        return;
      }

      const proofCode = await transferToProofSystem(amountNumber, account);

      const newProof = { amount: amountNumber, proof: proofCode};
      setPendingProofs([...pendingProofs, newProof]);
      setAmount('');

      ToastAndroid.show('Proof generated successfully', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error generating proof:', error);
      ToastAndroid.show(
        error instanceof Error ? error.message : 'Error generating proof',
        ToastAndroid.SHORT
      );
    } finally {
      setIsLoading(false);
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
          editable={!isLoading}
        />
        <Button 
          title={isLoading ? "Generating..." : "Generate Proof"}
          onPress={handleGenerateProof}
          disabled={isLoading || !amount || isNaN(parseFloat(amount))}/>
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