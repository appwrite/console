<script lang="ts">
    import { Button, FormList, Helper, InputText } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { Modal } from '..';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';

    export let show: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    let value = '';

    function reset() {
        value = '';
        show = false;
    }

    function create() {
        dispatch('create', [value]);
        reset();
    }

    $: disabled = !value || $groups.has(value);
</script>

<Modal title="Custom permission" bind:show on:close={reset} onSubmit={create}>
    <p class="text">
        Custom permissions allow you to grant access to specific users or teams using their ID and
        role.
    </p>
    <FormList>
        <InputText
            showLabel={false}
            id="custom-permission"
            label="Custom permission"
            placeholder="user:[USER_ID] or team:[TEAM_ID]/[ROLE]"
            bind:value />
        <Helper type="neutral">
            A permission should be formatted as: user:[USER_ID] or team:[TEAM_ID]/[ROLE]¸
        </Helper>
    </FormList>

    <svelte:fragment slot="footer">
        <Button submit {disabled}>Add</Button>
    </svelte:fragment>
</Modal>
