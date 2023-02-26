import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import { LensConfig, LensProvider, staging } from '@lens-protocol/react';
import {
  useWalletConnect,
  WalletConnectProviderProps,
  withWalletConnect,
} from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { providers } from 'ethers';
import { useCallback, useMemo } from 'react';
import {
  useWalletLogin,
  useWalletLogout,
  useActiveProfile,
} from '@lens-protocol/react';
import { useState, useEffect } from 'react';
import * as PushAPI from '@pushprotocol/restapi';
import { Client } from '@xmtp/xmtp-js';

const LoginButton = ({ provider }: { provider: providers.Web3Provider }) => {
  const connector = useWalletConnect();
  const { login, isPending: loginPending } = useWalletLogin();
  const { logout, isPending: logoutPending } = useWalletLogout();
  const { data: profile } = useActiveProfile();

  const [channel, setChannel] = useState<any>(null);
  const [xmtp, setXMTP] = useState<Client | null>(null);

  useEffect(() => {
    const getChannelData = async () => {
      const channelData = await PushAPI.channels.getChannel({
        channel: 'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681', // channel address in CAIP
        env: 'staging',
      });
      setChannel(channelData);
    };

    getChannelData();
  }, []);

  const onLoginPress = async () => {
    if (connector.connected) {
      connector.killSession();
    }

    await connector.connect();
    // FIXME: signer is not available here
    const signer = provider.getSigner();

    const client = await Client.create(signer);
    setXMTP(client);

    await login(signer);
  };

  const onLogoutPress = async () => {
    await connector.killSession();
    await logout();
  };

  const onSendMessage = async () => {
    if (!xmtp) return;

    const conversation = await xmtp.conversations.newConversation(
      '0x3F11b27F323b62B159D2642964fa27C46C841897',
    );
    await conversation.send('gm');
  };

  return (
    <View>
      {connector.connected && (
        <View>
          <Text>XMTP Version: {xmtp?.apiClient.version}</Text>
          <Text>
            Push Channel: {channel?.name}(#{channel?.id})
          </Text>
          <Text>Lens Profile: @{profile?.handle}</Text>
          <Text>Wallet Address: {connector.accounts[0]}</Text>
          <Button onPress={onSendMessage} title="Send message" />
          <Button
            disabled={logoutPending}
            onPress={onLogoutPress}
            title="Log out"
          />
        </View>
      )}
      {!connector.connected && (
        <Button disabled={loginPending} onPress={onLoginPress} title="Log in" />
      )}
    </View>
  );
};

const App = () => {
  const connector = useWalletConnect();
  const provider = useMemo(
    () =>
      new WalletConnectProvider({
        infuraId: '65d6141f377841e59d706403838ffd26',
        rpc: {
          137: 'https://rpc-mainnet.maticvigil.com',
          80001: 'https://rpc-mumbai.maticvigil.com',
        },
        chainId: 137,
        connector: connector,
        qrcode: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const ethersProvider = useMemo(
    () => new providers.Web3Provider(provider),
    [provider],
  );

  const bindings = useCallback(() => {
    return {
      getProvider: async () => ethersProvider,
      getSigner: async () => ethersProvider.getSigner(),
    };
  }, [ethersProvider]);

  const lensConfig: LensConfig = useMemo(() => {
    return {
      bindings: bindings(),
      environment: staging,
      storage: AsyncStorage,
    };
  }, [bindings]);

  return (
    <LensProvider config={lensConfig}>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <LoginButton provider={ethersProvider} />
        <StatusBar style="auto" />
      </View>
    </LensProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const walletConnectConfig: Partial<WalletConnectProviderProps> = {
  bridge: 'https://bridge.walletconnect.org',
  clientMeta: {
    description: 'Connect with WalletConnect',
    url: 'https://walletconnect.org',
    icons: ['https://walletconnect.org/walletconnect-logo.png'],
    name: 'WalletConnect',
  },
  redirectUrl: Platform.OS === 'web' ? window.location.origin : 'app://',
  storageOptions: {
    // @ts-ignore
    asyncStorage: AsyncStorage,
  },
};

export default withWalletConnect(App, walletConnectConfig);
