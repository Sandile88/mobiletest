import { Image, StyleSheet, View, useColorScheme } from "react-native";

import { ParallaxScrollView } from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  useActiveAccount,
  useConnect,
  useDisconnect,
  useActiveWallet,
  ConnectButton,
  lightTheme,
  ConnectEmbed,
} from "thirdweb/react";
import {
  getUserEmail,
  hasStoredPasskey,
  inAppWallet,
} from "thirdweb/wallets/in-app";
import { chain, client } from "@/constants/thirdweb";
import { shortenAddress } from "thirdweb/utils";
import { ThemedButton } from "@/components/ThemedButton";
import { useEffect, useState } from "react";
import { createWallet } from "thirdweb/wallets";
import { baseSepolia, ethereum } from "thirdweb/chains";
import { createAuth } from "thirdweb/auth";
import React from "react";
import { 
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5 
} from '@expo/vector-icons';


const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "facebook",
        "discord",
        "telegram",
        "email",
        "phone",
        "passkey",
      ],
      passkeyDomain: "thirdweb.com",
    },
    smartAccount: {
      chain: baseSepolia,
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet", {
    appMetadata: {
      name: "Thirdweb RN Demo",
    },
    mobileConfig: {
      callbackURL: "https://thirdweb.com",
    },
    walletConfig: {
      options: "smartWalletOnly",
    },
  }),
  createWallet("me.rainbow"),
  createWallet("com.trustwallet.app"),
  createWallet("io.zerion.wallet"),
];


const thirdwebAuth = createAuth({
  domain: "localhost:3000",
  client,
});


export default function HomeScreen() {
  const theme = useColorScheme();
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const [email, setEmail] = useState<string>();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (wallet && wallet.id === "inApp") {
      getUserEmail({ client }).then(setEmail);
    }
  }, [wallet]);

  return (
    <View style={styles.mainContainer}>
    <View style={styles.header}>
      <View style={styles.connectSection}>
        <ConnectButton
          client={client}
          theme={theme || "dark"}
          wallets={wallets}
          chain={baseSepolia}
        />
        {/* <View style={styles.walletInfo}>
          <CustomConnectUI />
        </View> */}
      </View>
        {/* yet to change icons used */}
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          <MaterialCommunityIcons name="upload-outline" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          <MaterialCommunityIcons name="history" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
        </View>
      </View>

      <ThemedView style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <ThemedText style={styles.avatarText}>JD</ThemedText>
          </View>
        </View>

        <View style={styles.balanceGrid}>
          <BalanceDisplay label="Balance" amount="0.00" />
          <BalanceDisplay label="Proof Balance" amount="0.00" />
          <BalanceDisplay label="Total Balance" amount="0.00" />
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



interface Asset {
  imageUrl: string;
  balance: number;
  name: string;
  value: number;
}

const assets: Asset[] = [
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


const BalanceDisplay = ({ label, amount }: { label: string; amount: string }) => (
  <View style={styles.balanceContainer}>
    <ThemedText style={styles.balanceLabel}>{label}</ThemedText>
    <ThemedText style={styles.balanceAmount}>{amount}</ThemedText>
  </View>
);



const AssetTile: React.FC<{ asset: Asset }> = ({ asset }) => (
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
);



// const CustomConnectUI = () => {
//   const wallet = useActiveWallet();
//   const account = useActiveAccount();
//   const [email, setEmail] = useState<string | undefined>();
//   const { disconnect } = useDisconnect();
//   useEffect(() => {
//     if (wallet && wallet.id === "inApp") {
//       getUserEmail({ client }).then(setEmail);
//     }
//   }, [wallet]);

//   return wallet && account ? (
//     <View>
//       <ThemedText>Connected as {shortenAddress(account.address)}</ThemedText>
//       {email && <ThemedText type="subtext">{email}</ThemedText>}
//       <View style={{ height: 16 }} />
//       <ThemedButton onPress={() => disconnect(wallet)} title="Disconnect" />
//     </View>
//   ) : (
//     <>
//       {/* <ConnectWithGoogle />
//       <ConnectWithMetaMask />
//       <ConnectWithPasskey /> */}
//     </>
//   );
// };

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
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 60,
  },
  connectSection: {
    flex: 1,
    marginRight: 16,
  },
  // walletInfo: {
  //   position: 'absolute',
  //   top: '100%',
  //   left: 0,
  //   right: 0,
  //   backgroundColor: '#fff',
  //   zIndex: 1,
  //   paddingTop: 8,
  // },
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
