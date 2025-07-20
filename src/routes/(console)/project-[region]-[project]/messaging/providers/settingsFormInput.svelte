<script lang="ts">
    import {
        InputDomain,
        InputEmail,
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
    import { Upload, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { InvalidFileType, removeFile } from '$lib/helpers/files';
    import { addNotification } from '$lib/stores/notifications';

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

    function handleInvalid(e: CustomEvent) {
        const reason = e.detail?.reason ?? '';

        if (reason === InvalidFileType.EXTENSION) {
            addNotification({
                type: 'error',
                message: 'Only .json files allowed'
            });
        } else {
            addNotification({
                type: 'error',
                message: 'Invalid file'
            });
        }
    }

    $: popover = input.popover ? PopoverContent : null;
    $: popoverProps = !input.popover
        ? {}
        : {
              lines: input.popover,
              image: input.popoverImage
          };
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
    <Upload.Dropzone
        on:invalid={handleInvalid}
        extensions={input.allowedFileExtensions}
        bind:files={files[input.name]}
        maxSize={10000000}
        required={!input.optional}>
        <Layout.Stack alignItems="center" justifyContent="center" direction="row" gap="xxs">
            <Typography.Text variant="l-500">
                Drag and drop your {input.label} here or click to upload
            </Typography.Text>
            <TooltipPopover {popover} {popoverProps} tooltip={input.tooltip} />
        </Layout.Stack>
    </Upload.Dropzone>
    {#if files[input.name]?.length}
        {#key files[input.name]}
            <Upload.List
                files={files[input.name]?.length
                    ? Array.from(files[input.name]).map((f) => {
                          return {
                              ...f,
                              name: f.name,
                              size: f.size,
                              extension: f.type,
                              removable: true
                          };
                      })
                    : []}
                on:remove={(e) => (files[input.name] = removeFile(e.detail, files[input.name]))} />
        {/key}
    {/if}
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
