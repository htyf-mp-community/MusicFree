/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Pages from './src';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import SplashScreen from 'react-native-splash-screen';
import { useEffect } from 'react';

const Root = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, [])
  return <Pages />
}
TrackPlayer.registerPlaybackService(() => require('./src/service/index'));
AppRegistry.registerComponent(appName, () => Root)

