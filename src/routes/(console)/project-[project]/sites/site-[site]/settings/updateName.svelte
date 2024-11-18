<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { type Models } from '@appwrite.io/console';

    export let site: Models.Site;
    let siteName: string = null;

    onMount(async () => {
        siteName ??= site.name;
    });

    async function updateName() {
        try {
            await sdk.forProject.sites.update(
                site.$id,
                siteName,
                site.framework,
                site.enabled || undefined,
                site.timeout || undefined,
                site.installCommand || undefined,
                site.buildCommand || undefined,
                site.outputDirectory || undefined,
                site.buildRuntime || undefined,
                site.serveRuntime || undefined,
                site.installationId || undefined,
                site.providerRepositoryId || undefined,
                site.providerBranch || undefined,
                site.providerSilentMode || undefined,
                site.providerRootDirectory || undefined,
                site.specification || undefined
            );
            await invalidate(Dependencies.SITE);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.SiteUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.SiteUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">Name</Heading>

        <svelte:fragment slot="aside">
            <ul>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Enter name"
                    autocomplete={false}
                    bind:value={siteName} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={siteName === site.name || !siteName} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
