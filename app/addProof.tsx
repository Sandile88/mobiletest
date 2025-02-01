import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { generateProofCode } from '@/utils/proofUtils';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const handleGenerateProof = async () => {
    const proofCode = generateProofCode(parseFloat(amount));
    const newProof = { amount: parseFloat(amount), proof: proofCode};

    // updating both the state and the AsyncStorage
    const updatedProofs = [...pendingProofs, newProof];
    setPendingProofs(updatedProofs);
    await AsyncStorage.setItem(PENDING_PROOFS_KEY, JSON.stringify(updatedProofs));
    setAmount('');
  };

  const handleViewProof = (proof: Proof) => {
    navigation.navigate('downloadProof', { proofCode: proof.proof });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <ThemedText style={styles.title}>Enter Amount to Generate Proof</ThemedText>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Entet amount"
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