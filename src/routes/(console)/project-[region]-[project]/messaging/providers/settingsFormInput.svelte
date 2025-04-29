<script lang="ts">
    import {
        InputDomain,
        InputEmail,
        InputFile,
        InputSelect,
        InputPhone,
        InputSwitch,
        InputText,
        InputPassword
    } from '$lib/elements/forms';
    import InputCheckbox from '$lib/elements/forms/inputCheckbox.svelte';
    import PopoverContent from './popoverContent.svelte';
    import type {
        ProviderInput,
        TwilioProviderParams,
        Msg91ProviderParams,
        TelesignProviderParams,
        TextmagicProviderParams,
        VonageProviderParams,
        MailgunProviderParams,
        SendgridProviderParams,
        SMTPProviderParams,
        FCMProviderParams,
        APNSProviderParams
    } from './store';
    import TooltipPopover from './tooltipPopover.svelte';

    export let files: Record<string, FileList>;
    export let input: ProviderInput;
    export let params: Partial<
        | TwilioProviderParams
        | Msg91ProviderParams
        | TelesignProviderParams
        | TextmagicProviderParams
        | VonageProviderParams
        | MailgunProviderParams
        | SendgridProviderParams
        | SMTPProviderParams
        | FCMProviderParams
        | APNSProviderParams
    >;
    const popover = input.popover ? PopoverContent : null;
    const popoverProps = getPopoverProps(input);

    function getPopoverProps(input: ProviderInput) {
        if (!input.popover) {
            return {};
        }
        return {
            lines: input.popover,
            image: input.popoverImage
        };
    }
</script>

{#if input.type === 'text'}
    <InputText
        id={input.name}
        label={input.label}
        placeholder={input.placeholder}
        required={!input.optional}
        bind:value={params[input.name]}>
        <TooltipPopover slot="info" {popover} {popoverProps} tooltip={input.tooltip} />
    </InputText>
{:else if input.type === 'password'}
    <InputPassword
        id={input.name}
        label={input.label}
        placeholder={input.placeholder}
        required={!input.optional}
        bind:value={params[input.name]}>
        <TooltipPopover slot="info" {popover} {popoverProps} tooltip={input.tooltip} />
    </InputPassword>
{:else if input.type === 'email'}
    <InputEmail
        id={input.name}
        label={input.label}
        placeholder={input.placeholder}
        required={!input.optional}
        bind:value={params[input.name]}>
        <TooltipPopover slot="info" {popover} {popoverProps} tooltip={input.tooltip} />
    </InputEmail>
{:else if input.type === 'domain'}
    <InputDomain
        id={input.name}
        label={input.label}
        placeholder={input.placeholder}
        required={!input.optional}
        bind:value={params[input.name]}>
        <TooltipPopover slot="info" {popover} {popoverProps} tooltip={input.tooltip} />
    </InputDomain>
{:else if input.type === 'phone'}
    <InputPhone
        id={input.name}
        label={input.label}
        placeholder={input.placeholder}
        required={!input.optional}
        bind:value={params[input.name]}>
        <TooltipPopover slot="info" {popover} {popoverProps} tooltip={input.tooltip} />
    </InputPhone>
{:else if input.type === 'file'}
    <InputFile
        label={input.label}
        allowedFileExtensions={input.allowedFileExtensions}
        required={!input.optional}
        tooltip={input.tooltip}
        {popover}
        {popoverProps}
        bind:files={files[input.name]} />
{:else if input.type === 'switch'}
    <InputSwitch label={input.label} id={input.name} bind:value={params[input.name]}>
        <svelte:fragment slot="description">
            <p>{@html input.description}</p>
        </svelte:fragment>
    </InputSwitch>
{:else if input.type === 'checkbox'}
    <InputCheckbox label={input.label} id={input.name} bind:checked={params[input.name]}>
        <svelte:fragment slot="description">
            {input.description}
        </svelte:fragment>
    </InputCheckbox>
{:else if input.type === 'select'}
    <InputSelect
        label={input.label}
        id={input.name}
        options={input.options}
        required={!input.optional}
        bind:value={params[input.name]} />
{/if}
