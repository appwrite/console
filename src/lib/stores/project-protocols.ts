import { writable } from 'svelte/store';
import { ProjectProtocolId as ProjectProtocolId, type Models } from '@appwrite.io/console';

export type Protocol = {
    label: string;
    method: ProjectProtocolId;
    value: boolean | null;
};

function projectProtocolRows(project: Models.Project | null): Protocol[] {
    const protocols = new Map(
        project?.protocols?.map((protocol) => [protocol.$id, protocol.enabled])
    );

    return [
        {
            label: 'REST',
            method: ProjectProtocolId.Rest,
            value: protocols.get(ProjectProtocolId.Rest) ?? null
        },
        {
            label: 'GraphQL',
            method: ProjectProtocolId.Graphql,
            value: protocols.get(ProjectProtocolId.Graphql) ?? null
        },
        {
            label: 'WebSocket',
            method: ProjectProtocolId.Websocket,
            value: protocols.get(ProjectProtocolId.Websocket) ?? null
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
