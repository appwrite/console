<script lang="ts">
    import { page } from '$app/stores';
    import { Alert } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import { app } from '$lib/stores/app';
    import Light from './light.svg';
    import Dark from './dark.svg';

    $wizard.media = $app.themeInUse === 'dark' ? Dark : Light;

    enum Platform {
        Android = 'flutter-android',
        Ios = 'flutter-ios',
        Linux = 'flutter-linux',
        Macos = 'flutter-macos',
        Windows = 'flutter-windows',
        Web = 'flutter-web'
    }

    let platform: Platform = Platform.Android;

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
            platform !== Platform.Web ? $createPlatform.key : undefined,
            undefined,
            platform === Platform.Web ? $createPlatform.hostname : undefined
        );

        $createPlatform.$id = response.$id;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Register your Flutter app</svelte:fragment>
    <svelte:fragment slot="subtitle">
        <div class="u-flex u-gap-16 u-margin-block-start-8">
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
    <Alert type="warning">
        Note: If you are building your Flutter application for multiple devices, you will have to
        follow this process for each different device.
    </Alert>

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
