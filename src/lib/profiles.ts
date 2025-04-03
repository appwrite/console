type Profile = {
    hasChatLayout: boolean;
    hasAuth: boolean;
    hasDatabases: boolean;
    hasFunctions: boolean;
    hasMessages: boolean;
    hasStorage: boolean;
    hasSites: boolean;
};

export const ConsoleCloudProfile: Profile = {
    hasChatLayout: false,
    hasAuth: true,
    hasDatabases: true,
    hasFunctions: true,
    hasMessages: true,
    hasStorage: true,
    hasSites: true
};

export const ConsoleSelfhostedProfile: Profile = {
    hasChatLayout: false,
    hasAuth: true,
    hasDatabases: true,
    hasFunctions: true,
    hasMessages: true,
    hasStorage: true,
    hasSites: true
};

export const StudioProfile: Profile = {
    hasChatLayout: true,
    hasAuth: true,
    hasDatabases: true,
    hasFunctions: false,
    hasMessages: true,
    hasStorage: true,
    hasSites: true
};
