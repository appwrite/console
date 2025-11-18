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
    alreadyExistsInstructions: string;
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
    return `
Goal: Setting up Appwrite SDK in the project depending on if a project already exists or not.

Following are the project details:

\`\`\`
${config.configCode}
\`\`\`

Follow the steps depending on if a project already exists on user's working directory or not:

## If a project already exists:
${config.alreadyExistsInstructions}

## If a project does not exist:

1. Clone the starter kit using ${config.using || 'the terminal'}. Make sure to clone in the current working directory so that the cloned files are directly available in the working directory.

\`\`\`bash
${config.cloneCommand} .
\`\`\`

2. Replace all occurrences of the environment variables described in the project details section with their corresponding values. This effectively hardcodes the project details wherever those environment variables are used. Use grep (or an equivalent search) to find and update all occurrences.
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
            'Run the app on a connected device or simulator using `flutter run -d [device_name]`, then click the `Send a ping` button to verify the setup. Ask the user if the AI agent should run the command to run the app for them. Provide the full command while you ask for permission.',
        using: 'the terminal'
    },
    reactnative: {
        name: 'React Native',
        title: 'Copy prompt: starter kit for Appwrite in React Native',
        repoName: 'starter-for-react-native',
        configFile: 'index.ts',
        configLanguage: 'typescript',
        runInstructions:
            'After replacing and hardcoding project details, run the app on a connected device or simulator using `npm install` followed by `npm run ios` or `npm run android`, then click the `Send a ping` button to verify the setup. Ask the user if the AI agent should run the command to run the app for them. Provide the full command while you ask for permission.',
        using: 'the terminal or VSCode'
    }
};

export function buildPlatformConfig(
    platformKey: string,
    configCode: string,
    alreadyExistsInstructions: string
): LLMPromptConfig {
    const config = platformConfigs[platformKey];
    if (!config) {
        throw new Error(`Unknown platform: ${platformKey}`);
    }

    return {
        title: config.title,
        alreadyExistsInstructions: alreadyExistsInstructions,
        cloneCommand: `git clone https://github.com/appwrite/${config.repoName}\ncd ${config.repoName}`,
        configFile: config.configFile,
        configCode: configCode,
        configLanguage: config.configLanguage,
        runInstructions: config.runInstructions,
        using: config.using
    };
}
