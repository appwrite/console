<script lang="ts">
    import { InputTags } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { preferences } from '$lib/stores/preferences';
    import { Input, Layout } from '@appwrite.io/pink-svelte';
    import { organization } from '$lib/stores/organization';

    let {
        collectionId,
        databaseType,
        inModal = false,
        onSuccess = null,
        onFailure = null
    }: {
        collectionId: string;
        databaseType: string;
        inModal?: boolean;
        onSuccess?: () => Promise<void> | void;
        onFailure?: (error: Error) => Promise<void> | void;
    } = $props();

    let names = $state<string[]>(getDisplayNames());

    const isDisabled = $derived(
        !symmetricDifference(names, getDisplayNames()).length || names.length > 5
    );

    function getDisplayNames() {
        const displayNames = preferences.getDisplayNames(collectionId, databaseType) ?? [];
        return displayNames.filter((name) => !name.startsWith('$'));
    }

    export function hasChanged() {
        return isDisabled;
    }

    export async function updateDisplayNames() {
        try {
            const regularArray = [...names];

            await preferences.setDisplayNames(
                $organization.$id,
                collectionId,
                regularArray,
                databaseType
            );

            await onSuccess?.();

            // reset with new values!
            names = getDisplayNames();
        } catch (error) {
            await onFailure?.(error);
        }
    }

    $effect(() => {
        names = getDisplayNames();
    });
</script>

<Layout.Stack>
    <Layout.Stack gap="s">
        {#key names.length}
            <InputTags
                bind:tags={names}
                id="custom-columns-{collectionId}"
                placeholder="Enter document keys"
                label={inModal ? null : 'Fields to display'} />
        {/key}

        <Input.Helper state="default">
            ID, createdAt, and updatedAt are always included and cannot be modified
        </Input.Helper>
    </Layout.Stack>
</Layout.Stack>
