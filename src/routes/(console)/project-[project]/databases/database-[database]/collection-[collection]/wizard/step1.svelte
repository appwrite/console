<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import AttributeForm from '../document-[document]/attributeForm.svelte';
    import { createDocument } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Data</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Provide document data based on attributes you created earlier.
    </svelte:fragment>

    <AttributeForm
        bind:formValues={$createDocument.document}
        attributes={$createDocument.attributes}
        bind:customId={$createDocument.id}
        gap="24" />
</WizardStep>
