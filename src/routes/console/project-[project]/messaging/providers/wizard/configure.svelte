<script lang="ts">
    import {
        FormList,
        InputDomain,
        InputEmail,
        InputFile,
        InputSelect,
        InputSwitch,
        InputText,
        InputPassword
    } from '$lib/elements/forms';
    import InputPhone from '$lib/elements/forms/inputPhone.svelte';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { providers } from '../store';
    import { providerType, provider, providerParams } from './store';
    import { ImagePreview } from '$lib/components';
    import { newMemberModal } from '$lib/stores/organization';
    import CreateMember from '$routes/console/organization-[organization]/createMember.svelte';
    import Provider from '../../provider.svelte';
    import { MessagingProviderType } from '@appwrite.io/console';
    import ProviderTypeComponent from '$routes/console/project-[project]/messaging/providerType.svelte';
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
        for (const input of inputs) {
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
    <svelte:fragment slot="title">Configure</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set up the credentials below to enable {providers[$providerType].providers[$provider].title}
        for sending
        {providers[$providerType].text}.
    </svelte:fragment>
    <FormList>
        {#each inputs as input}
            {@const popoverImage = input.popoverImage}
            {#if input.type === 'text'}
                <InputText
                    id={input.name}
                    label={input.label}
                    placeholder={input.placeholder}
                    required={!input.optional}
                    isPopoverDefined={input.popover !== undefined}
                    bind:value={$providerParams[$provider][input.name]}>
                    <svelte:fragment slot="popover">
                        {@html input.popover?.join('<br/><br/>')}
                        {#if popoverImage}
                            <br />
                            <br />
                            <ImagePreview
                                darkSrc={popoverImage.src.dark}
                                lightSrc={popoverImage.src.light}
                                alt={popoverImage.alt} />
                        {/if}
                    </svelte:fragment>
                </InputText>
            {:else if input.type === 'password'}
                <InputPassword
                    id={input.name}
                    label={input.label}
                    placeholder={input.placeholder}
                    required={!input.optional}
                    showPasswordButton
                    isPopoverDefined={input.popover !== undefined}
                    bind:value={$providerParams[$provider][input.name]}>
                    <svelte:fragment slot="popover">
                        {@html input.popover?.join('<br/><br/>')}
                    </svelte:fragment>
                </InputPassword>
            {:else if input.type === 'email'}
                <InputEmail
                    id={input.name}
                    label={input.label}
                    placeholder={input.placeholder}
                    required={!input.optional}
                    isPopoverDefined={input.popover !== undefined}
                    bind:value={$providerParams[$provider][input.name]}>
                    <svelte:fragment slot="popover">
                        <p class="body-text-2 u-margin-block-end-16">
                            {@html input.popover?.join('<br/><br/>')}
                        </p>
                    </svelte:fragment>
                </InputEmail>
            {:else if input.type === 'domain'}
                <InputDomain
                    id={input.name}
                    label={input.label}
                    placeholder={input.placeholder}
                    required={!input.optional}
                    isPopoverDefined={input.popover !== undefined}
                    bind:value={$providerParams[$provider][input.name]}>
                    <svelte:fragment slot="popover">
                        <p class="body-text-2 u-margin-block-end-16">
                            {@html input.popover?.join('<br/><br/>')}
                        </p>
                    </svelte:fragment>
                </InputDomain>
            {:else if input.type === 'phone'}
                <InputPhone
                    id={input.name}
                    label={input.label}
                    placeholder={input.placeholder}
                    required={!input.optional}
                    isPopoverDefined={input.popover !== undefined}
                    bind:value={$providerParams[$provider][input.name]}>
                    <svelte:fragment slot="popover">
                        <p class="body-text-2 u-margin-block-end-16">
                            {@html input.popover?.join('<br/><br/>')}
                        </p>
                    </svelte:fragment>
                </InputPhone>
            {:else if input.type === 'file'}
                <InputFile
                    label={input.label}
                    allowedFileExtensions={input.allowedFileExtensions}
                    required={!input.optional}
                    isPopoverDefined={input.popover !== undefined}
                    bind:files={files[input.name]}>
                    <svelte:fragment slot="popover">
                        <p class="body-text-2 u-margin-block-end-16">
                            {@html input.popover?.join('<br/><br/>')}
                            {#if popoverImage}
                                <br />
                                <br />
                                <ImagePreview
                                    darkSrc={popoverImage.src.dark}
                                    lightSrc={popoverImage.src.light}
                                    alt={popoverImage.alt} />
                            {/if}
                        </p>
                    </svelte:fragment>
                </InputFile>
            {:else if input.type === 'switch'}
                <InputSwitch
                    label={input.label}
                    id={input.name}
                    bind:value={$providerParams[$provider][input.name]}>
                    <svelte:fragment slot="description">
                        {input.description}
                    </svelte:fragment>
                </InputSwitch>
            {:else if input.type === 'select'}
                <InputSelect
                    label={input.label}
                    id={input.name}
                    options={input.options}
                    required={!input.optional}
                    bind:value={$providerParams[$provider][input.name]} />
            {/if}
        {/each}
    </FormList>

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
                    href={`https://appwrite.io/docs/messaging/${$provider}`}
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
        --p-bg-color-hover: var(--color-neutral-10);
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
            --color-border: var(--color-neutral-10);

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
