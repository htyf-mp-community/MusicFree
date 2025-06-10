import React, { useEffect } from 'react';
import { Alert, StyleSheet } from 'react-native';

import NavBar from './components/navBar';
import MusicBar from '@/components/musicBar';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeDrawer from './components/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBar from '@/components/base/statusBar';
import HorizontalSafeAreaView from '@/components/base/horizontalSafeAreaView.tsx';
import globalStyle from '@/constants/globalStyle';
import Theme from '@/core/theme';
import HomeBody from './components/homeBody';
import HomeBodyHorizontal from './components/homeBodyHorizontal';
import useOrientation from '@/hooks/useOrientation';
import { installPluginFromUrl } from '../setting/settingTypes/pluginSetting/views/pluginList';
import Toast from '@/utils/toast';
import PluginManager, { IInstallPluginResult } from '@/core/pluginManager';
import { useDebounceEffect } from 'ahooks'
import jssdk from '@htyf-mp/js-sdk'
import { showDialog } from '@/components/dialogs/useDialog';

function Home() {
    const plugins = PluginManager.useSortedPlugins();
    const orientation = useOrientation();
    useDebounceEffect(() => {
        const init = async () => {
            try {
                const text = `https://musicfreepluginshub.2020818.xyz/plugins.json`
                const result = await installPluginFromUrl(text.trim());
                // 检查是否全部安装成功
                const successResults: IInstallPluginResult[] = [];
                const failResults: IInstallPluginResult[] = [];
                for (let i = 0; i < result.length; ++i) {
                    if (result[i].success) {
                        successResults.push(result[i]);
                    } else {
                        failResults.push(result[i]);
                    }
                }

                if (!failResults.length) {
                    Toast.success('插件安装成功');
                } else {
                    Toast.warn((successResults.length ? "部分" : "全部") + "插件安装失败", {
                        'type': 'warn',
                        'actionText': "查看",
                        'onActionClick': () => {
                            showDialog('SimpleDialog', {
                                title: "插件安装失败",
                                content: "以下插件安装失败: \n" + failResults.map(it => (it.pluginUrl ?? "") + "\n失败原因：" + it.message).join('\n-----\n'),
                            })
                        }
                    });
                }
            } catch (error) {
                jssdk.showToast({
                    type: 'error',
                    title: '插件安装失败',
                });
                console.error(error);
            }
        }
        if (plugins.length <= 0) {
            jssdk.showModal({
                title: '是否添加插件',
                description: '尝试添加默认插件',
                onConfirm: () => {
                    init();
                },
            });
            // 是否添加插件
            // Alert.alert('是否添加插件', '尝试添加默认插件', [
            //     {
            //         text: '取消',
            //         onPress: () => { },
            //     },
            //     {
            //         text: '添加',
            //         onPress: () => {
            //             init();
            //         },
            //     },
            // ]);
        }
    }, [plugins], {
        wait: 1000,
    });
    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.appWrapper}>
            <HomeStatusBar />
            <HorizontalSafeAreaView style={globalStyle.flex1}>
                <>
                    <NavBar />
                    {orientation === 'vertical' ? (
                        <HomeBody />
                    ) : (
                        <HomeBodyHorizontal />
                    )}
                </>
            </HorizontalSafeAreaView>
            <MusicBar />
        </SafeAreaView>
    );
}

function HomeStatusBar() {
    const theme = Theme.useTheme();

    return (
        <StatusBar
            backgroundColor="transparent"
            barStyle={theme.dark ? undefined : 'dark-content'}
        />
    );
}

// function Body() {
//     const orientation = useOrientation();
//     return (
//         <ScrollView
//             style={[
//                 styles.appWrapper,
//                 orientation === 'horizontal' ? styles.flexRow : null,
//             ]}>
//             <Operations orientation={orientation} />
//         </ScrollView>
//     );
// }

const LeftDrawer = createDrawerNavigator();
export default function App() {
    return (
        <LeftDrawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: '80%',
                },
            }}
            initialRouteName="HOME-MAIN"
            drawerContent={props => <HomeDrawer {...props} />}>
            <LeftDrawer.Screen name="HOME-MAIN" component={Home} />
        </LeftDrawer.Navigator>
    );
}

const styles = StyleSheet.create({
    appWrapper: {
        flexDirection: 'column',
        flex: 1,
    },
    flexRow: {
        flexDirection: 'row',
    },
});
