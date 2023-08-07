<script lang="ts">
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { InputText, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import LL from '$i18n/i18n-svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let name: string, id: string, error: string;
    let showCustomId = false;

    const create = async () => {
        try {
            const team = await sdk.forProject.teams.create(id ?? ID.unique(), name);
            name = '';
            showCreate = false;
            showCustomId = false;
            addNotification({
                type: 'success',
                message: `${team.name} ${$LL.components.notification.hasBeenCreated()}`
            });
            trackEvent(Submit.TeamCreate, {
                customId: !!id
            });
            dispatch('created', team);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.TeamCreate);
        }
    };

    $: if (!showCreate) {
        showCustomId = false;
        error = null;
    }
</script>

<Modal {error} size="big" bind:show={showCreate} onSubmit={create}>
    <svelte:fragment slot="header">{$LL.console.project.title.createTeam()}</svelte:fragment>
    <FormList>
        <InputText
            id="name"
            label={$LL.console.project.forms.createTeam.inputs.name.label()}
            placeholder={$LL.console.project.forms.createTeam.inputs.name.placeholder()}
            autofocus={true}
            required
            bind:value={name} />
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" />
                    <span class="text"> {$LL.console.project.table.pill.teamId()}</span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Team" bind:id />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}
            >{$LL.console.button.cancel()}</Button>
        <Button submit>{$LL.console.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
