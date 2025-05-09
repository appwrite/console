<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { providers } from '../store';
    import { providerType, provider, providerParams } from './store';
    import SettingsFormList from '../settingsFormList.svelte';

    import { MessagingProviderType } from '@appwrite.io/console';
    import {
        Collapsible,
        CollapsibleItem,
        ClickableList,
        ClickableListItem
    } from '$lib/components';
    import { getProviderText } from '../../helper';

    let files: Record<string, FileList> = {};
    $: inputs = providers[$providerType].providers[$provider].configure;

    $: {
        files;
        $providerType;
        $provider;

        beforeSubmit();
    }
    onMount(() => {
        const flattened = [];
        for (const i of inputs) {
            if (Array.isArray(i)) {
                flattened.push(...i);
            } else {
                flattened.push(i);
            }
        }
        for (const input of flattened) {
            if (
                input.type === 'file' &&
                $providerParams[$provider] &&
                $providerParams[$provider][input.name].length > 0
            ) {
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
    <svelte:fragment slot="subtitle">
        Set up the credentials below to enable {providers[$providerType].providers[$provider].title}
        for sending
        {providers[$providerType].text}.
    </svelte:fragment>

    <SettingsFormList bind:files {inputs} bind:params={$providerParams[$provider]} />
</WizardStep>
