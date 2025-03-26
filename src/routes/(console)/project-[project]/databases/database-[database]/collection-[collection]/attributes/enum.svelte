<script context="module" lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

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
        data: Partial<Models.AttributeEnum>,
        originalKey?: string
    ) {
        await sdk.forProject.databases.updateEnumAttribute(
            databaseId,
            collectionId,
            originalKey,
            data.elements,
            data.required,
            data.default,
            data.key !== originalKey ? data.key : undefined
        );
    }
</script>

<script lang="ts">
    import { InputSelect, InputTags } from '$lib/elements/forms';

    export let editing = false;
    export let data: Partial<Models.AttributeEnum>;

    import { createConservative } from '$lib/helpers/stores';
    import { Icon, Selector, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

    let savedDefault = data.default;

    function handleDefaultState(hideDefault: boolean) {
        if (hideDefault) {
            savedDefault = data.default;
            data.default = null;
        } else {
            data.default = savedDefault;
        }
    }

    const {
        stores: { required, array },
        listen
    } = createConservative<Partial<Models.AttributeEnum>>({
        required: false,
        array: false,
        ...data
    });
    $: listen(data);

    $: handleDefaultState($required || $array);

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
    required
    id="elements"
    label="Elements"
    bind:tags={data.elements}
    placeholder="Add elements here">
    <Tooltip slot="info" maxWidth="15rem">
        <Icon icon={IconInfo} size="s" />
        <Typography.Caption variant="400" slot="tooltip">
            Enum elements have a maximum length of 255 characters. This limit can not be exceeded.
        </Typography.Caption>
    </Tooltip>
</InputTags>

<InputSelect
    id="default"
    label="Default value"
    disabled={data.array || data.required}
    placeholder="Select a value"
    {options}
    bind:value={data.default} />
<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array}
    description="Indicate whether this attribute is required" />
<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing}
    description="Indicate whether this attribute should act as an array, with the default value set as an empty
    array." />
