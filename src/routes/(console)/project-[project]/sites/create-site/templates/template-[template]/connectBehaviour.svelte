<script lang="ts">
    import { LabelCard } from '$lib/components';

    export let connectBehaviour: 'now' | 'later' = 'now';
    // const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    const isVcsEnabled = true;
</script>

<div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
    <LabelCard
        value="now"
        bind:group={connectBehaviour}
        disabled={!isVcsEnabled}
        title="Connect to Git repository">
        Clone the template to a new repository or connect it to an existing one.
    </LabelCard>
    <LabelCard value="later" bind:group={connectBehaviour} disabled={!isVcsEnabled}>
        <svelte:fragment slot="title">Connect later</svelte:fragment>
        Deploy now and continue development via CLI, or connect Git from your site settings.
    </LabelCard>
</div>
