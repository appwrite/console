<script lang="ts">
    import { Badge, Icon } from '@appwrite.io/pink-svelte';
    import { IconCheckCircle, IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';

    export let enabled: boolean;
</script>

<Badge
    variant="secondary"
    type={enabled ? 'success' : 'error'}
    content={enabled ? 'enabled' : 'stopped'}
    on:click>
    <Icon icon={enabled ? IconCheckCircle : IconExclamationCircle} size="s" slot="start" />
</Badge>
