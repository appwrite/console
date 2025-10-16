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

export function getCorrectTitle(isConnectPlatform: boolean, platform: string) {
    return isConnectPlatform ? `Connect your ${platform} app` : `Add ${platform} platform`;
}
