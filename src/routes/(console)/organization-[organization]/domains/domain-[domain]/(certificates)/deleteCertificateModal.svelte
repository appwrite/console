<script lang="ts">
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Confirm } from '$lib/components';

    export let show = false;

    let error = '';

    async function deleteCertificate() {
        try {
            //TODO: add method
            await invalidate(Dependencies.DOMAIN);
            show = false;
            addNotification({
                type: 'success',
                message: `Certificate has been deleted`
            });
            trackEvent(Submit.CertificateDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.CertificateDelete);
        }
    }
</script>

<Confirm title="Delete certificate" bind:open={show} onSubmit={deleteCertificate} bind:error>
    Are you sure you want to delete this SSL certificate? This action is irreversible.
</Confirm>
