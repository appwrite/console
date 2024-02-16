<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { providers } from '../store';
    import { providerType, provider, providerParams } from './store';
    import SettingsFormList from '../settingsFormList.svelte';

    let files: Record<string, FileList> = {};
    const inputs = providers[$providerType].providers[$provider].configure;

    onMount(() => {
        for (const input of inputs) {
            if (input.type === 'file' && $providerParams[$provider][input.name].length > 0) {
                const dataTransfer = new DataTransfer();
                const f = new File(
                    [$providerParams[$provider][input.name]],
                    `${input.name}.${input.allowedFileExtensions}`
                );
                dataTransfer.items.add(f);
                files[input.name] = dataTransfer.files;
            }
        }
    });

    async function beforeSubmit() {
        const promises = [];
        for (const [key, value] of Object.entries(files)) {
            const promise = value[0].text().then((text) => {
                $providerParams[$provider][key] = text;
            });
            promises.push(promise);
        }
        await Promise.all(promises);
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Settings</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set up the credentials below to enable {providers[$providerType].providers[$provider].title}
        for sending
        {providers[$providerType].text}.
    </svelte:fragment>

    <SettingsFormList bind:files {inputs} bind:params={$providerParams[$provider]} />

    <p class="body-text-2 u-bold u-margin-block-start-48">Need a hand?</p>

    <div
        class="u-flex u-cross-center u-main-space-between u-padding-block-16"
        style="border-block-end: solid .0625rem hsl(var(--color-border))">
        <div class="u-flex u-cross-center u-gap-16">
            <div class="avatar is-size-small">
                <span class="icon-book-open" style:--p-text-size="1.25rem" aria-hidden="true" />
            </div>
            Read the full guide in the documentation
        </div>
        <span class="icon-arrow-right" aria-hidden="true" />
    </div>

    <div class="u-flex u-cross-center u-main-space-between u-padding-block-16">
        <div class="u-flex u-cross-center u-gap-16">
            <div class="avatar is-size-small">
                <span class="icon-user-group" style:--p-text-size="1.25rem" aria-hidden="true" />
            </div>
            Invite a team member to complete this step
        </div>
        <span class="icon-arrow-right" aria-hidden="true" />
    </div>
</WizardStep>
