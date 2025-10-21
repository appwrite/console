import type { ComponentType } from 'svelte';
import { PlatformType } from '@appwrite.io/console';

export type PlatformProps = {
    key?: string;
    platform?: PlatformType;
    isConnectPlatform: boolean;
};

export type FrameworkType = {
    key: string;
    label: string;
    icon: ComponentType;
    smallIcon: ComponentType;
    portNumber: number;
    runCommand: string;
    updateConfigCode: string;
};

export type LLMPromptConfig = {
    title: string;
    cloneCommand: string;
    configFile: string;
    configCode: string;
    configLanguage: string;
    runInstructions: string;
    using: string;
};

export function getCorrectTitle(isConnectPlatform: boolean, platform: string) {
    return isConnectPlatform ? `Connect your ${platform} app` : `Add ${platform} platform`;
}

export function generatePromptFromConfig(config: LLMPromptConfig): string {
    return `1. If you're starting a new project, you can clone our starter kit from GitHub using ${config.using || 'the terminal'}.

\`\`\`bash
${config.cloneCommand}
\`\`\`

2. Open the file \`${config.configFile}\` and update the configuration settings.

\`\`\`${config.configLanguage}
${config.configCode}
\`\`\`

3. ${config.runInstructions}`;
}

type PlatformConfig = {
    name: string;
    title: string;
    repoName: string;
    configFile: string;
    configLanguage: string;
    runInstructions: string;
    using: string;
};

const platformConfigs: Record<string, PlatformConfig> = {
    android: {
        name: 'Kotlin',
        title: 'Copy prompt: starter kit for Appwrite in Kotlin',
        repoName: 'starter-for-android',
        configFile: 'constants/AppwriteConfig.kt',
        configLanguage: 'kotlin',
        runInstructions:
            'Run the app on a connected device or emulator, then click the `Send a ping` button to verify the setup.',
        using: 'the terminal, VSCode or Android Studio'
    },
    apple: {
        name: 'Apple platforms',
        title: 'Copy prompt: starter kit for Appwrite for Apple platforms',
        repoName: 'starter-for-ios',
        configFile: 'Sources/Config.plist',
        configLanguage: 'plaintext',
        runInstructions:
            'Run the app on a connected device or simulator, then click the `Send a ping` button to verify the setup.',
        using: 'the terminal or XCode'
    },
    flutter: {
        name: 'Flutter',
        title: 'Copy prompt: starter kit for Appwrite in Flutter',
        repoName: 'starter-for-flutter',
        configFile: 'lib/config/environment.dart',
        configLanguage: 'dart',
        runInstructions:
            'Run the app on a connected device or simulator using `flutter run -d [device_name]`, then click the `Send a ping` button to verify the setup.',
        using: 'the terminal'
    },
    reactnative: {
        name: 'React Native',
        title: 'Copy prompt: starter kit for Appwrite in React Native',
        repoName: 'starter-for-react-native',
        configFile: '.env.example',
        configLanguage: 'dotenv',
        runInstructions:
            'Add your Appwrite credentials to `.env.example` then rename it to `.env` if needed. Run the app on a connected device or simulator using `npm install` followed by `npm run ios` or `npm run android`, then click the `Send a ping` button to verify the setup.',
        using: 'the terminal or VSCode'
    }
};

export function buildPlatformConfig(platformKey: string, configCode: string): LLMPromptConfig {
    const config = platformConfigs[platformKey];
    if (!config) {
        throw new Error(`Unknown platform: ${platformKey}`);
    }

    return {
        title: config.title,
        cloneCommand: `git clone https://github.com/appwrite/${config.repoName}\ncd ${config.repoName}`,
        configFile: config.configFile,
        configCode: configCode,
        configLanguage: config.configLanguage,
        runInstructions: config.runInstructions,
        using: config.using
    };
}
