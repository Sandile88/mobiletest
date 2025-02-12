import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TransferScreen() {
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');

    const handleTransfer = () => {
        console.log('Transferring', amount, 'to', address);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="wallet" size={24} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Recipient Address"
                        value={address}
                        onChangeText={setAddress}
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="currency-usd" size={24} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount (uZAR)"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#666"
                    />
                </View>

                <Pressable 
                    style={styles.transferButton}
                    onPress={handleTransfer}
                >
                    <ThemedText style={styles.transferButtonText}>Transfer</ThemedText>
                </Pressable>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f5f5f5',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#000',
    },
    transferButton: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    transferButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});