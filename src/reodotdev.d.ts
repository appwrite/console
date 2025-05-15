declare module 'reodotdev' {
    export type Reo = {
        identify(config: ReoUserIdentifyConfig): void;
        init(config: { clientID: string; version?: string; scriptUrlPattern?: string }): void;
    };

    export type ReoUserIdentifyConfig = {
        type: string;
        username: string;
        firstname: string;
        lastname?: string;
    };

    export type LoadReoScriptConfig = {
        clientID: string;
        version?: string;
        scriptUrlPattern?: string | string[];
    };

    export function loadReoScript(config: LoadReoScriptConfig): Promise<Reo>;
}
