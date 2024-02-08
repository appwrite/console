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
    <svelte:fragment slot="title">Configure</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set up the credentials below to enable {providers[$providerType].providers[$provider].title}
        for sending
        {providers[$providerType].text}.
    </svelte:fragment>
    <FormList>
        {#each inputs as input}
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
                    </svelte:fragment>
                </InputText>
            {:else if input.type === 'password'}
                <InputPassword
                    id={input.name}
                    label={input.label}
                    placeholder={input.placeholder}
                    showPasswordButton
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
                    bind:files={files[input.name]}>
                    <svelte:fragment slot="popover">
                        <p class="body-text-2 u-margin-block-end-16">
                            {@html input.popover?.join('<br/><br/>')}
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

    <p class="body-text-2 u-bold u-margin-block-start-48">Need a hand?</p>

    <div
        class="u-flex u-cross-center u-main-space-between u-padding-block-16"
        style="border-block-end: solid .0625rem hsl(var(--color-border))">
        <div class="u-flex u-cross-center u-gap-16">
            <div class="avatar is-size-small">
                <span class="icon-book-open" style:--p-text-size="1.25rem" aria-hidden="true" />
            </div>
            Read the full guide in the documentation
        </div>
        <span class="icon-arrow-right" aria-hidden="true" />
    </div>

    <div class="u-flex u-cross-center u-main-space-between u-padding-block-16">
        <div class="u-flex u-cross-center u-gap-16">
            <div class="avatar is-size-small">
                <span class="icon-user-group" style:--p-text-size="1.25rem" aria-hidden="true" />
            </div>
            Invite a team member to complete this step
        </div>
        <span class="icon-arrow-right" aria-hidden="true" />
    </div>
</WizardStep>
