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
    import { provider, providerType, providerParams } from './store';
    import PopoverContent from './popoverContent.svelte';
    import { providers } from './store';

    export let files: Record<string, FileList> = {};
    const inputs = providers[$providerType].providers[$provider].configure;
</script>

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
                    <PopoverContent lines={input.popover} {popoverImage} />
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
                    <PopoverContent lines={input.popover} {popoverImage} />
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
                    <PopoverContent lines={input.popover} {popoverImage} />
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
                    <PopoverContent lines={input.popover} {popoverImage} />
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
                    <PopoverContent lines={input.popover} {popoverImage} />
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
                    <PopoverContent lines={input.popover} {popoverImage} />
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
