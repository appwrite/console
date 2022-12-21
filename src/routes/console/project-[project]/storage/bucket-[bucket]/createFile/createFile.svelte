<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { uploader } from '$lib/stores/uploader';
    import { wizard } from '$lib/stores/wizard';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { store } from './store';

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

    function finish() {
        wizard.hide();
        // We use then() here instead of await so we don't need to wait for the upload to finish
        // to reset the store, since resetting it before the upload starts will cause the
        // store arguments to be null.
        uploader.uploadFile(bucketId, $store.id, $store.files[0], $store.permissions).then(() => {
            invalidate(Dependencies.FILES);
        });
        trackEvent('submit_file_create');
        store.reset();
    }
</script>

<Wizard title="Upload file" {steps} on:finish={finish} />
