<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import AttributeForm from '../document-[document]/attributeForm.svelte';
    import { createDocument } from './store';
    import LL from '$i18n/i18n-svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">{$LL.console.project.title.createData()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.texts.databases.wizards.stepOne()}
    </svelte:fragment>

    <AttributeForm
        bind:formValues={$createDocument.document}
        attributes={$createDocument.attributes}
        bind:customId={$createDocument.id}
        gap="24" />
</WizardStep>
