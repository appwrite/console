<script lang="ts">
    import { LabelCard } from '$lib/components';
    import { consoleVariables } from '$routes/(console)/store';
    import { Layout } from '@appwrite.io/pink-svelte';

    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    export let connectBehaviour: 'now' | 'later' = isVcsEnabled ? 'now' : 'later';
</script>

<Layout.Grid columns={2} columnsXS={1}>
    <LabelCard
        value="now"
        bind:group={connectBehaviour}
        disabled={!isVcsEnabled}
        title="Connect your repository">
        Clone this template into a new Git repository or link it to an existing one.
    </LabelCard>
    <LabelCard value="later" bind:group={connectBehaviour}>
        <svelte:fragment slot="title">Connect later</svelte:fragment>
        Deploy now and connect your version control later via CLI or Git integration in your settings.
    </LabelCard>
</Layout.Grid>
