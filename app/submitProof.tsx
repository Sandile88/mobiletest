import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ToastAndroid } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { claimProof } from '@/services/proofService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
   addProof: undefined;
   downloadProof: { proofCode?: string };
   historyProof: undefined;
};

export default function SubmitProofScreen() {
  const [proofText, setProofText] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubmitProof = async () => {
    try {
      if (!proofText.trim()) {
        ToastAndroid.show('Please enter a proof code', ToastAndroid.SHORT);
        return;
      }

      const claimedAmount = await claimProof(proofText.trim());
      ToastAndroid.show(`Successfully claimed ${claimedAmount} tokens!`, ToastAndroid.SHORT);
      navigation.goBack(); // going back to previous screen instead of history
    } catch (error: any) {
      console.error('Error submitting proof:', error);
      ToastAndroid.show(error.message || 'Failed to submit proof', ToastAndroid.LONG);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <ThemedText style={styles.title}>Claim Proof</ThemedText>
        <ThemedText style={styles.subtitle}>Enter your proof code to claim tokens:</ThemedText>
        <TextInput
          style={styles.input}
          value={proofText}
          onChangeText={setProofText}
          placeholder="Enter proof code here"
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]} 
            onPress={handleSubmitProof}
          >
            <Text style={styles.submitButtonText}>Claim Proof</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});






