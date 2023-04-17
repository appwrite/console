<script lang="ts">
    import { afterUpdate } from 'svelte';
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import Box from '$lib/components/box.svelte';

    let locale = 'en-us';
    export let localeCodes: any[];
    export let loadEmailTemplate: (type: string, locale: string) => Promise<void> | void;
    export let saveEmailTemplate: (type: string, data: any) => Promise<void> | void;

    export let template: {
        senderName: string;
        senderEmail: string;
        locale: string;
        subject: string;
        message: string;
    };

    afterUpdate(() => {
        template = template;
    });

    function onLocaleChange() {
        loadEmailTemplate('magicSession', locale);
    }
</script>

<Box>
    <LocaleOptions {localeCodes} on:change={onLocaleChange} bind:value={locale} />
    <EmailTemplate
        senderName={template?.senderName}
        senderEmail={template?.senderEmail}
        subject={template?.subject}
        message={template?.message}
        onSubmit={(data) => saveEmailTemplate('magicSession', { ...data, locale })} />
</Box>
