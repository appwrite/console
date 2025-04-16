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
    hasChat: false
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
    hasChat: false
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
    hasChat: true
};
