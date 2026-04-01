<script lang="ts">
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputTags } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../store';
    import { Tag, Input, Layout, Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    const alphaNumericRegExp = /^[a-zA-Z0-9]+$/;
    let suggestedLabels = ['live', 'stage', 'internal'];
    let labels: string[] = [];
    let error = '';

    onMount(async () => {
        labels = [...(($project as { labels?: string[] }).labels ?? [])];
    });

    async function updateProjectLabels(projectId: string, nextLabels: string[]) {
        const client = sdk.forConsole.client;
        const apiPath = `/projects/${projectId}/labels`;
        const uri = new URL(client.config.endpoint + apiPath);

        return client.call(
            'put',
            uri,
            { 'content-type': 'application/json' },
            { labels: nextLabels }
        );
    }

    async function updateLabels() {
        try {
            await updateProjectLabels($project.$id, labels);
            await invalidate(Dependencies.PROJECT);
            isDisabled = true;
            addNotification({
                type: 'success',
                message: 'Project labels have been updated'
            });
            trackEvent(Submit.ProjectUpdateLabels);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.ProjectUpdateLabels);
        }
    }

    $: isDisabled =
        !!error ||
        !symmetricDifference(labels, ($project as { labels?: string[] }).labels ?? []).length;

    $: if (labels) {
        const invalidLabels = [];

        labels.forEach((label) => {
            if (!alphaNumericRegExp.test(label)) {
                invalidLabels.push(label);
            }
        });

        if (invalidLabels.length) {
            error = `Invalid labels: ${invalidLabels.join(', ')}`;
        } else {
            error = '';
        }
    }
</script>

<Form onSubmit={updateLabels}>
    <CardGrid>
        <svelte:fragment slot="title">Labels</svelte:fragment>
        Categorize and manage your projects for easy searching based on specific criteria by assigning
        them customizable labels.
        <svelte:fragment slot="aside">
            <Layout.Stack gap="s">
                {#key labels.length}
                    <InputTags
                        id="project-labels"
                        label="Labels"
                        placeholder="Select or type project labels"
                        bind:tags={labels} />
                {/key}
                <Layout.Stack direction="row">
                    {#each suggestedLabels as suggestedLabel}
                        <Tag
                            size="s"
                            selected={labels.includes(suggestedLabel)}
                            on:click={() => {
                                if (!labels.includes(suggestedLabel)) {
                                    labels = [...labels, suggestedLabel];
                                } else {
                                    labels = labels.filter((e) => e !== suggestedLabel);
                                }
                            }}>
                            <Icon icon={IconPlus} size="s" slot="start" />
                            {suggestedLabel}
                        </Tag>
                    {/each}
                </Layout.Stack>
                <Input.Helper state={error ? 'warning' : 'default'}
                    >{error ? error : 'Only alphanumeric characters are allowed'}</Input.Helper>
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
