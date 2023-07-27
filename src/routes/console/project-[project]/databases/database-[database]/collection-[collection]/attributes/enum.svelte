<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

    export async function submitEnum(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeEnum>
    ) {
        await sdk.forProject.databases.createEnumAttribute(
            databaseId,
            collectionId,
            key,
            data.elements,
            data.required,
            data.default,
            data.array
        );
    }

    export async function updateEnum(
        databaseId: string,
        collectionId: string,
        data: Partial<Models.AttributeEnum>
    ) {
        await sdk.forProject.databases.updateEnumAttribute(
            databaseId,
            collectionId,
            data.key,
            data.elements,
            data.required,
            data.default
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputSelect, InputTags } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeEnum>;

    $: if (data.required || data.array) {
        data.default = null;
    }

    $: options = [
        ...(data?.elements ?? []).map((element) => {
            return {
                label: element,
                value: element
            };
        }),
        !data.required &&
            !data.array && {
                label: 'NULL',
                value: null
            }
    ].filter(Boolean);
</script>

<InputTags
    id="elements"
    label={$LL.console.project.forms.databases.attribute.inputs.elements.label()}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.elements.placeholder()}
    bind:tags={data.elements}
    required />
<InputSelect
    id="default"
    label={$LL.console.project.forms.databases.attribute.inputs.default.label()}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.default.placeholder()}
    disabled={data.array || data.required}
    {options}
    bind:value={data.default} />
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
