<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';

    export let show = false;
    export let selectedDomain: Models.ProxyRule;
    let error = '';

    async function deleteDomain() {
        try {
            await sdk.forProject.proxy.deleteRule(selectedDomain.$id);
            await invalidate(Dependencies.DOMAINS);
            show = false;
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

<Confirm title="Delete domain" bind:open={show} onSubmit={deleteDomain} bind:error>
    {#if selectedDomain}
        <p data-private>Are you sure you want to delete <b>{selectedDomain.domain}</b>?</p>
        <p>You will no longer be able to execute your function by visiting this domain.</p>
    {/if}
</Confirm>
