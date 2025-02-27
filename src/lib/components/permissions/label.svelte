<script lang="ts">
    import { Button, InputText } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { Modal } from '..';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';

    export let show: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    const pattern = String.raw`^[a-zA-Z0-9]+$`;
    let value = '';

    function reset() {
        value = '';
        show = false;
    }

    function create() {
        if (!value || !value.match(pattern)) {
            return;
        }

        dispatch('create', [`label:${value}`]);
        reset();
    }

    $: disabled = !value || $groups.has(value);
</script>

<Modal title="Label" bind:show on:close={reset} onSubmit={create}>
    <svelte:fragment slot="description">
        Labels allow you to grant access to users with the specified label.
    </svelte:fragment>
    <InputText
        required
        id="label"
        label="Label"
        placeholder="Enter label"
        bind:value
        helper="Only alphanumeric characters are allowed." />

    <svelte:fragment slot="footer">
        <Button submit {disabled}>Add</Button>
    </svelte:fragment>
</Modal>
