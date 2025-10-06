<script context="module" lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export async function submitEnum(
        databaseId: string,
        tableId: string,
        key: string,
        data: Partial<Models.ColumnEnum>
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.createEnumColumn({
            databaseId,
            tableId,
            key,
            elements: data.elements,
            required: data.required,
            xdefault: data.default,
            array: data.array
        });
    }

    export async function updateEnum(
        databaseId: string,
        tableId: string,
        data: Partial<Models.ColumnEnum>,
        originalKey?: string
    ) {
        await sdk.forProject(page.params.region, page.params.project).tablesDB.updateEnumColumn({
            databaseId,
            tableId,
            key: originalKey,
            elements: data.elements,
            required: data.required,
            xdefault: data.default,
            newKey: data.key !== originalKey ? data.key : undefined
        });
    }
</script>

<script lang="ts">
    import { createConservative } from '$lib/helpers/stores';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { InputSelect, InputTags } from '$lib/elements/forms';
    import { Icon, Selector, Tooltip, Typography } from '@appwrite.io/pink-svelte';

    export let editing = false;
    export let disabled = false;
    export let data: Partial<Models.ColumnEnum>;

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
    } = createConservative<Partial<Models.ColumnEnum>>({
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
    disabled={data.array || data.required || disabled}
    placeholder="Select a value"
    {options}
    bind:value={data.default} />

<Selector.Checkbox
    size="s"
    id="required"
    label="Required"
    bind:checked={data.required}
    disabled={data.array || disabled}
    description="Indicate whether this column is required" />

<Selector.Checkbox
    size="s"
    id="array"
    label="Array"
    bind:checked={data.array}
    disabled={data.required || editing || disabled}
    description="Indicate whether this column is an array. Defaults to an empty array." />
