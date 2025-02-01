import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { markProofAsSubmitted } from '@/services/proofService';
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

 const handleDone = async () => {
   try {
     if (!proofCode) {
       throw new Error('No proof code provided');
     }
     await markProofAsSubmitted(proofCode);
     navigation.navigate('historyProof');
   } catch (error) {
     console.error('Error submitting proof:', error);
     ToastAndroid.show('Failed to submit proof', ToastAndroid.SHORT);
   }
 };

 const handleCancel = () => {
   navigation.goBack();
 };

 return (
   <View style={styles.container}>
     <View style={styles.modalContent}>
       <ThemedText style={styles.title}>Proof Details</ThemedText>
       <View style={styles.qrContainer}>
         <QRCode value={proofCode} size={200} />
       </View>
       <Text style={styles.proofText}>Or copy the proof text:</Text>
       <View style={styles.proofTextContainer}>
         <Text style={styles.proofTextValue}>{proofCode}</Text>
         <TouchableOpacity 
           style={styles.copyButton} 
           onPress={handleCopyToClipboard}
         >
           <Text style={styles.copyButtonText}>COPY</Text>
         </TouchableOpacity>
       </View>
       <View style={styles.buttonContainer}>
         <TouchableOpacity 
           style={[styles.button, styles.cancelButton]} 
           onPress={handleCancel}
         >
           <Text style={styles.cancelButtonText}>Cancel</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           style={[styles.button, styles.doneButton]} 
           onPress={handleDone}
         >
           <Text style={styles.doneButtonText}>Done</Text>
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
 qrContainer: {
   marginVertical: 20,
   padding: 10,
   backgroundColor: 'white',
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
   width: '100%',
   marginBottom: 20,
 },
 proofTextValue: {
   flex: 1,
   fontSize: 12,
 },
 copyButton: {
   backgroundColor: '#2196F3',
   padding: 6,
   borderRadius: 4,
 },
 copyButtonText: {
   color: 'white',
   fontSize: 12,
   fontWeight: 'bold',
 },
 buttonContainer: {
   flexDirection: 'row',
   justifyContent: 'flex-end',
   width: '100%',
   marginTop: 20,
 },
 button: {
   paddingVertical: 8,
   paddingHorizontal: 20,
   borderRadius: 20,
   marginLeft: 10,
 },
 cancelButton: {
   backgroundColor: 'transparent',
 },
 doneButton: {
   backgroundColor: 'white',
   elevation: 2,
 },
 cancelButtonText: {
   color: '#666',
   fontSize: 14,
 },
 doneButtonText: {
   color: '#2196F3',
   fontSize: 14,
   fontWeight: 'bold',
 },
});