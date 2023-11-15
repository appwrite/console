<script lang="ts">
    import { FormList, InputTextarea } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { supportData } from './store';
    import Light from '$lib/images/support/support-wizard-light.svg';
    import Dark from '$lib/images/support/support-wizard-dark.svg';
    import { Pill } from '$lib/elements';
    // import { Collapsible, CollapsibleItem } from '$lib/components';

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;

    // let files: FileList;
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
