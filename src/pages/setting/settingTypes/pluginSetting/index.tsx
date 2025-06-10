import React from "react";
import { Animated } from 'react-native';

import { createStackNavigator } from "@react-navigation/stack";
import PluginList from "./views/pluginList";
import PluginSort from "./views/pluginSort";
import PluginSubscribe from "./views/pluginSubscribe";

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

const routes = [
  {
    path: '/pluginsetting/list',
    component: PluginList,
  },
  {
    path: '/pluginsetting/sort',
    component: PluginSort,
  },
  {
    path: '/pluginsetting/subscribe',
    component: PluginSubscribe,
  },
];

export default function PluginSetting() {
  return (
    <Stack.Navigator
      initialRouteName={routes[0].path}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 100,
      }}>
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
  );
}
