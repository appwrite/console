<script lang="ts">
    import { page } from '$app/stores';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
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
        Android = 'flutter-android',
        Ios = 'flutter-ios',
        Linux = 'flutter-linux',
        Macos = 'flutter-macos',
        Windows = 'flutter-windows',
        Web = 'flutter-web'
    }

    function isPlatform(value: string): value is Platform {
        return Object.values(Platform).includes(value as Platform);
    }

    let platform: Platform = isPlatform($createPlatform.type)
        ? $createPlatform.type
        : Platform.Android;

    const projectId = $page.params.project;
    const suggestions = ['*.vercel.app', '*.netlify.app', '*.gitpod.io'];
    const placeholder: Record<
        Platform,
        {
            name: string;
            hostname: string;
            tooltip: string;
        }
    > = {
        [Platform.Android]: {
            name: 'My Android App',
            hostname: 'com.company.appname',
            tooltip:
                'Your package name is generally the applicationId in your app-level build.gradle file.'
        },
        [Platform.Ios]: {
            name: 'My iOS App',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        },
        [Platform.Linux]: {
            name: 'My Linux App',
            hostname: 'appname',
            tooltip: 'Your application name'
        },
        [Platform.Macos]: {
            name: 'My mac OS App',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        },
        [Platform.Web]: {
            name: 'My Web App',
            hostname: 'com.company.appname',
            tooltip:
                'The hostname that your website will use to interact with the Appwrite APIs in production or development environments. No protocol or port number required.'
        },
        [Platform.Windows]: {
            name: 'My Windows App',
            hostname: 'appname',
            tooltip: 'Your application name'
        }
    };

    const hostname: Record<Platform, string> = {
        [Platform.Android]: 'Package Name',
        [Platform.Ios]: 'Bundle ID',
        [Platform.Linux]: 'Package Name',
        [Platform.Macos]: 'Bundle ID',
        [Platform.Web]: 'Hostname',
        [Platform.Windows]: 'Package Name'
    };

    async function beforeSubmit() {
        if ($createPlatform.$id) {
            await sdk.forConsole.projects.deletePlatform(projectId, $createPlatform.$id);
        }

        const response = await sdk.forConsole.projects.createPlatform(
            projectId,
            platform,
            $createPlatform.name,
            platform !== Platform.Web ? $createPlatform.key : undefined,
            undefined,
            platform === Platform.Web ? $createPlatform.hostname : undefined
        );

        trackEvent(Submit.PlatformCreate, {
            type: platform
        });

        $createPlatform.$id = response.$id;
        $createPlatform.type = platform;
    }

    $: registee = {
        [Platform.Android]: 'package name',
        [Platform.Ios]: 'bundle ID',
        [Platform.Linux]: 'package name',
        [Platform.Macos]: 'bundle ID',
        [Platform.Windows]: 'package name',
        [Platform.Web]: 'hostname'
    }[platform];
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Register your {registee}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        <div class="u-flex u-gap-16 u-margin-block-start-8 u-flex-wrap">
            <Pill
                button
                on:click={() => (platform = Platform.Android)}
                selected={platform === Platform.Android}>
                Android
            </Pill>
            <Pill
                button
                on:click={() => (platform = Platform.Ios)}
                selected={platform === Platform.Ios}>
                iOS
            </Pill>
            <Pill
                button
                on:click={() => (platform = Platform.Linux)}
                selected={platform === Platform.Linux}>
                Linux
            </Pill>
            <Pill
                button
                on:click={() => (platform = Platform.Macos)}
                selected={platform === Platform.Macos}>
                macOS
            </Pill>
            <Pill
                button
                on:click={() => (platform = Platform.Windows)}
                selected={platform === Platform.Windows}>
                Windows
            </Pill>
            <Pill
                button
                on:click={() => (platform = Platform.Web)}
                selected={platform === Platform.Web}>
                Web
            </Pill>
        </div>
    </svelte:fragment>

    <FormList isCommonSection>
        <InputText
            id="name"
            label="Name"
            placeholder={placeholder[platform].name}
            required
            bind:value={$createPlatform.name} />
        {#if platform === Platform.Web}
            <div>
                <InputText
                    id="hostname"
                    label={hostname[platform]}
                    placeholder={placeholder[platform].hostname}
                    tooltip={placeholder[platform].tooltip}
                    required
                    bind:value={$createPlatform.hostname} />

                <div class="u-flex u-gap-16 u-margin-block-start-8">
                    {#each suggestions as suggestion}
                        <Pill
                            button
                            selected={$createPlatform.hostname === suggestion}
                            on:click={() => ($createPlatform.hostname = suggestion)}>
                            {suggestion}
                        </Pill>
                    {/each}
                </div>
            </div>
        {:else}
            <InputText
                id="key"
                label={hostname[platform]}
                placeholder={placeholder[platform].hostname}
                tooltip={placeholder[platform].tooltip}
                required
                bind:value={$createPlatform.key} />
        {/if}
    </FormList>
</WizardStep>
