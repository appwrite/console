<script lang="ts">
    import { LabelCard } from '$lib/components';
    import { consoleVariables } from '$routes/(console)/store';

    export let connectBehaviour: 'now' | 'later' = 'now';
    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
</script>

<div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
    <LabelCard
        value="now"
        bind:group={connectBehaviour}
        disabled={!isVcsEnabled}
        title="Connect your repository">
        Clone this template into a new Git repository or link it to an existing one.
    </LabelCard>
    <LabelCard value="later" bind:group={connectBehaviour} disabled={!isVcsEnabled}>
        <svelte:fragment slot="title">Connect later</svelte:fragment>
        Deploy now and connect your version control later via CLI or Git integration in your settings.
    </LabelCard>
</div>
