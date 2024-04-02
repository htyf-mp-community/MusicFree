/**
 * @format
 */

import {AppRegistry} from 'react-native';
import Pages from './src';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import { MiniAppsEnginesProvider } from '@htyf-mp/engines'

const Root = () => {
  return <MiniAppsEnginesProvider>
    <Pages />
  </MiniAppsEnginesProvider>
}
TrackPlayer.registerPlaybackService(() => require('./src/service/index'));
AppRegistry.registerComponent(appName, () => Root)

