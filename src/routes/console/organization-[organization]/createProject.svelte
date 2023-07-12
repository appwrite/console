<script lang="ts">
    import { goto } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import LL from '$i18n/i18n-svelte';

    export let show = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let id: string;
    let name: string;
    let showCustomId = false;
    let error: string;

    async function create() {
        try {
            const project = await sdk.forConsole.projects.create(
                id ?? ID.unique(),
                name,
                teamId,
                'default'
            );
            dispatch('created', project);
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId
            });
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            await goto(`/console/project-${project.$id}`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectCreate);
        }
    }
</script>

<Modal {error} onSubmit={create} size="big" bind:show>
    <svelte:fragment slot="header"
        >{$LL.console.organization.forms.createProject.title()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.organization.forms.createProject.inputs.name.label()}
            bind:value={name}
            required
            autofocus={true} />
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" /><span class="text">
                        {$LL.console.organization.table.pill.projectId()}
                    </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Project" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}
            >{$LL.console.organization.button.submit.cancel()}</Button>
        <Button submit>{$LL.console.organization.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
