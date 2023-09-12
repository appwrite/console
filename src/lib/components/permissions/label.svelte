<script lang="ts">
    import { Button, FormList, Helper, InputText } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { Modal } from '..';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';

    export let show: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    const pattern = String.raw`^[a-zA-Z0-9]+$`;
    let value = '';
    let isError = false;

    function reset() {
        value = '';
        show = false;
    }

    function create() {
        if (!value || !value.match(pattern)) {
            isError = true;
            return;
        }

        dispatch('create', [`label:${value}`]);
        reset();
    }

    $: disabled = !value || $groups.has(value);
</script>

<Modal title="Label" bind:show on:close={reset} onSubmit={create}>
    <p class="text">Labels allow you to grant access to users with the specfied label.</p>
    <FormList>
        <InputText showLabel={false} id="label" label="Label" placeholder="admin" bind:value />
        <Helper type={isError ? 'warning' : 'neutral'}
            >Only alphanumeric characters are allowed.</Helper>
    </FormList>

    <svelte:fragment slot="footer">
        <Button submit {disabled}>Add</Button>
    </svelte:fragment>
</Modal>
