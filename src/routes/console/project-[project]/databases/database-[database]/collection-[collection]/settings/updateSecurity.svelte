<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from '../store';
    import LL from '$i18n/i18n-svelte';

    const databaseId = $page.params.database;

    let collectionDocumentSecurity: boolean = null;

    onMount(() => {
        collectionDocumentSecurity ??= $collection.documentSecurity;
    });

    async function updateSecurity() {
        try {
            await sdk.forProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                $collection.name,
                $collection.$permissions,
                collectionDocumentSecurity,
                $collection.enabled
            );
            await invalidate(Dependencies.COLLECTION);
            addNotification({
                message: 'Security has been updated',
                type: 'success'
            });
            trackEvent(Submit.CollectionUpdateSecurity);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.CollectionUpdateSecurity);
        }
    }
</script>

<CardGrid>
    <Heading tag="h6" size="7">{$LL.console.project.title.updateSecurity()}</Heading>
    <svelte:fragment slot="aside">
        <FormList>
            <InputSwitch
                bind:value={collectionDocumentSecurity}
                id="security"
                label={$LL.console.project.forms.databases.settings.inputs.docSecurity.label()} />
        </FormList>
        <p class="text">
            {$LL.console.project.texts.databases.updateSecurity.phraseOne()}{' '}<b
                >{$LL.console.project.texts.databases.updateSecurity.eitherDocOrCollection()}</b
            >.
        </p>
        <p class="text">
            <b>{$LL.console.project.texts.databases.updateSecurity.collectionPermission()}</b
            >.{$LL.console.project.texts.databases.updateSecurity.documentPermission()}
        </p>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button
            disabled={collectionDocumentSecurity === $collection.documentSecurity}
            on:click={updateSecurity}>{$LL.console.project.button.submit.update()}</Button>
    </svelte:fragment>
</CardGrid>
