<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let site: Models.Site;
    let logging = site?.logging;

    async function update() {
        try {
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                site.framework as Framework,
                site.enabled || undefined,
                logging,
                site.timeout || undefined,
                site.installCommand || undefined,
                site.buildCommand || undefined,
                site.outputDirectory || undefined,
                (site?.buildRuntime as BuildRuntime) || undefined,
                site.adapter as Adapter,
                site.fallbackFile || undefined,
                site.installationId || undefined,
                site.providerRepositoryId || undefined,
                site.providerBranch || undefined,
                site.providerSilentMode || undefined,
                site.providerRootDirectory || undefined
            );
            await invalidate(Dependencies.SITE);
            addNotification({
                type: 'success',
                message:
                    site.name + ' logs settings have been ' + (logging ? 'enabled' : 'disabled')
            });
            trackEvent(Submit.SiteUpdateLogging);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SiteUpdateLogging);
        }
    }
</script>

<Form onSubmit={update}>
    <CardGrid>
        <svelte:fragment slot="title">Logging</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch label="Logs" id="logging" bind:value={logging} />
            <Typography.Text>
                When disabled, request logs will exclude logs and errors, and site responses will be
                slightly faster.
            </Typography.Text>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={site?.logging === logging} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
