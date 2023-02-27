import { useEffect, useMemo, useState } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { StatusBar } from 'expo-status-bar';
import * as PushAPI from '@pushprotocol/restapi';
import { Button, StyleSheet, Text, View } from 'react-native';
import {
  LensConfig,
  LensProvider,
  useActiveProfile,
  useWalletLogin,
  useWalletLogout,
  staging,
  IBindings,
} from '@lens-protocol/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MetaMaskSDK from '@metamask/sdk';
import { Linking } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { providers } from 'ethers';

const metamask = new MetaMaskSDK({
  openDeeplink: link => {
    Linking.openURL(link); // Use React Native Linking method or your favourite way of opening deeplinks
  },
  timer: BackgroundTimer, // To keep the app alive once it goes to background
  dappMetadata: {
    name: 'My App', // The name of your application
    url: 'https://myapp.com', // The url of your website
  },
});

const ethereum = metamask.getProvider();

const web3Provider = new providers.Web3Provider(ethereum);

const bindings = (): IBindings => {
  return {
    getSigner: async () => web3Provider.getSigner(),
    getProvider: async () => web3Provider,
  };
};

const LoginButton = () => {
  const { login, isPending: loginPending } = useWalletLogin();
  const { logout, isPending: logoutPending } = useWalletLogout();
  const { data: profile } = useActiveProfile();

  const [xmtp, setXMTP] = useState<Client | null>(null);
  const [channel, setChannel] = useState<any>(null);

  const [isConnected, setIsConnected] = useState(false);

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
    await ethereum.request({ method: 'eth_requestAccounts' });
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }],
    });
    setIsConnected(ethereum.isConnected());

    const xmtpClient = await Client.create(web3Provider.getSigner());
    setXMTP(xmtpClient);

    await login(web3Provider.getSigner());
  };

  const onLogoutPress = async () => {
    await logout();

    setXMTP(null);
    setIsConnected(false);
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
      {isConnected && (
        <View>
          <Text>XMTP Version: {xmtp?.apiClient.version}</Text>
          <Text>
            Push Channel: {channel?.name}(#{channel?.id})
          </Text>
          <Text>Lens Profile: @{profile?.handle}</Text>
          <Button onPress={onSendMessage} title="Send message" />
          <Button
            disabled={logoutPending}
            onPress={onLogoutPress}
            title="Log out"
          />
        </View>
      )}
      {!isConnected && (
        <Button disabled={loginPending} onPress={onLoginPress} title="Log in" />
      )}
    </View>
  );
};

const App = () => {
  const lensConfig = useMemo((): LensConfig => {
    return {
      bindings: bindings(),
      environment: staging,
      storage: AsyncStorage,
    };
  }, []);

  return (
    <LensProvider config={lensConfig}>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <LoginButton />
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

export default App;
