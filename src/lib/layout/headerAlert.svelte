<script lang="ts">
    import { Alert } from '@appwrite.io/pink-svelte';

    export let title: string;
    export let dismissible: boolean = undefined;
    export let hideActions: boolean = undefined;
    export let type: 'info' | 'success' | 'warning' | 'error' = 'info';
</script>

<Alert.Banner {title} {dismissible} {hideActions} status={type}>
    <slot />
    <slot name="buttons" slot="actions" />
</Alert.Banner>
