<script lang="ts">
    import { page } from '$app/stores';
    import { Pill } from '$lib/elements';
    import { FormItem, FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createPlatform } from '../store';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { PlatformType } from '@appwrite.io/console';
    import { invalidateDependencies } from '../skipped.svelte';

    let platform: PlatformType = PlatformType.Appleios;

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

        await invalidateDependencies();
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Apple registration</svelte:fragment>

    <FormList isCommonSection>
        <FormItem>
            <p>Choose an Apple platform</p>
            <div class="u-flex u-gap-16 u-margin-block-start-8">
                <Pill
                    button
                    on:click={() => (platform = PlatformType.Appleios)}
                    selected={platform === PlatformType.Appleios}>
                    iOS
                </Pill>
                <Pill
                    button
                    on:click={() => (platform = PlatformType.Applemacos)}
                    selected={platform === PlatformType.Applemacos}>
                    macOS
                </Pill>
                <Pill
                    button
                    on:click={() => (platform = PlatformType.Applewatchos)}
                    selected={platform === PlatformType.Applewatchos}>
                    watchOS
                </Pill>
                <Pill
                    button
                    on:click={() => (platform = PlatformType.Appletvos)}
                    selected={platform === PlatformType.Appletvos}>
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
