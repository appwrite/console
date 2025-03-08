<script lang="ts">
    import { Confirm } from '$lib/components';
    import Button from '$lib/elements/forms/button.svelte';
    import type { Models } from '@appwrite.io/console';
    import { InlineCode } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let showPromote = false;
    export let selectedVar: Partial<Models.Variable> = null;
    export let isConflicting: boolean;

    const dispatch = createEventDispatcher();
</script>

<Confirm
    title={isConflicting ? 'Overwrite global variable' : 'Promote variable'}
    bind:open={showPromote}
    onSubmit={() => {
        dispatch('promoted');
    }}>
    <svelte:fragment slot="title"></svelte:fragment>
    {#if isConflicting}
        <p data-private>
            Promoting this variable will overwrite your global variable with the same name. Are you
            sure you want to promote <InlineCode code={selectedVar.key}
                >{selectedVar.key}</InlineCode
            >?
        </p>
    {:else}
        <p data-private>
            Are you sure you want to promote <InlineCode code={selectedVar.key}
                >{selectedVar.key}</InlineCode
            >? This will convert it to a global variable that can be accessed by other resources in
            your project.
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showPromote = false)}>Cancel</Button>
        <Button submit>{isConflicting ? 'Promote anyway' : 'Promote'}</Button>
    </svelte:fragment>
</Confirm>
