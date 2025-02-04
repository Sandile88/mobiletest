// import { Image, StyleSheet, View, useColorScheme } from "react-native";
// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "@/components/ThemedView";
// import {
//   useActiveAccount,
//   useDisconnect,
//   useActiveWallet,
//   ConnectButton,
// } from "thirdweb/react";
// import {
//   getUserEmail,
//   inAppWallet,
// } from "thirdweb/wallets/in-app";
// import { client } from "@/constants/thirdweb";
// import { useEffect, useState } from "react";
// import { createWallet } from "thirdweb/wallets";
// import { baseSepolia, ethereum, scrollSepoliaTestnet, sepolia } from "thirdweb/chains";
// import { createAuth } from "thirdweb/auth";
// import React from "react";
// import { 
//   Ionicons,
//   MaterialCommunityIcons,
//   FontAwesome5 
// } from '@expo/vector-icons';
// import { useRouter } from "expo-router";
// import { getProofBalance } from "@/services/proofService";
// import { thirdwebClient } from "@/config/client";
// import { networkConfig } from "@/config/networkConfig";
// import { defineChain, getContract, readContract, toEther } from "thirdweb";


// interface BalanceDisplayProps {
//   label: string;
//   amount?: N;
// }


// const wallets = [
//   inAppWallet({
//     auth: {
//       options: [
//         "google",
//         "facebook",
//         "discord",
//         "telegram",
//         "email",
//         "phone",
//         "passkey",
//       ],
//       passkeyDomain: "thirdweb.com",
//     },
//     smartAccount: {
//       chain: baseSepolia,
//       sponsorGas: true,
//     },
//   }),
//   createWallet("io.metamask"),
//   createWallet("com.coinbase.wallet", {
//     appMetadata: {
//       name: "Thirdweb RN Demo",
//     },
//     mobileConfig: {
//       callbackURL: "https://thirdweb.com",
//     },
//     walletConfig: {
//       options: "smartWalletOnly",
//     },
//   }),
//   createWallet("me.rainbow"),
//   createWallet("com.trustwallet.app"),
//   createWallet("io.zerion.wallet"),
// ];


// const thirdwebAuth = createAuth({
//   domain: "localhost:3000",
//   client,
// });



// const { chainId, uZarContractAddress } = networkConfig;

// const account = useActiveAccount();
//   const [selectedTab, setSelectedTab] = useState("buy");
//   const [balance, setBalance] = useState(0);

//   const handleTabChange = (tab: string) => {
//     setSelectedTab(tab);
//   };
  
//   const uzarContract = getContract({
//     client: thirdwebClient,
//     chain: defineChain(chainId),
//     address: uZarContractAddress,
  
//   });

//   const userBalance = async () => {
//     if (!account) {
//       throw new Error("Account is undefined");
//     }
//     const balance = await readContract({
//       contract: uzarContract,
//       method: "function balanceOf(address) returns (uint256)",
//       params: [account.address],
//     });
//     return balance;
//   }

//   useEffect(() => {
//     if (account) {
//       userBalance().then((balance) => {

//         setBalance(Number(toEther(balance)));
//       });
//     }

//   } )



// const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ label, amount }) => {
//   const [balance, setBalance] = useState(0);

//   useEffect(() => {
//     const loadBalance = async () => {
//       try {
//         if (label === "Proof Balance") {
//           const proofBalance = await getProofBalance();
//           const formattedBalance = Number.isFinite(proofBalance) ? 
//             proofBalance.toFixed(2) : "0.00";
//           setBalance(Number(toEther(formattedBalance)));
//         } else {
//           setBalance(Number(toEther(amount)));
//         }
//       } catch (error) {
//         console.error('Error loading balance:', error);
//         setBalance(Number(toEther(balance))); 
//       }
//     };

//     loadBalance();

//     // setting up an interval for proof balance updates
//     if (label === "Proof Balance") {
//       const interval = setInterval(loadBalance, 30000);
//       return () => clearInterval(interval);
//     }
//   }, [label, amount]);

//   const displayValue = label === "Proof Balance" ? 
//     `R${balance}` : 
//     balance;

//   return (
//     <View style={styles.balanceContainer}>
//       <ThemedText style={styles.balanceLabel}>{label}</ThemedText>
//       <ThemedText style={styles.balanceAmount}>{displayValue}</ThemedText>
//     </View>
//   );
// };



// interface Asset {
//   imageUrl: string;
//   balance: number;
//   name: string;
//   value: number;
// }

// const assets: Asset[] = [
//   {
//     balance: 0,
//     imageUrl: require("@/assets/images/uzar.png"),
//     name: "uZAR",
//     value: 1.00,
//   },
//   {
//     balance: 0,
//     value: 0.99,
//     imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
//     name: "USDT",
//   },
// ];

// const ActionButton = ({ iconName, iconFamily = "Ionicons", label }: { 
//   iconName: string; 
//   iconFamily?: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5";
//   label: string;
// }) => {
//   const IconComponent = {
//     Ionicons,
//     MaterialCommunityIcons,
//     FontAwesome5
//   }[iconFamily];

//   return (
//     <View style={styles.actionButton}>
//       <View style={styles.actionIcon}>
//         <IconComponent name={iconName} size={24} color="#fff" />
//       </View>
//       <ThemedText style={styles.actionLabel}>{label}</ThemedText>
//     </View>
//   );
// };


