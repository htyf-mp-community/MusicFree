import React, { forwardRef } from 'react';
import Pages from './entry';
import { Alert, AppRegistry } from 'react-native'
import SplashScreen from 'react-native-splash-screen';
import { useEffect } from 'react';


const MiniApp = forwardRef(({ dataSupper }: any) => {
  useEffect(() => {
    SplashScreen.hide();
    return () => {

    }
  }, [])
  return (
    <Pages />
  );
});

export default MiniApp;