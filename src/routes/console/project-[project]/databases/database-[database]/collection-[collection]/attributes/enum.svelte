<script context="module" lang="ts">
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export async function submitEnum(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeEnum>
    ) {
        const args = getIfNonNullableObject({ ...data });
        if (!args) return;
        await sdkForProject.databases.createEnumAttribute(
            databaseId,
            collectionId,
            key,
            args.elements,
            args.required,
            data.default ? data.default : undefined,
            data.array
        );
    }
</script>

<script lang="ts">
    import { InputChoice, InputSelect, InputTags } from '$lib/elements/forms';
    import { getIfNonNullableObject } from '$lib/helpers/type';

    export let selectedAttribute: Models.AttributeEnum;
    export let data: Partial<Models.AttributeEnum>;

    $: options =
        data.elements?.map((e) => ({
            value: e,
            label: e
        })) ?? [];

    $: if (selectedAttribute) {
        ({
            required: data.required,
            array: data.array,
            elements: data.elements,
            default: data.default
        } = selectedAttribute);
    }

    $: if (data.required || data.array) {
        data.default = undefined;
    }
</script>

<InputTags
    id="elements"
    label="Elements"
    bind:tags={data.elements}
    placeholder="Add elements here"
    readonly={!!selectedAttribute}
    required />
<InputSelect
    id="default"
    label="Default value"
    bind:options
    bind:value={data.default}
    disabled={!!selectedAttribute || data.required} />
<InputChoice
    id="required"
    label="Required"
    bind:value={data.required}
    disabled={!!selectedAttribute || data.array}>
    Indicate whether this is a required attribute
</InputChoice>
<InputChoice
    id="array"
    label="Array"
    bind:value={data.array}
    disabled={!!selectedAttribute || data.required}>
    Indicate whether this attribute should act as an array
</InputChoice>
