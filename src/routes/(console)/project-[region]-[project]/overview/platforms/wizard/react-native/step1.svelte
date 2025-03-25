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
    import { invalidateDependencies } from '../skipped.svelte';

    let platform: PlatformType = isValueOfStringEnum(PlatformType, $createPlatform.type)
        ? $createPlatform.type
        : PlatformType.Reactnativeandroid;

    const projectId = $page.params.project;
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
        [PlatformType.Reactnativeandroid]: {
            name: 'My Android App',
            hostname: 'com.company.appname',
            tooltip:
                'Your package name is generally the applicationId in your app-level build.gradle file.'
        },
        [PlatformType.Reactnativeios]: {
            name: 'My iOS App',
            hostname: 'com.company.appname',
            tooltip:
                "You can find your Bundle Identifier in the General tab for your app's primary target in Xcode."
        }
    };

    const hostname: Partial<Record<PlatformType, string>> = {
        [PlatformType.Reactnativeandroid]: 'Package Name',
        [PlatformType.Reactnativeios]: 'Bundle ID'
    };

    async function beforeSubmit() {
        if ($createPlatform.$id) {
            await sdk.forConsole.projects.deletePlatform(projectId, $createPlatform.$id);
        }

        const response = await sdk.forConsole.projects.createPlatform(
            projectId,
            platform,
            $createPlatform.name,
            $createPlatform.key
        );

        trackEvent(Submit.PlatformCreate, {
            type: platform
        });

        $createPlatform.$id = response.$id;
        $createPlatform.type = platform;

        await invalidateDependencies();
    }

    $: registee = {
        [PlatformType.Reactnativeandroid]: 'Package name',
        [PlatformType.Reactnativeios]: 'Bundle ID'
    }[platform];
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">{registee} registration</svelte:fragment>
    <svelte:fragment slot="subtitle">
        <div class="u-flex u-gap-16 u-margin-block-start-8 u-flex-wrap">
            <Pill
                button
                on:click={() => (platform = PlatformType.Reactnativeandroid)}
                selected={platform === PlatformType.Reactnativeandroid}>
                Android
            </Pill>
            <Pill
                button
                on:click={() => (platform = PlatformType.Reactnativeios)}
                selected={platform === PlatformType.Reactnativeios}>
                iOS
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
        <InputText
            id="key"
            label={hostname[platform]}
            placeholder={placeholder[platform].hostname}
            tooltip={placeholder[platform].tooltip}
            required
            bind:value={$createPlatform.key} />
    </FormList>
</WizardStep>
