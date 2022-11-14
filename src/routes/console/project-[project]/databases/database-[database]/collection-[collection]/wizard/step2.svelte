<script lang="ts">
    import { Permissions } from '$lib/components/permissions';
    import { WizardStep } from '$lib/layout';
    import { createDocument } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Permissions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Assign read or write permissions at the <b> Collection Level</b> or
        <b> Document Level</b>. If collection Level permissions are assigned, permissions applied to
        individual documents are ignored.
    </svelte:fragment>
    <div class="common-section">
        <Permissions bind:permissions={$createDocument.permissions} />
    </div>
</WizardStep>
