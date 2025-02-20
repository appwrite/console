<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { Models } from '@appwrite.io/console';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';

    export let show = false;
    export let selectedDomain: Models.Domain;

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

<!-- TODO: fix copy -->
<Confirm onSubmit={deleteDomain} title="Delete domain" bind:open={show} bind:error>
    <p data-private>Are you sure you want to delete <b>{selectedDomain?.domain}</b>?</p>
    <p>
        You will no longer be able to access any projects or services associated with this domain.
    </p>
</Confirm>
