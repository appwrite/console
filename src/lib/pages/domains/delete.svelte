<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import type { Dependencies } from '$lib/constants';
    import Confirm from '$lib/components/confirm.svelte';
    import { page } from '$app/state';

    export let showDelete = false;
    export let selectedDomain: Models.ProxyRule;
    export let dependency: Dependencies;

    let error: string;

    function getCorrectMessage(): string {
        const resourceType = selectedDomain.type;
        switch (resourceType) {
            case 'api':
                return `access ${resourceType}`;
            case 'deployment':
                return `view your ${resourceType}`;
            case 'redirect':
                return `view your ${resourceType} `;
        }
    }

    async function deleteDomain() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .proxy.deleteRule(selectedDomain.$id);
            await invalidate(dependency);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${selectedDomain.domain} has been deleted`
            });
            trackEvent(Submit.DomainDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DomainDelete);
        }
    }
</script>

<Confirm onSubmit={deleteDomain} title="Delete domain" bind:open={showDelete} bind:error>
    <p data-private>Are you sure you want to delete <b>{selectedDomain?.domain}</b>?</p>
    <p>You will no longer be able to {getCorrectMessage()} by visiting this domain.</p>
</Confirm>
