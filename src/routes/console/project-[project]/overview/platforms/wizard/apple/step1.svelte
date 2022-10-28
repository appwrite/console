<script lang="ts">
    import { page } from '$app/stores';
    import { Alert } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormItem, FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createPlatform } from '../store';

    enum Platform {
        iOS = 'apple-ios',
        macOS = 'apple-macos',
        watchOS = 'apple-watchos',
        tvOS = 'apple-tvos'
    }

    let platform: Platform = Platform.iOS;

    const projectId = $page.params.project;

    async function beforeSubmit() {
        if ($createPlatform.$id) {
            await sdkForConsole.projects.updatePlatform(
                projectId,
                $createPlatform.$id,
                $createPlatform.name,
                undefined,
                undefined,
                $createPlatform.hostname
            );

            return;
        }

        const response = await sdkForConsole.projects.createPlatform(
            projectId,
            platform,
            $createPlatform.name,
            undefined,
            undefined,
            $createPlatform.hostname
        );

        $createPlatform.$id = response.$id;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Register your Flutter app</svelte:fragment>
    <Alert type="warning">
        Note: If you are building your Flutter application for multiple devices, you will have to
        follow this process for each different device.
    </Alert>

    <FormList isCommonSection>
        <FormItem>
            <p>Choose a platform</p>
            <div class="u-flex u-gap-16 u-margin-block-start-8">
                <Pill
                    button
                    on:click={() => (platform = Platform.iOS)}
                    selected={platform === Platform.iOS}>
                    iOS
                </Pill>
                <Pill
                    button
                    on:click={() => (platform = Platform.macOS)}
                    selected={platform === Platform.macOS}>
                    macOS
                </Pill>
                <Pill
                    button
                    on:click={() => (platform = Platform.watchOS)}
                    selected={platform === Platform.watchOS}>
                    watchOS
                </Pill>
                <Pill
                    button
                    on:click={() => (platform = Platform.tvOS)}
                    selected={platform === Platform.tvOS}>
                    tvOS
                </Pill>
            </div>
        </FormItem>
        <InputText
            id="name"
            label="Name"
            placeholder="My Apple App"
            required
            bind:value={$createPlatform.name} />
        <InputText
            id="hostname"
            label="Bundle ID"
            placeholder="com.company.appname"
            required
            bind:value={$createPlatform.hostname} />
    </FormList>
</WizardStep>
