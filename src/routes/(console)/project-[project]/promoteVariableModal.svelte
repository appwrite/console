<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import type { Models } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';

    export let showPromote = false;
    export let selectedVar: Partial<Models.Variable> = null;
    export let isConflicting: boolean;

    const dispatch = createEventDispatcher();
</script>

<Modal
    bind:show={showPromote}
    onSubmit={() => {
        dispatch('promoted');
    }}
    headerDivider={false}>
    <svelte:fragment slot="title">
        {isConflicting ? 'Overwrite global variable' : 'Promote variable'}
    </svelte:fragment>
    {#if isConflicting}
        <p data-private>
            Promoting this variable will overwrite your global variable with the same name. Are you
            sure you want to promote <span class="inline-code">{selectedVar.key}</span>?
        </p>
    {:else}
        <p data-private>
            Are you sure you want to promote <span class="inline-code">{selectedVar.key}</span>?
            This will convert it to a global variable that can be accessed by other functions in
            your project.
        </p>
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showPromote = false)}>Cancel</Button>
        <Button submit>{isConflicting ? 'Promote anyway' : 'Promote'}</Button>
    </svelte:fragment>
</Modal>
