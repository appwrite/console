<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { InputText, Button, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { regions as regionsStore } from '$lib/stores/organization';
    import { isMultiRegion } from '$lib/system';
    import { filterRegions } from '$lib/helpers/regions';
    import { ID, type Region } from '@appwrite.io/console';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    export let teamId: string;

    const dispatch = createEventDispatcher();

    let id: string = '';
    let error: string;
    let showCustomId = false;
    let disabled: boolean = false;
    let name: string = 'New project';
    let showSubmissionLoader = false;
    let region: string = '';

    $: regionOptions = filterRegions($regionsStore.regions || []);
    $: if (
        regionOptions.length &&
        !regionOptions.some((option) => option.value === region && !option.disabled)
    ) {
        region = regionOptions.find((option) => !option.disabled)?.value ?? regionOptions[0].value;
    }

    async function create() {
        try {
            disabled = true;
            showSubmissionLoader = true;
            const payload: { projectId: string; name: string; region?: Region } = {
                projectId: id || ID.unique(),
                name
            };
            if (isMultiRegion && region) {
                payload.region = region as Region;
            }
            const project = await sdk.forConsole.organization(teamId).createProject(payload);
            show = false;
            dispatch('created', project);
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId,
                region: project.region
            });
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            await goto(`${base}/project-${project.region ?? 'default'}-${project.$id}`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectCreate);
        } finally {
            disabled = false;
            showSubmissionLoader = false;
        }
    }
</script>

<Modal title="Create project" {error} onSubmit={create} bind:show>
    <Layout.Stack gap="l">
        <InputText id="name" label="Name" bind:value={name} required autofocus={true} />
        {#if isMultiRegion && regionOptions.length > 0}
            <Layout.Stack gap="xs">
                <InputSelect
                    id="region"
                    label="Region"
                    required
                    bind:value={region}
                    options={regionOptions}
                    placeholder="Select a region" />
                <Typography.Text>Region cannot be changed after creation</Typography.Text>
            </Layout.Stack>
        {/if}
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
        <Button
            submit
            {disabled}
            forceShowLoader={showSubmissionLoader}
            submissionLoader={showSubmissionLoader}>Create</Button>
    </svelte:fragment>
</Modal>
