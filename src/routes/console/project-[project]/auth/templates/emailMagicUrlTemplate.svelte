<script lang="ts">
    import { afterUpdate } from 'svelte';
    import EmailTemplate from './emailTemplate.svelte';
    import LocaleOptions from './localeOptions.svelte';
    import type { Models } from '@appwrite.io/console';

    let locale = 'en-us';
    export let localeCodes: Models.LocaleCode[];
    export let loadEmailTemplate: (type: string, locale: string) => Promise<void> | void;
    export let saveEmailTemplate: (type: string, data: any) => Promise<void> | void;

    export let template: Models.EmailTemplate;

    afterUpdate(() => {
        template = template;
    });

    function onLocaleChange() {
        loadEmailTemplate('magicSession', locale);
    }
</script>

<div class="box">
    <LocaleOptions {localeCodes} on:select={onLocaleChange} bind:value={locale} />
    <EmailTemplate
        senderName={template?.senderName}
        senderEmail={template?.senderEmail}
        subject={template?.subject}
        message={template?.message}
        onSubmit={(data) => saveEmailTemplate('magicSession', { ...data, locale })} />
</div>
