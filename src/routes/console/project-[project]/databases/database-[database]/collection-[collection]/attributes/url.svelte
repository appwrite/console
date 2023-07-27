<script context="module" lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import LL from '$i18n/i18n-svelte';

    export async function submitUrl(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeUrl>
    ) {
        await sdk.forProject.databases.createUrlAttribute(
            databaseId,
            collectionId,
            key,
            data.required,
            data.default,
            data.array
        );
    }

    export async function updateUrl(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeUrl>
    ) {
        await sdk.forProject.databases.updateUrlAttribute(
            databaseId,
            collectionId,
            data.key,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputURL } from '$lib/elements/forms';

    export let data: Partial<Models.AttributeUrl>;
    export let editing = false;

    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

<InputURL
    id="default"
    label={$LL.console.project.forms.databases.attribute.inputs.defaultValue.label()}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.defaultValue.placeholder()}
    bind:value={data.default}
    disabled={data.required || data.array}
    nullable={!data.required && !data.array} />

<InputChoice
    id="required"
    label={$LL.console.project.forms.databases.attribute.inputs.required.label()}
    bind:value={data.required}
    disabled={data.array}>
    {$LL.console.project.forms.databases.attribute.texts.phraseOne()}
</InputChoice>

<InputChoice
    id="array"
    label={$LL.console.project.forms.databases.attribute.inputs.array.label()}
    bind:value={data.array}
    disabled={data.required || editing}>
    {$LL.console.project.forms.databases.attribute.texts.phraseTwo()}
</InputChoice>
