import { writable } from 'svelte/store';
import { ProtocolId, type Models } from '@appwrite.io/console';

export type Protocol = {
    label: string;
    method: ProtocolId;
    value: boolean | null;
};

function projectProtocolRows(project: Models.Project | null): Protocol[] {
    return [
        {
            label: 'REST',
            method: ProtocolId.Rest,
            value: project?.protocolStatusForRest ?? null
        },
        {
            label: 'GraphQL',
            method: ProtocolId.Graphql,
            value: project?.protocolStatusForGraphql ?? null
        },
        {
            label: 'WebSocket',
            method: ProtocolId.Websocket,
            value: project?.protocolStatusForWebsocket ?? null
        }
    ];
}

function createProtocols() {
    const { subscribe, set } = writable({
        list: projectProtocolRows(null)
    });

    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            set({ list: projectProtocolRows(project) });
        }
    };
}

export const protocols = createProtocols();
