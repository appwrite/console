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
    defaultProjectName: 'Appwrite project',
    hasChat: false,
    hasGithubLogin: true,
    githubLoginProvider: OAuthProvider.Github,
    hasGoogleLogin: false,
    hasAccountLogin: true
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
    defaultProjectName: 'Appwrite project',
    hasChat: false,
    hasGithubLogin: false,
    hasGoogleLogin: false,
    hasAccountLogin: true
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
    defaultProjectName: 'Imagine project',
    hasChat: true,
    hasGithubLogin: true,
    githubLoginProvider: 'github2',
    hasGoogleLogin: true,
    hasAccountLogin: false
};
