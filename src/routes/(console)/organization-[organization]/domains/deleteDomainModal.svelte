<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';

    export let show = false;
    export let selectedDomain: Models.Domain;

    let error = '';
    let domainsList = `${base}/organization-${page.params.organization}/domains`;

    async function deleteDomain() {
        try {
            await sdk.forConsole.domains.delete(selectedDomain.$id);
            show = false;
            addNotification({
                type: 'success',
                message: `${selectedDomain.domain} has been deleted`
            });
            trackEvent(Submit.DomainDelete);
            await goto(domainsList);
            await invalidate(Dependencies.DOMAINS);
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
