<script lang="ts">
    import { page } from '$app/stores';
    import { WizardStep } from '$lib/layout';

    $: isFirstProject = $page.data.platforms.total === 0;
</script>

<WizardStep>
    <svelte:fragment slot="title">You're ready to go 🎉</svelte:fragment>
    <p>
        {#if isFirstProject}
            Congratulations on adding the first platform to your project! Start exploring by
            creating users, adding a database to your project, or uploading files to a bucket.
        {:else}
            Congratulations on adding another platform to your project! Start building by adding a
            database, uploading files to a bucket and more via your dashboard.
        {/if}
    </p>
</WizardStep>
