<script lang="ts">
    import { page } from '$app/stores';
    import { Pill } from '$lib/elements';
    import { FormItem, FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import { app } from '$lib/stores/app';
    import Light from './light.svg';
    import Dark from './dark.svg';
    import { trackEvent } from '$lib/actions/analytics';

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;

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
                $createPlatform.key,
                $createPlatform.store,
                $createPlatform.hostname
            );

            return;
        }

        const response = await sdkForConsole.projects.createPlatform(
            projectId,
            platform,
            $createPlatform.name,
            $createPlatform.key,
            undefined,
            undefined
        );

        trackEvent('submit_platform_create', {
            type: platform
        });

        $createPlatform.$id = response.$id;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Register your Apple app</svelte:fragment>

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
            tooltip="You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
            required
            bind:value={$createPlatform.key} />
    </FormList>
</WizardStep>
