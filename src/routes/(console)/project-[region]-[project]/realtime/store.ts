// Maximum number of tail frames kept in the buffer before the oldest are dropped.
export const MAX_EVENTS = 500;

// A single compact event frame as delivered on the `console.tail.<projectId>` channel.
// No document body is ever sent — only metadata. Scope keys are type-specific.
export type TailFrame = {
    event: string;
    type: string;
    action: string;
    userId?: string;
    timestamp: string;
    resourceId?: string;
    databaseId?: string;
    collectionId?: string;
    bucketId?: string;
    functionId?: string;
    teamId?: string;
};

// The `console.tail.stats` payload, emitted when sampling drops events under load.
export type TailStats = {
    $type: string;
    delivered: number;
    dropped: number;
};

export const typeOptions: { value: string; label: string }[] = [
    { value: '', label: 'All types' },
    { value: 'databases', label: 'Databases' },
    { value: 'buckets', label: 'Storage' },
    { value: 'functions', label: 'Functions' },
    { value: 'teams', label: 'Teams' },
    { value: 'users', label: 'Users' }
];

export const actionOptions: { value: string; label: string }[] = [
    { value: '', label: 'All actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' }
];

// Returns the most relevant scope id for a frame, for display in the Resource column.
export function frameScopeId(frame: TailFrame): string {
    return (
        frame.databaseId ??
        frame.bucketId ??
        frame.functionId ??
        frame.teamId ??
        frame.resourceId ??
        ''
    );
}
