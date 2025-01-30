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
  const account = useActiveAccount();
  const theme = useColorScheme();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/title.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <ThemedText style={styles.avatarText}>JD</ThemedText>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <ConnectButton
            client={client}
            theme={theme || "dark"}
            wallets={wallets}
            chain={baseSepolia}
          />
          <CustomConnectUI />
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
    </ParallaxScrollView>
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

const AssetTile: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
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
};




const CustomConnectUI = () => {
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const [email, setEmail] = useState<string | undefined>();
  const { disconnect } = useDisconnect();
  useEffect(() => {
    if (wallet && wallet.id === "inApp") {
      getUserEmail({ client }).then(setEmail);
    }
  }, [wallet]);

  return wallet && account ? (
    <View>
      <ThemedText>Connected as {shortenAddress(account.address)}</ThemedText>
      {email && <ThemedText type="subtext">{email}</ThemedText>}
      <View style={{ height: 16 }} />
      <ThemedButton onPress={() => disconnect(wallet)} title="Disconnect" />
    </View>
  ) : (
    <>
      {/* <ConnectWithGoogle />
      <ConnectWithMetaMask />
      <ConnectWithPasskey /> */}
    </>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerImage: {
    height: "100%",
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#A1CEDC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  balanceSection: {
    marginBottom: 32,
  },
  connectContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  accountInfo: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  disconnectButton: {
    marginTop: 8,
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