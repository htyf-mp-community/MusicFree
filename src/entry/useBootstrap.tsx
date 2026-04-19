import Config from "@/core/config.ts";
import Theme from "@/core/theme";
import useCheckUpdate from "@/hooks/useCheckUpdate.ts";
import { useListenOrientationChange } from "@/hooks/useOrientation";
import { usePlaybackProgressIntervalForAppState } from "@/hooks/usePlaybackProgressIntervalForAppState";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

export function BootstrapComp() {
    useListenOrientationChange();
    useCheckUpdate();
    usePlaybackProgressIntervalForAppState();

    const followSystem = Config.useConfigValue('theme.followSystem');

    const colorScheme = useColorScheme();

    useEffect(() => {
        if (followSystem) {
            console.log('trg')
            if (colorScheme === 'dark') {
                Theme.setTheme('p-dark');
            } else if (colorScheme === 'light') {
                Theme.setTheme('p-light');
            }
        }
    }, [colorScheme, followSystem]);

    return null;
}
