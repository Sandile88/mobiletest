import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ToastAndroid } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { claimProof, markProofAsSubmitted } from '@/services/proofService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';

type RootStackParamList = {
   addProof: undefined;
   downloadProof: { proofCode: string };
   historyProof: undefined;
};

type DownloadProofScreenRouteProp = RouteProp<RootStackParamList, 'downloadProof'>;

type DownloadProofRouteProp = RouteProp<{
   params: {
     proofCode: string;
   }
}, 'params'>;

export default function DownloadProofScreen() {
 const { params } = useRoute<DownloadProofRouteProp>();
 const { proofCode } = params;
 const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

 const handleCopyToClipboard = async () => {
   try {
     await Clipboard.setStringAsync(proofCode);
     ToastAndroid.show('Proof code copied to clipboard!', ToastAndroid.SHORT);
   } catch (error) {
     console.error('Error copying to clipboard:', error);
     ToastAndroid.show('Failed to copy proof code', ToastAndroid.SHORT);
   }
 };

 const handleSubmitProof = async () => {
   try {
     if (!proofCode) {
       throw new Error('No proof code provided');
     }
     await claimProof(proofCode);
     await markProofAsSubmitted(proofCode);
     navigation.navigate('historyProof');
   } catch (error) {
     console.error('Error submitting proof:', error);
     ToastAndroid.show('Failed to submit proof', ToastAndroid.SHORT);
   }
 };

 return (
   <View style={styles.container}>
     <ThemedText>Proof Details</ThemedText>
     <View style={styles.qrContainer}>
       <QRCode value={proofCode} size={300} />
     </View>
     <Text style={styles.proofText}>Or copy the proof text:</Text>
     <View style={styles.proofTextContainer}>
       <Text style={styles.proofTextValue}>{proofCode}</Text>
       <Button title="Copy" onPress={handleCopyToClipboard} />
     </View>
     <Button title="Submit Proof" onPress={handleSubmitProof} />
   </View>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   padding: 16,
 },
 qrContainer: {
   marginVertical: 24,
 },
 proofText: {
   marginVertical: 12,
 },
 proofTextContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   padding: 8,
   borderWidth: 1,
   borderColor: 'gray',
   borderRadius: 4,
 },
 proofTextValue: {
   flex: 1,
   fontSize: 12,
 },
});