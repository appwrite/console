import { OAuthProvider } from '@appwrite.io/console';

type Profile = {
    hasChatLayout: boolean;
    hasAuth: boolean;
    hasDatabases: boolean;
    hasFunctions: boolean;
    hasMessages: boolean;
    hasStorage: boolean;
    hasSites: boolean;
    hasProjectProgressBars: boolean;
    hasFullPageSignup: boolean;
    defaultProjectName: string;
    hasChat: boolean;
    hasGithubLogin: boolean;
    githubLoginProvider?: string;
    hasGoogleLogin: boolean;
    hasAccountLogin: boolean;
    description: string;
};

export const ConsoleCloudProfile: Profile = {
    hasChatLayout: false,
    hasAuth: true,
    hasDatabases: true,
    hasFunctions: true,
    hasMessages: true,
    hasStorage: true,
    hasSites: true,
    hasProjectProgressBars: true,
    hasFullPageSignup: false,
    defaultProjectName: 'New project',
    hasChat: false,
    hasGithubLogin: true,
    githubLoginProvider: OAuthProvider.Github,
    hasGoogleLogin: false,
    hasAccountLogin: true,
    description: "Appwrite is an open-source platform for building applications at any scale, using your preferred programming languages and tools."
};

export const ConsoleSelfhostedProfile: Profile = {
    hasChatLayout: false,
    hasAuth: true,
    hasDatabases: true,
    hasFunctions: true,
    hasMessages: true,
    hasStorage: true,
    hasSites: true,
    hasProjectProgressBars: true,
    hasFullPageSignup: false,
    defaultProjectName: 'New project',
    hasChat: false,
    hasGithubLogin: false,
    hasGoogleLogin: false,
    hasAccountLogin: true,
    description: "Appwrite is an open-source platform for building applications at any scale, using your preferred programming languages and tools."
};

export const StudioProfile: Profile = {
    hasChatLayout: true,
    hasAuth: true,
    hasDatabases: true,
    hasFunctions: false,
    hasMessages: true,
    hasStorage: true,
    hasSites: true,
    hasProjectProgressBars: false,
    hasFullPageSignup: true,
    defaultProjectName: 'New project',
    hasChat: true,
    hasGithubLogin: true,
    githubLoginProvider: 'github2',
    hasGoogleLogin: true,
    hasAccountLogin: true,
    description: "Imagine the fastest way to go from your imagination to scale. Batteries included."
};
