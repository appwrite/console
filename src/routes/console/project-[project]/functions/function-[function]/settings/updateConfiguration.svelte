<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { AvatarGroup, CardGrid, Collapsible, CollapsibleItem, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { func } from '../store';
    import GitInstallationModal from '$routes/console/project-[project]/settings/GitInstallationModal.svelte';
    import GitConfigurationModal from './gitConfigurationModal.svelte';

    export let installations: Models.InstallationList;
    const functionId = $page.params.function;

    let entrypoint: string;
    let installCmd: string;
    let buildCmd: string;
    let showGit = false;

    async function updateConfiguration() {
        try {
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.execute || undefined,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: `${$func.name} git configuration has been updated successfully`
            });
            trackEvent(Submit.FunctionUpdateConfiguration);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateConfiguration);
        }
    }
</script>

<Form onSubmit={updateConfiguration}>
    <CardGrid>
        <Heading tag="h6" size="7">Configuration</Heading>
        <!-- TODO: Add description -->
        <p class="text">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam, accusantium!
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    required
                    label="Entrypoint"
                    id="Entrypoint"
                    placeholder="index.js"
                    bind:value={entrypoint} />
            </FormList>
            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Git settings</svelte:fragment>
                    {#if false}
                        test
                    {:else}
                        <article class="card-git card is-border-dashed is-no-shadow">
                            <div class="u-flex u-cross-center u-flex-vertical u-gap-32">
                                <div class="u-flex u-cross-center u-gap-8">
                                    <AvatarGroup icons={['github', 'gitlab', 'bitBucket']} />

                                    <span class="icon-arrow-narrow-right" />

                                    <div class="avatar"><span class="icon-server" /></div>
                                </div>
                                <Button
                                    secondary
                                    on:click={() => {
                                        showGit = true;
                                    }}>
                                    <span class="text">Connect Git</span>
                                </Button>
                            </div>
                        </article>
                    {/if}
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Build settings</svelte:fragment>
                    <InputText
                        label="Install command"
                        placeholder="Enter an install commad (e.g. 'npm install')"
                        id="install"
                        bind:value={installCmd} />
                    <InputText
                        label="Build command"
                        placeholder="Enter a build commad (e.g. 'npm run build')"
                        id="build"
                        bind:value={buildCmd} />
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

{#if !installations.total && showGit}
    <GitInstallationModal bind:showGitInstall={showGit} />
{:else}
    <GitConfigurationModal bind:show={showGit} {installations} />
{/if}
