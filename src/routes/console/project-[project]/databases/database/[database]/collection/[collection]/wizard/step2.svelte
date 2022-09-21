<script lang="ts">
    import { Alert } from '$lib/components';
    import { InputTags } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { createDocument } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Set Permissions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Assign read or write permissions at the <b> Collection Level</b> or
        <b> Document Level</b>. If collection Level permissions are assigned, permissions applied to
        individual documents are ignored.
    </svelte:fragment>
    <Alert type="info">
        <svelte:fragment slot="title">
            You have Collection Level permissions enabled
        </svelte:fragment>
        <p>
            If you want to assign permissions specific to this document, you will need to update
            your Collection Settings to enable Document Level permissions.
        </p>
    </Alert>

    <ul class="common-section">
        <InputTags
            id="read"
            label="Read Access"
            placeholder="User ID, Team ID, or Role"
            bind:tags={$createDocument.read} />
        <InputTags
            id="write"
            label="Write Access"
            placeholder="User ID, Team ID, or Role"
            bind:tags={$createDocument.write} />
    </ul>
</WizardStep>
