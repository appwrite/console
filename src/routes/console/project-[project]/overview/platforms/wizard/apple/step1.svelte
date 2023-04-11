<script lang="ts">
    import { page } from '$app/stores';
    import { Pill } from '$lib/elements';
    import { FormItem, FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import { app } from '$lib/stores/app';
    import Light from './light.svg';
    import Dark from './dark.svg';
    import { Submit, trackEvent } from '$lib/actions/analytics';

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
            await sdk.forConsole.projects.deletePlatform(projectId, $createPlatform.$id);
        }

        const response = await sdk.forConsole.projects.createPlatform(
            projectId,
            platform,
            $createPlatform.name,
            $createPlatform.key,
            undefined,
            undefined
        );

        trackEvent(Submit.PlatformCreate, {
            type: platform
        });

        $createPlatform.$id = response.$id;
        $createPlatform.type = platform;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Register your Apple app</svelte:fragment>

    <FormList isCommonSection>
        <FormItem>
            <p>Choose a device</p>
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
