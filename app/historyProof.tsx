import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, ToastAndroid } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import QRCode from 'react-native-qrcode-svg';
import { getSubmittedProofs } from '@/services/proofService';
import { Checkbox } from '@/components/Checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROOF_HISTORY_KEY = 'proof_history';

interface Proof {
  proof: string;
  date: string;
  amount: number;
  claimed?: boolean;
}

export default function HistoryProofScreen() {
  const [proofHistory, setProofHistory] = useState<Proof[]>([]);
  const [selectedProofs, setSelectedProofs] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProofHistory = async () => {
      try {
        setIsLoading(true);
        const history = await getSubmittedProofs();
        setProofHistory(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error('Error fetching proof history:', error);
        setProofHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProofHistory();
  }, []);


  const handleDelete = () => {
    if (selectedProofs.length === 0) return;

    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${selectedProofs.length} proof${selectedProofs.length > 1 ? 's' : ''}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedHistory = proofHistory.filter(
                proof => !selectedProofs.includes(proof.proof)
              );
              await AsyncStorage.setItem(PROOF_HISTORY_KEY, JSON.stringify(updatedHistory));
              setProofHistory(updatedHistory);
              setSelectedProofs([]);
              setIsSelectionMode(false);
              ToastAndroid.show('Proofs deleted successfully', ToastAndroid.SHORT);
            } catch (error) {
              console.error('Error deleting proofs:', error);
              ToastAndroid.show('Failed to delete proofs', ToastAndroid.SHORT);
            }
          },
        },
      ]
    );
  };


  const renderProofItem = ({ item }: { item: Proof }) => {
    if (!item || !item.proof) return null;

    return (
      <View style={styles.proofItem}>
        {isSelectionMode && (
          <View style={styles.checkboxContainer}>
            <Checkbox
              checked={selectedProofs.includes(item.proof)}
              onCheckedChange={() => {
                setSelectedProofs(prev =>
                  prev.includes(item.proof)
                    ? prev.filter(p => p !== item.proof)
                    : [...prev, item.proof]
                );
              }}
            />
          </View>
        )}
        <View style={styles.proofContent}>
          <QRCode value={item.proof} size={60} />
          <View style={styles.proofInfo}>
            <ThemedText style={styles.proofDate}>
              {new Date(item.date).toLocaleDateString()}
            </ThemedText>
            <ThemedText style={styles.proofAmount}>
              {item.amount} uzar
            </ThemedText>
          </View>
          {item.claimed && (
            <View style={styles.claimedBadge}>
              <ThemedText style={styles.claimedText}>Claimed</ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Proof History</ThemedText>
        {proofHistory.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedProofs([]);
            }}
            style={styles.selectButton}
          >
            <ThemedText style={styles.selectButtonText}>
              {isSelectionMode ? 'Cancel' : 'Select'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {isSelectionMode && selectedProofs.length > 0 && (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <ThemedText style={styles.deleteButtonText}>
            Delete Selected ({selectedProofs.length})
          </ThemedText>
        </TouchableOpacity>
      )}

      {proofHistory.length === 0 ? (
        <View style={styles.centerContent}>
          <ThemedText>No proof history available</ThemedText>
        </View>
      ) : (
        <FlatList
          data={proofHistory}
          keyExtractor={(item) => item.proof}
          renderItem={renderProofItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectButton: {
    padding: 8,
  },
  selectButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  proofItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  proofContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proofInfo: {
    flex: 1,
    marginLeft: 12,
  },
  proofDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  proofAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  claimedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  claimedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});