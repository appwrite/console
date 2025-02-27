<script lang="ts">
    import { page } from '$app/stores';
    import { Pill } from '$lib/elements';
    import { FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { PlatformType } from '@appwrite.io/console';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { hostnameRegex } from '$lib/helpers/string';

    // enum Platform {
    //     Android = 'flutter-android',
    //     Ios = 'flutter-ios',
    //     Linux = 'flutter-linux',
    //     Macos = 'flutter-macos',
    //     Windows = 'flutter-windows',
    //     Web = 'flutter-web'
    // }

    // function isPlatform(value: string): value is Platform {
    //     return Object.values(Platform).includes(value as Platform);
    // }

    let platform: PlatformType = isValueOfStringEnum(PlatformType, $createPlatform.type)
        ? $createPlatform.type
        : PlatformType.Flutterandroid;

    const projectId = $page.params.project;
    const suggestions = ['*.vercel.app', '*.netlify.app', '*.gitpod.io'];
    const placeholder: Partial<
        Record<
            PlatformType,
            {
                name: string;
                hostname: string;
                tooltip: string;
            }
        >
    > = {
        [PlatformType.Flutterandroid]: {
            name: 'My Android App',
            hostname: 'com.company.appname',
            tooltip:
                'Your package name is generally the applicationId in your app-level build.gradle file.'
        },
        [PlatformType.Flutterios]: {
            name: 'My iOS App',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        },
        [PlatformType.Flutterlinux]: {
            name: 'My Linux App',
            hostname: 'appname',
            tooltip: 'Your application name'
        },
        [PlatformType.Fluttermacos]: {
            name: 'My mac OS App',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        },
        [PlatformType.Flutterweb]: {
            name: 'My Web App',
            hostname: 'localhost',
            tooltip:
                'The hostname that your website will use to interact with the Appwrite APIs in production or development environments. No protocol or port number required.'
        },
        [PlatformType.Flutterwindows]: {
            name: 'My Windows App',
            hostname: 'appname',
            tooltip: 'Your application name'
        }
    };

    const hostname: Partial<Record<PlatformType, string>> = {
        [PlatformType.Flutterandroid]: 'Package Name',
        [PlatformType.Flutterios]: 'Bundle ID',
        [PlatformType.Flutterlinux]: 'Package Name',
        [PlatformType.Fluttermacos]: 'Bundle ID',
        [PlatformType.Flutterweb]: 'Hostname',
        [PlatformType.Flutterwindows]: 'Package Name'
    };

    async function beforeSubmit() {
        if ($createPlatform.$id) {
            await sdk.forConsole.projects.deletePlatform(projectId, $createPlatform.$id);
        }

        const response = await sdk.forConsole.projects.createPlatform(
            projectId,
            platform,
            $createPlatform.name,
            platform !== PlatformType.Flutterweb ? $createPlatform.key : undefined,
            undefined,
            platform === PlatformType.Flutterweb ? $createPlatform.hostname : undefined
        );

        trackEvent(Submit.PlatformCreate, {
            type: platform
        });

        $createPlatform.$id = response.$id;
        $createPlatform.type = platform;
    }

    $: registee = {
        [PlatformType.Flutterandroid]: 'Package name',
        [PlatformType.Flutterios]: 'Bundle ID',
        [PlatformType.Flutterlinux]: 'Package name',
        [PlatformType.Fluttermacos]: 'Bundle ID',
        [PlatformType.Flutterwindows]: 'Package name',
        [PlatformType.Flutterweb]: 'Hostname'
    }[platform];
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">{registee} registration</svelte:fragment>
    <svelte:fragment slot="subtitle">
        <div class="u-flex u-gap-16 u-margin-block-start-8 u-flex-wrap">
            <Pill
                button
                on:click={() => (platform = PlatformType.Flutterandroid)}
                selected={platform === PlatformType.Flutterandroid}>
                Android
            </Pill>
            <Pill
                button
                on:click={() => (platform = PlatformType.Flutterios)}
                selected={platform === PlatformType.Flutterios}>
                iOS
            </Pill>
            <Pill
                button
                on:click={() => (platform = PlatformType.Flutterlinux)}
                selected={platform === PlatformType.Flutterlinux}>
                Linux
            </Pill>
            <Pill
                button
                on:click={() => (platform = PlatformType.Fluttermacos)}
                selected={platform === PlatformType.Fluttermacos}>
                macOS
            </Pill>
            <Pill
                button
                on:click={() => (platform = PlatformType.Flutterwindows)}
                selected={platform === PlatformType.Flutterwindows}>
                Windows
            </Pill>
            <Pill
                button
                on:click={() => (platform = PlatformType.Flutterweb)}
                selected={platform === PlatformType.Flutterweb}>
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
        {#if platform === PlatformType.Flutterweb}
            <div>
                <InputText
                    id="hostname"
                    label={hostname[platform]}
                    placeholder={placeholder[platform].hostname}
                    tooltip={placeholder[platform].tooltip}
                    required
                    pattern={hostnameRegex}
                    patternError="Please enter a valid hostname"
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
