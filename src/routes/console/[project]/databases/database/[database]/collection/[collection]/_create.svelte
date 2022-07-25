<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { Step, Steps } from '$lib/components';

    export let showCreate = false;

    let steps = [
        { title: 'Create data', current: true, completed: false },
        { title: 'Set permissions', current: false, completed: false }
    ];
</script>

<Wizard title="Create document" bind:show={showCreate}>
    <svelte:fragment slot="aside">
        <Steps>
            {#each steps as step}
                <Step current={step.current} completed={step.completed}>
                    {step.title}
                </Step>
            {/each}
        </Steps>
    </svelte:fragment>
    test
</Wizard>
