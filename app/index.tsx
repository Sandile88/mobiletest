import { Image, Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  useActiveAccount,
  useDisconnect,
  useActiveWallet,
  ConnectButton,
} from "thirdweb/react";
import { getUserEmail, inAppWallet } from "thirdweb/wallets/in-app";
import { client } from "@/constants/thirdweb";
import { useEffect, useState } from "react";
import { sepolia } from "thirdweb/chains";
import React from "react";
import { 
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5 
} from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { getProofBalance } from "@/services/proofService";
import { thirdwebClient } from "@/config/client";
import { networkConfig } from "@/config/networkConfig";
import { defineChain, getContract, readContract, toEther } from "thirdweb";
import { ethers } from 'ethers';
import $u from '@/utils/$u';
import { useConnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { connectCoinbaseWalletSDK } from "thirdweb/dist/types/wallets/coinbase/coinbase-web";
// import wc from '@/circuit/witness_calculator';
// import RNFS from 'react-native-fs';
// import { Asset } from "expo-asset";
// import * as WebAssembly from "react-native-webassembly";



interface BalanceDisplayProps {
  label: string;
  amount?: number;
}
  
interface AssetToken {
  imageUrl: string;
  balance: number;
  name: string;
  value: number;
}

const assets: AssetToken[] = [
  {
    balance: 0,
    imageUrl: require("@/assets/images/uzar.png"),
    name: "uZAR",
    value: 1.00,
  },
  {
    balance: 0,
    value: 0.99,
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
    name: "USDT",
  },
];




export default function HomeScreen() {
  const theme = useColorScheme();
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const [email, setEmail] = useState<string>();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [proofBalance, setProofBalance] = useState<number>(0);
  const { chainId, uZarContractAddress } = networkConfig;
  const [selectedTab, setSelectedTab] = useState("buy");

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  const uzarContract = getContract({
    client: thirdwebClient,
    chain: sepolia,
    address: uZarContractAddress,
  
  });

  const userBalance = async () => {
    if (!account) {
      throw new Error("Account is undefined");
    }
    const balance = await readContract({
      contract: uzarContract,
      method: "function balanceOf(address) returns (uint256)",
      params: [account.address],
    });
    return Number(toEther(balance));
  }

   // Centralized balance fetching function
   const fetchAllBalances = async () => {
    try {
      // Fetch on-chain balance
      if (account) {
        const onChainBalance = await userBalance();
        console.log("Fetch all balances onChain Balance", onChainBalance);
        setBalance(onChainBalance);
      }
      
      // Fetch proof balance
      const newProofBalance = await getProofBalance();
      setProofBalance(newProofBalance);
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  };


   useEffect(() => {
    // Load balances immediately when component mounts or account changes
    fetchAllBalances();
    
    const intervalId = setInterval(fetchAllBalances, 10000);
    
    return () => clearInterval(intervalId);
  }, [account]); // Re-run when account changes

  useEffect(() => {
    if (wallet && wallet.id === "inApp") {
      getUserEmail({ client }).then(setEmail);
    }
  }, [wallet]);


  // async function loadWasm() {
  //   try {
  //     const path = `${RNFS.MainBundlePath}/deposit.wasm`; // Ensure `deposit.wasm` is inside assets
  //     const wasmBase64 = await RNFS.readFile(path, 'base64');
  
  //     // Convert base64 to ArrayBuffer
  //     const binaryString = atob(wasmBase64);
  //     const len = binaryString.length;
  //     const wasmArrayBuffer = new Uint8Array(len);
  //     for (let i = 0; i < len; i++) {
  //       wasmArrayBuffer[i] = binaryString.charCodeAt(i);
  //     }
  
  //     // return new Promise((resolve, reject)
  //     return new Promise((resolve, reject) => {
  //       WebAssembly.instantiate(wasmArrayBuffer.buffer)
  //         .then((wasmModule) => {
  //           resolve(wc(wasmModule.instance.exports));
  //         })
  //         .catch((err) => {
  //           console.error("Error loading WASM:", err);
  //           reject(err);
  //         });
  //     });
  //   } catch (error) {
  //     console.error("Failed to load WASM file:", error);
  //     throw error;
  //   }
  // }

  // console.log("Loading", loadWasm());
  
  const secretProof = async ()=> {
    const secret = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();
      const nullifier = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();
  
      const input = {
        secret: $u.BN256ToBin(secret).split(""),
        nullifier: $u.BN256ToBin(nullifier).split("")
      };
      console.log("Proof Input:", input);


      // const depositWC = loadWasm();
      // // console

      // const r = await depositWC.calculateWitness(input, 0);
      // const commitment = r[1];
      // const nullifierHash = r[2];

      // console.log("commitment" , commitment);
      // console.log("nullifierHash" , nullifierHash);
  }
  // console.log("Secret Proof", secretProof());


  // const depositEther = async () => {
  //   try {
  //     const secret = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();
  //     const nullifier = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();

  //     const input = {
  //       secret: $u.BN256ToBin(secret).split(""),
  //       nullifier: $u.BN256ToBin(nullifier).split(""),
  //     };
  //     console.log("Proof Input:", input);

  //     const wasmPath = require("../../../assets/deposit.wasm");
  //     const response = await fetch(wasmPath);
  //     const wasmArrayBuffer = await response.arrayBuffer();

  //     const wasmModule = await WebAssembly.instantiate(wasmArrayBuffer);

  //     const depositWC = await wc(wasmModule.instance.exports); 

  //     const r = await depositWC.calculateWitness(input, 0); 
  //     const commitment = r[1];
  //     const nullifierHash = r[2];

  //     console.log("Commitment:", commitment);
  //     console.log("Nullifier:", nullifierHash);
  //   } catch (e) {
  //     console.error("Error in depositEther:", e);
  //   }
  // };

  // console.log("Loading", depositEther());



 
  const calculateTotalBalance = () => {
    const total = balance + proofBalance;
    console.log("total balance", total);
    return total;
  }



  const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ label, amount }) => {
    let displayAmount = 0;
    
    if (label === "Balance") {
      displayAmount = balance;
    } else if (label === "Proof Balance") {
      displayAmount = proofBalance;
    } else if (label === "Total Balance") {
      displayAmount = calculateTotalBalance();
    } else {
      displayAmount = amount || 0;
    }
    
    return (
      <View style={styles.balanceContainer}>
        <ThemedText style={styles.balanceLabel}>{label}</ThemedText>
        <ThemedText style={styles.balanceAmount}>R{displayAmount.toFixed(2)}</ThemedText>
      </View>
    );
  };


const ActionButton = ({ iconName, iconFamily = "Ionicons", label }: {
  iconName: string; 
  iconFamily?: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5";
  label: string;
}) => {
  const IconComponent = {
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome5
  }[iconFamily];

  return (
    <View style={styles.actionButton}>
      <View style={styles.actionIcon}>
        <IconComponent name={iconName} size={24} color="#fff" />
      </View>
      <ThemedText style={styles.actionLabel}>{label}</ThemedText>
    </View>
  );
};


const AssetTile: React.FC<{ asset: AssetToken }> = ({ asset }) => {
  const router = useRouter();

  const handleAssetPress = () => {
    if (asset.name === 'uZAR') {
      router.push("transfer" as any);
    }
  };

  return (
    <Pressable onPress={handleAssetPress}>
      <ThemedView style={styles.assetTile}>
      <View style={styles.assetLeftSection}>
        <Image 
          source={typeof asset.imageUrl === 'string' ? { uri: asset.imageUrl } : asset.imageUrl}
          style={styles.assetImage}
        />
        <View style={styles.assetInfo}>
          <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
          <ThemedText style={styles.assetValue}>
            {asset.name === 'uZAR' ? `R${asset.value.toFixed(2)}` : `$${asset.value.toFixed(2)}`}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.assetBalance}>
        {asset.name === 'uZAR' ? `R${asset.balance.toFixed(2)}` : `$${asset.balance.toFixed(2)}`}
      </ThemedText>
    </ThemedView>
    </Pressable>
  );
};


  return (
    <View style={styles.mainContainer}>
    <View style={styles.header}>
      <View style={styles.connectSection}>
        <View style={styles.connectButtonWrapper}>
        <ConnectButton
            client={client}
            accountAbstraction={{
            chain: sepolia,
            sponsorGas: true,
          }}
          supportedTokens={{
            [sepolia.id]: [
              {
                address: uZarContractAddress,
                name: "Universel Zar",
                symbol: "uZAR",
                icon: "...",
              },
            ],
          }}
          theme={theme || "dark"}
          // wallets={wallets}
          // chain={sepolia}
          detailsButton={{
            displayBalanceToken: {
              [sepolia.id]: uZarContractAddress, // token address to display balance for
            },
          }}
        />
        </View>
        
      </View>
        {/* yet to change icons used */}
        <View style={styles.headerIcons}>
          <MaterialCommunityIcons
            name="upload-outline"  size={24} 
            color={theme === 'dark' ? '#fff' : '#000'}  
            onPress={() => router.push("/addProof")} />
          <MaterialCommunityIcons 
            name="download-outline" size={24} 
            color={theme === 'dark' ? '#fff' : '#000'} 
            onPress={() => router.push("/submitProof")} /> 
          <MaterialCommunityIcons 
            name="history" size={24} 
            color={theme === 'dark' ? '#fff' : '#000'} 
            onPress={() => router.push("/historyProof")} /> 
        </View>
      </View>



      <ThemedView style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <ThemedText style={styles.avatarText}>JD</ThemedText>
          </View>
        </View>

        <View style={styles.balanceGrid}>
          <BalanceDisplay label="Balance"/>
          <BalanceDisplay label="Proof Balance" />
          <BalanceDisplay label="Total Balance" />
        </View>

        <View style={styles.actionButtonsContainer}>
          <ActionButton 
            iconName="paper-plane" 
            iconFamily="FontAwesome5" 
            label="Pay" 
          />
          <ActionButton 
            iconName="wallet" 
            iconFamily="Ionicons" 
            label="Receive" 
          />
          <ActionButton 
            iconName="arrow-down-circle" 
            iconFamily="Ionicons" 
            label="Deposit" 
          />
          <ActionButton 
            iconName="arrow-up-circle" 
            iconFamily="Ionicons" 
            label="Withdraw" 
          />
        </View>

        <ThemedView style={styles.assetsContainer}>
          <ThemedText style={styles.assetsTitle}>Assets</ThemedText>
          <View style={styles.assetsList}>
            {assets.map((asset, index) => (
              <AssetTile key={index} asset={asset} />
            ))}
          </View>
        </ThemedView>
      </ThemedView>
    </View>
  );
}




const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 30,
    backgroundColor: '#fff',
    // paddingTop: 5,
    // paddingBottom: 15,
    minHeight: 60,
  },
  connectSection: {
    flex: 1,
    marginRight: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  balanceContainer: {
    alignItems: 'center',
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  connectButtonWrapper: {
    width: 160,
    height: 50,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
  },
  assetsContainer: {
    flex: 1,
  },
  assetsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  assetsList: {
    gap: 12,
  },
  assetTile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  assetLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  assetInfo: {
    marginLeft: 12,
  },
  assetName: {
    fontSize: 18,
    fontWeight: '600',
  },
  assetValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  assetBalance: {
    fontSize: 18,
    fontWeight: '600',
  },
});