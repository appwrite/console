<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { uploader } from '$lib/stores/uploader';
    import { wizard } from '$lib/stores/wizard';
    import { ID } from '@appwrite.io/console';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import { createFile } from './store';

    const bucketId = $page.params.bucket;

    const stepComponents: WizardStepsType = new Map();

    stepComponents.set(1, {
        component: Step1,
        label: 'Create'
    });

    stepComponents.set(2, {
        component: Step2,
        label: 'Permissions'
    });

    async function create() {
        try {
            await uploader.uploadFile(
                bucketId,
                $createFile.id ?? ID.unique(),
                $createFile.files[0],
                $createFile.permissions
            );

            createFile.reset();
            wizard.hide();
            invalidate(Dependencies.FILES);

            addNotification({
                type: 'success',
                message: `File has been uploaded`
            });
            trackEvent(Submit.FileCreate, {
                customId: !!$createFile.id
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.FileCreate);
        }
    }
</script>

<Wizard title="Create file" steps={stepComponents} on:exit={createFile.reset} on:finish={create} />
