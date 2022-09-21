<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { attributeList } from './store';
    import { sdkForProject } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import { createDocument } from './wizard/store';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;

    onMount(async () => {
        await attributeList.load(databaseId, collectionId);
        initializeDocument();
    });

    const initializeDocument = () => {
        $createDocument.attributes = $attributeList?.attributes?.filter(
            (a) => a.status === 'available'
        );
        $attributeList.attributes.forEach((attr) => {
            if (attr.array) {
                $createDocument.document[attr.key] = [null];
            } else {
                $createDocument.document[attr.key] = null;
            }
        });
    };

    const create = async () => {
        try {
            await sdkForProject.databases.createDocument(
                databaseId,
                collectionId,
                $createDocument.id ?? 'unique()',
                $createDocument.document,
                $createDocument.read,
                $createDocument.write
            );
            addNotification({
                message: 'Document has been created',
                type: 'success'
            });
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };

    $: attributeList.load(databaseId, collectionId);

    $: if (!$wizard.show) {
        initializeDocument();
        $createDocument.read = [];
        $createDocument.write = [];
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Create data',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Set permissions',
        component: Step2
    });
</script>

<Wizard title="Create document" steps={stepsComponents} on:submit={create} />
