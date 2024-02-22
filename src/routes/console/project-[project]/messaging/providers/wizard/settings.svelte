<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { providers } from '../store';
    import { providerType, provider, providerParams } from './store';
    import SettingsFormList from '../settingsFormList.svelte';
    import { Table, TableBody, TableCell, TableRowButton, TableRowLink } from '$lib/elements/table';
    import { newMemberModal } from '$lib/stores/organization';
    import CreateMember from '$routes/console/organization-[organization]/createMember.svelte';
    import Collapsible from '$lib/components/collapsible.svelte';
    import CollapsibleItem from '$lib/components/collapsibleItem.svelte';
    import Provider from '../../provider.svelte';
    import { MessagingProviderType } from '@appwrite.io/console';
    import ProviderTypeComponent from '$routes/console/project-[project]/messaging/providerType.svelte';

    let files: Record<string, FileList> = {};
    const inputs = providers[$providerType].providers[$provider].configure;

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
    <svelte:fragment slot="title">Settings</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set up the credentials below to enable {providers[$providerType].providers[$provider].title}
        for sending
        {providers[$providerType].text}.
    </svelte:fragment>

    <SettingsFormList bind:files {inputs} bind:params={$providerParams[$provider]} />

    <div class="need-a-hand u-flex-vertical u-gap-8">
        <p class="body-text-2 u-bold u-margin-block-start-48">Need a hand?</p>

        {#if providers[$providerType].providers[$provider].needAHand}
            {@const needAHand = providers[$providerType].providers[$provider].needAHand}
            <div class="box u-padding-inline-8 u-padding-0 u-border-width-0">
                <Collapsible>
                    <CollapsibleItem withIndentation>
                        <svelte:fragment slot="beforetitle">
                            <div class="u-flex u-cross-center u-gap-16">
                                <div class="avatar is-size-small">
                                    <span
                                        class="icon-info"
                                        style:--p-text-size="1.25rem"
                                        aria-hidden="true" />
                                </div>
                                <span class="body-text-2 u-small u-bold"
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
        {/if}

        <Table noMargin noStyles>
            <TableBody>
                <TableRowLink href={`https://appwrite.io/docs/messaging/${$provider}`}>
                    <TableCell>
                        <div class="u-flex u-cross-center u-main-space-between u-padding-8">
                            <div class="u-flex u-cross-center u-gap-16">
                                <div class="avatar is-size-small">
                                    <span
                                        class="icon-book-open"
                                        style:--p-text-size="1.25rem"
                                        aria-hidden="true" />
                                </div>
                                Read the full guide in the documentation
                            </div>
                            <span class="icon-arrow-right" aria-hidden="true" />
                        </div>
                    </TableCell>
                </TableRowLink>
                <TableRowButton on:click={() => ($newMemberModal = true)}>
                    <TableCell>
                        <div class="u-flex u-cross-center u-main-space-between u-padding-8">
                            <div class="u-flex u-cross-center u-gap-16">
                                <div class="avatar is-size-small">
                                    <span
                                        class="icon-user-group"
                                        style:--p-text-size="1.25rem"
                                        aria-hidden="true" />
                                </div>
                                Invite a team member to complete this step
                            </div>
                            <span class="icon-arrow-right" aria-hidden="true" />
                        </div>
                    </TableCell>
                </TableRowButton>
            </TableBody>
        </Table>
    </div>
</WizardStep>

<CreateMember bind:showCreate={$newMemberModal} />

<style lang="scss">
    .need-a-hand :global(.table-row):last-child:last-child {
        border-block-end: none;
    }
</style>
