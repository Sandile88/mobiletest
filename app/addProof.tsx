import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { generateProofCode } from '@/utils/proofUtils';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

  const handleGenerateProof = () => {
    const proofCode = generateProofCode(parseFloat(amount));
    setPendingProofs([
      ...pendingProofs,
      { amount: parseFloat(amount), proof: proofCode },
    ]);
    setAmount('');
  };

  const handleViewProof = (proof: Proof) => {
    navigation.navigate('downloadProof', { proofCode: proof.proof });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <ThemedText>Enter Amount to Generate Proof</ThemedText>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Button title="Generate Proof" onPress={handleGenerateProof} />
      </View>
      {pendingProofs.length > 0 && (
        <View style={styles.pendingProofsContainer}>
          <ThemedText style={styles.title}>Pending Proofs</ThemedText>
          <FlatList
            data={pendingProofs}
            keyExtractor={(item) => item.proof}
            renderItem={({ item }) => (
              <View style={styles.proofItem}>
                <ThemedText style={styles.proofAmount}>{item.amount} tokens</ThemedText>
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