<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { beforeNavigate, invalidate } from '$app/navigation';
    import { attributes } from './store';
    import { sdkForProject } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { onDestroy, onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import { createDocument } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@appwrite.io/console';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;

    onMount(initializeDocument);

    function initializeDocument() {
        $createDocument.attributes = $attributes.filter((a) => a.status === 'available');
        $attributes.forEach((attr) => {
            if (attr.array) {
                $createDocument.document[attr.key] = [];
            } else {
                $createDocument.document[attr.key] = null;
            }
        });
    }

    async function create() {
        try {
            await sdkForProject.databases.createDocument(
                databaseId,
                collectionId,
                $createDocument.id ?? ID.unique(),
                $createDocument.document,
                $createDocument.permissions
            );

            addNotification({
                message: 'Document has been created',
                type: 'success'
            });
            trackEvent(Submit.DocumentCreate, {
                customId: !!$createDocument.id
            });
            invalidate(Dependencies.DOCUMENTS);

            createDocument.reset();
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DocumentCreate);
        }
    }

    onDestroy(() => {
        $createDocument.id = null;
        $createDocument.document = {};
        $createDocument.attributes = [];
        $createDocument.permissions = [];
    });

    beforeNavigate(() => {
        wizard.hide();
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Create data',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Set permissions',
        component: Step2,
        optional: true
    });
</script>

<Wizard title="Create document" steps={stepsComponents} on:finish={create} />
