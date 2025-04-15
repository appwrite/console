<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { providers } from '../store';
    import { providerType, provider, providerParams } from './store';
    import SettingsFormList from '../settingsFormList.svelte';
    import { newMemberModal } from '$lib/stores/organization';
    import CreateMember from '$routes/(console)/organization-[organization]/createMember.svelte';
    import Provider from '../../provider.svelte';
    import { MessagingProviderType } from '@appwrite.io/console';
    import ProviderTypeComponent from '$routes/(console)/project-[region]-[project]/messaging/providerType.svelte';
    import {
        Collapsible,
        CollapsibleItem,
        ClickableList,
        ClickableListItem
    } from '$lib/components';

    let files: Record<string, FileList> = {};
    const inputs = providers[$providerType].providers[$provider].configure;
    let open = false;

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
            if (input.type === 'file' && $providerParams[$provider][input.name].length > 0) {
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
    <svelte:fragment slot="title">Settings</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set up the credentials below to enable {providers[$providerType].providers[$provider].title}
        for sending
        {providers[$providerType].text}.
    </svelte:fragment>

    <SettingsFormList bind:files {inputs} bind:params={$providerParams[$provider]} />

    <div class="need-a-hand u-flex-vertical u-gap-8">
        <p class="body-text-2 u-bold u-margin-block-start-48">Need a hand?</p>

        <div>
            {#if providers[$providerType].providers[$provider].needAHand}
                {@const needAHand = providers[$providerType].providers[$provider].needAHand}
                <div
                    class="how-to-enable u-padding-inline-8 u-padding-0"
                    style={!open ? '' : 'background-color: hsl(var(--p-bg-color-hover));'}>
                    <Collapsible>
                        <CollapsibleItem withIndentation bind:open>
                            <svelte:fragment slot="beforetitle">
                                <div class="u-flex u-cross-center u-gap-16">
                                    <div class="avatar is-size-small">
                                        <span
                                            class="icon-info"
                                            style:--p-text-size="1.25rem"
                                            aria-hidden="true" />
                                    </div>
                                    <span class="title body-text-2 u-small" class:u-bold={open}
                                        >How to enable <Provider provider={$provider} noIcon />
                                        {#if $providerType == MessagingProviderType.Push}notifications{:else}<ProviderTypeComponent
                                                type={$providerType}
                                                noIcon />{/if} service?</span>
                                </div>
                            </svelte:fragment>
                            <div class="u-flex-vertical u-gap-16">
                                {#each needAHand as p}
                                    <p>
                                        {@html p}
                                    </p>
                                {/each}
                            </div>
                        </CollapsibleItem>
                    </Collapsible>
                </div>
                <div class="u-margin-block-start-4 u-sep-block-end" />
            {/if}

            <ClickableList>
                <ClickableListItem
                    href={`https://appwrite.io/docs/products/messaging/${$provider}`}
                    external>
                    <div class="u-flex u-cross-center u-main-space-between">
                        <div class="u-flex u-cross-center u-gap-16">
                            <div class="avatar is-size-small">
                                <span
                                    class="icon-book-open"
                                    style:--p-text-size="1.25rem"
                                    aria-hidden="true" />
                            </div>
                            <p>Read the full guide in the documentation</p>
                        </div>
                        <span class="icon-arrow-sm-right u-font-size-20" aria-hidden="true" />
                    </div>
                </ClickableListItem>
                <ClickableListItem on:click={() => ($newMemberModal = true)}>
                    <div class="u-flex u-cross-center u-main-space-between">
                        <div class="u-flex u-cross-center u-gap-16">
                            <div class="avatar is-size-small">
                                <span
                                    class="icon-user-group"
                                    style:--p-text-size="1.25rem"
                                    aria-hidden="true" />
                            </div>
                            <p>Invite a team member to complete this step</p>
                        </div>
                        <span class="icon-arrow-sm-right u-font-size-20" aria-hidden="true" />
                    </div>
                </ClickableListItem>
            </ClickableList>
        </div>
    </div>
</WizardStep>

<CreateMember bind:showCreate={$newMemberModal} />

<style lang="scss">
    .need-a-hand {
        --p-bg-color-hover: var(--color-neutral-5);
        .how-to-enable {
            border-radius: var(--border-radius-small);

            &:hover,
            &:focus {
                background-color: hsl(var(--p-bg-color-hover));

                .title {
                    font-weight: 600;
                }
            }
        }

        :global(.clickable-list) {
            --color-border: var(--color-neutral-5);
            --p-clickable-button-bg-color-hover: var(--color-border);

            :global(.theme-dark) & {
                --color-border: var(--color-neutral-85);
            }
        }

        :global(.clickable-list-button) {
            padding-inline: 0.5rem;
        }

        :global(.theme-dark) & {
            --p-bg-color-hover: var(--color-neutral-85);
        }
    }

    :global(.clickable-list-button):hover p,
    :global(.clickable-list-button):focus p {
        font-weight: 600;
    }
</style>
