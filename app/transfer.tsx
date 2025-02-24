import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { View, StyleSheet, TextInput, Pressable, ToastAndroid } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getContract, prepareContractCall, readContract, sendTransaction, toWei } from "thirdweb";
import { thirdwebClient } from "@/config/client";
import { sepolia } from "thirdweb/chains";
import { networkConfig } from "@/config/networkConfig";
import { useActiveAccount } from "thirdweb/react";
import { useRouter, Stack } from "expo-router";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";


type RootStackParamList = {};

const { chainId, uZarContractAddress } = networkConfig;

const uzarContract = getContract({
  client: thirdwebClient,
  chain: sepolia,
  address: uZarContractAddress,

});

export default function TransferScreen() {
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    const account = useActiveAccount();
    
    const handleTransfer = async (amount: number): Promise<boolean> => {
      try {
        setIsLoading(true);
        if (!account) {
          console.error('No account connected');
          ToastAndroid.show('No account connected', ToastAndroid.SHORT);
          return false;
        }

        if (!address) {
          console.error('No recipient address provided');
          ToastAndroid.show('No recipient address provided', ToastAndroid.SHORT);

          return false;
        }

        // Read current allowance
        const allowance = await readContract({
          contract: uzarContract,
          method: "function allowance(address,address)",
          params: [
            account.address,
            address
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
              address,
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
            address,
            amountInWei
          ]
        });
        

        const { transactionHash: transferHash } = await sendTransaction({ 
          transaction: transferTransaction, 
          account 
        });
        console.log("Transfer transaction hash:", transferHash);


        ToastAndroid.show(`Successfully sent ${amount} tokens!`, ToastAndroid.LONG);
        router.back();
    
        return true;
      } catch (error) {
        console.error('Transfer failed:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
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
                
                    style={[
                        styles.transferButton,
                        (!amount || !address || isNaN(parseFloat(amount))) ? styles.disabledButton : null
                      ]}
                    onPress={() => handleTransfer(parseFloat(amount))}
                    disabled={!amount || !address || isNaN(parseFloat(amount))}
                        
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
    disabledButton: {
        opacity: 0.5,
    },
    transferButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});