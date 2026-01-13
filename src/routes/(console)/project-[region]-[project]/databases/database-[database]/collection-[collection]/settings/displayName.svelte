<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputTags } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { preferences } from '$lib/stores/preferences';
    import { page } from '$app/state';
    import { Input, Layout } from '@appwrite.io/pink-svelte';
    import { organization } from '$lib/stores/organization';
    import { getTerminologies } from '$database/(entity)';

    const collectionId = page.params.collection;
    const { terminology } = getTerminologies();

    let names = $state<string[]>(
        (preferences.getDisplayNames(collectionId, terminology.type) ?? []).filter(
            (name) => !name.startsWith('$')
        )
    );

    async function updateDisplayName() {
        try {
            // $state makes proxy,
            // structuredClone doesn't work
            const regularArray = [...names];

            await preferences.setDisplayNames(
                $organization.$id,
                collectionId,
                regularArray,
                terminology.type
            );

            await invalidate(Dependencies.TEAM);
            addNotification({
                message: 'Display names have been updated',
                type: 'success'
            });
            trackEvent(Submit.TableUpdateDisplayNames);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TableUpdateDisplayNames);
        }
    }

    const isDisabled = $derived(
        !symmetricDifference(
            names,
            (preferences.getDisplayNames(collectionId, terminology.type) ?? []).filter(
                (name) => !name.startsWith('$')
            )
        ).length || names.length > 5
    );
</script>

<Form onSubmit={updateDisplayName}>
    <CardGrid>
        <svelte:fragment slot="title">Display name</svelte:fragment>
        Add up to 5 document keys to display in the spreadsheet and identify documents in the Appwrite
        console. These keys will be shown as custom columns in your spreadsheet view.

        <svelte:fragment slot="aside">
            <Layout.Stack gap="s">
                {#key names.length}
                    <InputTags
                        id="display-names"
                        label="Document keys"
                        placeholder="Enter document keys"
                        bind:tags={names} />
                {/key}
                <Input.Helper state="default">
                    Maximum 5 document keys allowed. System keys are automatically filtered out.
                </Input.Helper>
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
