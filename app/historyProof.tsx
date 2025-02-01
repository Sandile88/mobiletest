import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import QRCode from 'react-native-qrcode-svg';
import { getSubmittedProofs } from '@/services/proofService';

interface Proof {
    proof: string;
    date: string;
    amount: number;
  }

export default function HistoryProofScreen() {
    const [proofHistory, setProofHistory] = useState<Proof[]>([]);

    useEffect(() => {
        const fetchProofHistory = async () => {
          try {
            const history = await getSubmittedProofs();
            setProofHistory(history || []);
          } catch (error) {
            console.error('Error fetching proof history:', error);
            setProofHistory([]);
          }
        };
        fetchProofHistory();
      }, []);

  const renderProofItem = ({ item }: { item: Proof }) => (
    <View style={styles.proofItem}>
      <QRCode value={item.proof} size={60} />
      <ThemedText style={styles.proofDate}>{item.date}</ThemedText>
      <ThemedText style={styles.proofAmount}>{item.amount} tokens</ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Proof History</ThemedText>
      <FlatList
        data={proofHistory}
        keyExtractor={(item) => item.proof}
        renderItem={renderProofItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 16,
      textAlign: 'center',
    },
    listContainer: {
      paddingVertical: 16,
    },
    proofItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 8,
      marginVertical: 8,
    },
    proofDate: {
      flex: 1,
      marginHorizontal: 16,
      fontSize: 14,
      color: 'gray',
    },
    proofAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });