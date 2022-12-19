<script lang="ts">
    import Wizard from '$lib/layout/wizard.svelte';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { uploader } from '$lib/stores/uploader';
    import { store } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { trackEvent } from '$lib/actions/analytics';
    import { page } from '$app/stores';
    import { wizard } from '$lib/stores/wizard';

    const bucketId = $page.params.bucket;
    const steps: WizardStepsType = new Map();
    steps.set(1, {
        component: Step1,
        label: 'Upload file'
    });
    steps.set(2, {
        component: Step2,
        label: 'Set permissions'
    });

    async function finish() {
        try {
            wizard.hide();
            await uploader.uploadFile(bucketId, $store.id, $store.files[0], $store.permissions);
            store.reset();
            addNotification({
                type: 'success',
                message: `File has been uploaded`
            });
            trackEvent('submit_file_create');
        } catch ({ message }) {
            // error = message;
        }
        invalidate(Dependencies.FILES);
    }
</script>

<Wizard title="Upload file" {steps} on:finish={finish} />
