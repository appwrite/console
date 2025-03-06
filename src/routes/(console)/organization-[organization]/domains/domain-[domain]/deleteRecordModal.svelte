<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';
    import { page } from '$app/stores';
    import type { DnsRecord } from '$lib/sdk/domains';

    export let show = false;
    export let selectedRecord: DnsRecord;

    let error = '';

    async function deleteDomain() {
        try {
            await sdk.forConsole.domains.deleteRecord($page.params.domain, selectedRecord.$id);
            await invalidate(Dependencies.DOMAINS);
            show = false;
            addNotification({
                type: 'success',
                message: 'Record has been deleted'
            });
            trackEvent(Submit.DomainDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.DomainDelete);
        }
    }
</script>

<Confirm onSubmit={deleteDomain} title="Delete domain" bind:open={show} bind:error>
    <p>Are you sure you want to delete this record? This action is irreversible.</p>
</Confirm>
