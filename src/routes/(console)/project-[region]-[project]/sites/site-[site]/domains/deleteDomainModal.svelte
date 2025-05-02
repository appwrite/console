<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';
    import { Typography } from '@appwrite.io/pink-svelte';

    let {
        show = $bindable(),
        selectedDomain
    }: {
        show: boolean;
        selectedDomain: Models.ProxyRule;
    } = $props();

    let error: string = $state(null);

    async function deleteDomain() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.deleteRule(selectedDomain.$id);
            await invalidate(Dependencies.SITES_DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: `Domain has been deleted`
            });
            trackEvent(Submit.DomainDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DomainDelete);
        }
    }
</script>

<Confirm title="Delete domain" bind:open={show} onSubmit={deleteDomain} bind:error confirmDeletion>
    {#if selectedDomain}
        <Typography.Text variant="m-400">
            Are you sure you want to delete this domain? You will no longer be able to view your
            site by visiting:
        </Typography.Text>
        <Typography.Text variant="m-500">
            {selectedDomain.domain}
        </Typography.Text>
    {/if}
</Confirm>
