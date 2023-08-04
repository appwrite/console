<script lang="ts">
    import { Button, FormList, Helper, InputText } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { Modal } from '..';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';
    import LL from '$i18n/i18n-svelte';

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

<Modal bind:show on:close={reset} onSubmit={create}>
    <svelte:fragment slot="header">{$LL.console.project.title.customPermission()}</svelte:fragment>
    <p class="text">
        {$LL.console.project.texts.components.custom.permission()}
    </p>
    <FormList>
        <InputText
            showLabel={false}
            id="custom-permission"
            label="Custom permission"
            placeholder="user:[USER_ID] or team:[TEAM_ID]/[ROLE]"
            bind:value />
        <Helper type="neutral">
            {$LL.console.project.texts.components.custom.permissionFormation()}
            {$LL.console.project.texts.components.custom.user()}[USER_ID] {$LL.console.project.texts.components.custom.or()}
            {$LL.console.project.texts.components.custom.team()}[TEAM_ID]/[ROLE]¸
        </Helper>
    </FormList>

    <svelte:fragment slot="footer">
        <Button submit {disabled}>{$LL.console.project.button.submit.add()}</Button>
    </svelte:fragment>
</Modal>
