<script lang="ts">
    import Confirm from '$lib/components/confirm.svelte';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let selectedVar: Models.Variable;
    export let onDelete: (variable: Models.Variable) => Promise<void>;

    let error: string;

    async function handleDelete() {
        try {
            await onDelete(selectedVar);
            show = false;
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Confirm title="Delete variable" bind:open={show} bind:error onSubmit={handleDelete}>
    <p>Are you sure you want to delete this variable? This action is irreversible.</p>
</Confirm>
