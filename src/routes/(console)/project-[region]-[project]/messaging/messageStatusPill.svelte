<script lang="ts">
    import { Badge } from '@appwrite.io/pink-svelte';
    import type { ComponentProps } from 'svelte';

    export let status: string;

    function getType(status: string): ComponentProps<Badge>['type'] {
        if (status === 'processing') return 'warning';
        if (status === 'sent') return 'success';
        if (status === 'failed') return 'error';
        return undefined;
    }
</script>

<Badge variant="secondary" type={getType(status)} on:click content={status} />
