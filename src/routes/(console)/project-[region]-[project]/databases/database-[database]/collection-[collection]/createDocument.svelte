<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { ID } from '@appwrite.io/console';
    import { onDestroy, onMount } from 'svelte';
    import { attributes } from './store';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import { createDocument } from './wizard/store';

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
            await sdk
                .forProject($page.params.region, $page.params.project)
                .databases.createDocument(
                    databaseId,
                    collectionId,
                    $createDocument.id ?? ID.unique(),
                    $createDocument.document,
                    $createDocument.permissions
                );
            await invalidate(Dependencies.DOCUMENTS);

            addNotification({
                message: 'Document has been created',
                type: 'success'
            });
            trackEvent(Submit.DocumentCreate, {
                customId: !!$createDocument.id
            });

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

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Data',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Permissions',
        component: Step2,
        optional: true
    });
</script>

<Wizard title="Create document" steps={stepsComponents} on:finish={create} />
