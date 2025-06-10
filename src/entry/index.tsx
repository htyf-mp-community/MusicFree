import React from "react";
import { Animated } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import bootstrap from "./bootstrap";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Dialogs from "@/components/dialogs";
import Panels from "@/components/panels";
import PageBackground from "@/components/base/pageBackground";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Debug from "@/components/debug";
import { PortalHost } from "@/components/base/portal";
import globalStyle from "@/constants/globalStyle";
import Theme from "@/core/theme";
import { BootstrapComp } from "./useBootstrap";
import { ToastBaseComponent } from "@/components/base/toast";
import { Platform, StatusBar } from "react-native";
import { ReducedMotionConfig, ReduceMotion } from "react-native-reanimated";
import { routes, navigationRef } from "@/core/router/routes.tsx";
/**
 * 字体颜色
 */

/**
 * 字体颜色
 */

if (Platform.OS === 'android') {
  StatusBar.setBackgroundColor('transparent');
  StatusBar.setTranslucent(true);
}

bootstrap();
const Stack = createStackNavigator<any>();

const customCardStyleInterpolator = ({
  current,
  next,
  inverted,
  layouts: { screen },
}: StackCardInterpolationProps): StackCardInterpolatedStyle => {
  const translateFocused = Animated.multiply(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [screen.width, 0],
      extrapolate: 'clamp',
    }),
    inverted
  );

  const translateUnfocused = next
    ? Animated.multiply(
      next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, screen.width * -1],
        extrapolate: 'clamp',
      }),
      inverted
    )
    : 0;

  const overlayOpacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.07],
    extrapolate: 'clamp',
  });

  const shadowOpacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
    extrapolate: 'clamp',
  });

  return {
    cardStyle: {
      transform: [
        // Translation for the animation of the current card
        { translateX: translateFocused },
        // Translation for the animation of the card on top of this
        { translateX: translateUnfocused },
      ],
    },
    overlayStyle: { opacity: overlayOpacity },
    shadowStyle: { shadowOpacity },
  };
}


export default function Pages() {
  const theme = Theme.useTheme();
  const background = Theme.useBackground();
  return (
    <>
      <BootstrapComp />
      <ReducedMotionConfig mode={ReduceMotion.Never} />
      <GestureHandlerRootView style={globalStyle.flex1}>
        <SafeAreaProvider>
          <NavigationContainer theme={theme} independent ref={navigationRef}>
            <PageBackground />
            <Stack.Navigator
              initialRouteName={routes[0].path}
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 100,
                contentStyle: background?.url ? {} : {
                  backgroundColor: theme.colors.pageBackground
                },
              }}
            >
              {routes.map(route => (
                <Stack.Screen
                  key={route.path}
                  name={route.path}
                  component={route.component}
                  options={{
                    cardStyleInterpolator: customCardStyleInterpolator,
                  }}
                />
              ))}
            </Stack.Navigator>

            <Panels />
            <Dialogs />
            <Debug />
            <PortalHost />
            <ToastBaseComponent />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </>
  );
}
