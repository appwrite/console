<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { InputText, Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID, Region } from '@appwrite.io/console';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Tag } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let id: string;
    let error: string;
    let showCustomId = false;
    let disabled: boolean = false;
    let name: string = 'Appwrite project';

    async function create() {
        try {
            disabled = true;
            const project = await sdk.forConsole.projects.create(
                id ?? ID.unique(),
                name,
                teamId,
                Region.Default
            );
            show = false;
            dispatch('created', project);
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId
            });
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            await goto(`${base}/project-${project.region}-${project.$id}`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectCreate);
            disabled = false;
        }
    }
</script>

<Modal title="Create project" {error} onSubmit={create} bind:show>
    <Layout.Stack gap="l">
        <InputText id="name" label="Name" bind:value={name} required autofocus={true} />
        {#if !showCustomId}
            <span>
                <Tag size="s" on:click={() => (showCustomId = !showCustomId)}>
                    <Icon icon={IconPencil} slot="start" size="s" />
                    Project ID
                </Tag>
            </span>
        {:else}
            <CustomId autofocus bind:show={showCustomId} name="Project" isProject bind:id />
        {/if}
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit {disabled}>Create</Button>
    </svelte:fragment>
</Modal>
