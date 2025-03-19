<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';
    import type { Domain } from '$lib/sdk/domains';

    export let show = false;
    export let selectedDomain: Domain;

    let error = '';

    async function deleteDomain() {
        try {
            await sdk.forConsole.domains.delete(selectedDomain.$id);
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

<Confirm onSubmit={deleteDomain} title="Delete domain" bind:open={show} bind:error>
    <p data-private>Are you sure you want to delete <b>{selectedDomain?.domain}</b>?</p>
    <p>Your site will no longer be available at this domain. This action is irreversible.</p>
</Confirm>
