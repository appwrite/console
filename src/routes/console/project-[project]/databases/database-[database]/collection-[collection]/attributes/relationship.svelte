<script context="module" lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import { sdkForProject } from '$lib/stores/sdk';

    export async function submitRelationship(
        databaseId: string,
        collectionId: string,
        key: string,
        data: Partial<Models.AttributeString>
    ) {
        await sdkForProject.databases.createStringAttribute(
            databaseId,
            collectionId,
            key,
            data.size,
            data.required,
            data.default ? (data.default as string) : undefined,
            data.array
        );
    }
</script>

<script lang="ts">
    import { InputText, InputChoice, InputSelect } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { database } from '../../store';

    export let selectedAttribute: Models.AttributeString;
    export let data: Partial<Models.AttributeString> = {
        required: false,
        size: 0,
        default: null,
        array: false
    };

    let isOneWay = true;

    onMount(async () => {
        console.log($database);
    });

    $: if (selectedAttribute) {
        ({
            required: data.required,
            array: data.array,
            size: data.size,
            default: data.default
        } = selectedAttribute);
    }
    $: if (data.required || data.array) {
        data.default = null;
    }
</script>

{#if isOneWay}
    <!-- <InputSelect id="related" label="Size" bind:value={data.size} required /> -->
    <InputText
        id="default"
        label="Default value"
        bind:value={data.default}
        maxlength={data.size}
        disabled={data.required || data.array}
        readonly={!!selectedAttribute} />
    <div>
        <InputText
            id="key"
            label="Attribute Key"
            placeholder="Enter Key"
            bind:value={data.key}
            autofocus
            required />

        <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
            <span
                class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                aria-hidden="true" />
            <span class="text u-line-height-1-5">
                Allowed characters: alphanumeric, hyphen, non-leading underscore, period
            </span>
        </div>
    </div>
{:else}
    2
{/if}
