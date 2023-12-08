<script lang="ts">
    import { FormList, InputSelect, InputTextarea } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { supportData } from './store';
    import { Pill } from '$lib/elements';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    // import { Collapsible, CollapsibleItem } from '$lib/components';

    // let files: FileList;

    let options: {
        value: string;
        label: string;
    }[];

    onMount(async () => {
        const projectList = await sdk.forConsole.projects.list();
        options = projectList.projects.map((project) => ({
            value: project.$id,
            label: project.name
        }));
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">How can we help you?</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Please describe your request in detail. If applicable, include steps for reproduction of any
        in-app issues.
    </svelte:fragment>
    <div class="common-section">
        <p class="label">Choose a topic</p>
        <div class="u-flex u-gap-8 u-margin-block-start-8">
            {#each ['general', 'billing', 'technical'] as topic}
                <Pill
                    button
                    selected={$supportData.category === topic}
                    on:click={() => {
                        $supportData.category = topic;
                    }}>{topic}</Pill>
            {/each}
        </div>
    </div>
    <div class="common-section">
        <FormList>
            {#if options?.length}
                <InputSelect
                    id="project"
                    label="Choose a project"
                    placeholder="Select project"
                    optionalText="(optional)"
                    bind:value={$supportData.project}
                    {options} />
            {/if}
            <InputTextarea
                label="Tell us a bit more"
                id="message"
                placeholder="Type here..."
                bind:value={$supportData.message}
                required />
        </FormList>
    </div>
    <!-- <div class="common-section">
        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">Want to attach a file? (optional)</svelte:fragment>
                <svelte:fragment slot="subtitle">
                    A picture is worth a thousand words.
                </svelte:fragment>
                <InputFile bind:files label="Attach a file" />
            </CollapsibleItem>
        </Collapsible>
    </div> -->
</WizardStep>