// const AssetTile: React.FC<{ asset: Asset }> = ({ asset }) => (
//   <ThemedView style={styles.assetTile}>
//     <View style={styles.assetLeftSection}>
//       <Image 
//         source={typeof asset.imageUrl === 'string' ? { uri: asset.imageUrl } : asset.imageUrl}
//         style={styles.assetImage}
//       />
//       <View style={styles.assetInfo}>
//         <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
//         <ThemedText style={styles.assetValue}>
//           {asset.name === 'uZAR' ? `R${asset.value.toFixed(2)}` : `$${asset.value.toFixed(2)}`}
//         </ThemedText>
//       </View>
//     </View>
//     <ThemedText style={styles.assetBalance}>
//       {asset.name === 'uZAR' ? `R${asset.balance.toFixed(2)}` : `$${asset.balance.toFixed(2)}`}
//     </ThemedText>
//   </ThemedView>
// );



// export default function HomeScreen() {
//   const theme = useColorScheme();
//   const wallet = useActiveWallet();
//   const account = useActiveAccount();
//   const [email, setEmail] = useState<string>();
//   const { disconnect } = useDisconnect();
//   const router = useRouter();
//   const balance = userBalance();
//   const [proofBalance, setProofBalance] = useState(0);

//   useEffect(() => {
//     if (wallet && wallet.id === "inApp") {
//       getUserEmail({ client }).then(setEmail);
//     }
//   }, [wallet]);


//   // adding effect to fetch proof balance
//   useEffect(() => {
//     const fetchProofBalance = async () => {
//       try {
//         const balance = await getProofBalance();
//         setProofBalance(Number(toEther(balance.toFixed(2))));
//       } catch (error) {
//         console.error('Error fetching proof balance:', error);
//         setProofBalance(Number(toEther(0)));
//       }
//     };

//     fetchProofBalance();
//     const interval = setInterval(fetchProofBalance, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const calculateTotalBalance = () => {
//     const balanceNum = parseFloat(Number(toEther(balance)));
//     const proofBalanceNum = parseFloat(Number(toEther(balance)));
//     return (balanceNum + proofBalanceNum).toFixed(2);
//   }

//   return (
//     <View style={styles.mainContainer}>
//     <View style={styles.header}>
//       <View style={styles.connectSection}>
//         <ConnectButton
//           client={client}
//           theme={theme || "dark"}
//           wallets={wallets}
//           chain={sepolia}
//         />
//       </View>
//         {/* yet to change icons used */}
//         <View style={styles.headerIcons}>
//           <MaterialCommunityIcons
//             name="upload-outline"  size={24} 
//             color={theme === 'dark' ? '#fff' : '#000'}  
//             onPress={() => router.push("/addProof")} />
//           <MaterialCommunityIcons 
//             name="download-outline" size={24} 
//             color={theme === 'dark' ? '#fff' : '#000'} 
//             onPress={() => router.push("/submitProof")} /> 
//           <MaterialCommunityIcons 
//             name="history" size={24} 
//             color={theme === 'dark' ? '#fff' : '#000'} 
//             onPress={() => router.push("/historyProof")} /> 
//         </View>
//       </View>


//       <ThemedView style={styles.container}>
//         <View style={styles.profileSection}>
//           <View style={styles.avatarContainer}>
//             <ThemedText style={styles.avatarText}>JD</ThemedText>
//           </View>
//         </View>

//         <View style={styles.balanceGrid}>
//           <BalanceDisplay label="Balance" amount={balance} />
//           <BalanceDisplay label="Proof Balance" amount={proofBalance} />
//           <BalanceDisplay label="Total Balance" amount={calculateTotalBalance()} />
//         </View>

//         <View style={styles.actionButtonsContainer}>
//           <ActionButton 
//             iconName="paper-plane" 
//             iconFamily="FontAwesome5" 
//             label="Pay" 
//           />
//           <ActionButton 
//             iconName="wallet" 
//             iconFamily="Ionicons" 
//             label="Receive" 
//           />
//           <ActionButton 
//             iconName="arrow-down-circle" 
//             iconFamily="Ionicons" 
//             label="Deposit" 
//           />
//           <ActionButton 
//             iconName="arrow-up-circle" 
//             iconFamily="Ionicons" 
//             label="Withdraw" 
//           />
//         </View>

//         <ThemedView style={styles.assetsContainer}>
//           <ThemedText style={styles.assetsTitle}>Assets</ThemedText>
//           <View style={styles.assetsList}>
//             {assets.map((asset, index) => (
//               <AssetTile key={index} asset={asset} />
//             ))}
//           </View>
//         </ThemedView>
//       </ThemedView>
//     </View>
//   );
// }




// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//     minHeight: 60,
//   },
//   connectSection: {
//     flex: 1,
//     marginRight: 16,
//   },
//   headerIcons: {
//     flexDirection: 'row',
//     gap: 12,
//     alignSelf: 'center',
//   },
//   profileSection: {
//     alignItems: 'center',
//     marginVertical: 24,
//   },
//   avatarContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#E8E8E8',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   balanceGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 24,
//   },
//   balanceContainer: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   balanceLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   balanceAmount: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   actionButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 32,
//   },
//   actionButton: {
//     alignItems: 'center',
//   },
//   actionIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   actionLabel: {
//     fontSize: 12,
//   },
//   assetsContainer: {
//     flex: 1,
//   },
//   assetsTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 16,
//   },
//   assetsList: {
//     gap: 12,
//   },
//   assetTile: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: '#f5f5f5',
//   },
//   assetLeftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   assetImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   assetInfo: {
//     marginLeft: 12,
//   },
//   assetName: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   assetValue: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 4,
//   },
//   assetBalance: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });