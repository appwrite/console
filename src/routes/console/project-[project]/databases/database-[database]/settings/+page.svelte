<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Box, Card, CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, Helper, InputText } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import Delete from '../delete.svelte';
    import { database } from '../store';
    import LL from '$i18n/i18n-svelte';

    let showDelete = false;
    let showError: false | 'name' | 'email' | 'password' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let databaseName: string = null;

    onMount(async () => {
        databaseName ??= $database.name;
    });

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        showError = location;
        errorMessage = message;
        errorType = type;
    }

    async function updateName() {
        try {
            await sdk.forProject.databases.update($page.params.database, databaseName);
            await invalidate(Dependencies.DATABASE);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.DatabaseUpdateName);
        } catch (error) {
            addError('name', error.message, 'error');
            trackError(error, Submit.DatabaseUpdateName);
        }
    }
</script>

{#if $database}
    <Container>
        <Card>
            <div class="common-section grid-1-2">
                <div class="grid-1-2-col-1">
                    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
                        <Heading tag="h6" size="7">{$database.name}</Heading>
                    </div>
                </div>
                <div class="grid-1-2-col-2">
                    <p>
                        {$LL.console.project.texts.databases.created()}{' '}{toLocaleDateTime(
                            $database.$createdAt
                        )}
                    </p>
                    <p>
                        {$LL.console.project.texts.databases.lastUpdated()}{' '}{toLocaleDateTime(
                            $database.$updatedAt
                        )}
                    </p>
                </div>
            </div>
        </Card>

        <Form onSubmit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7"
                    >{$LL.console.project.forms.databases.updateName.title()}</Heading>

                <svelte:fragment slot="aside">
                    <ul>
                        <InputText
                            id="name"
                            label={$LL.console.project.forms.databases.updateName.inputs.name.label()}
                            placeholder={$LL.console.project.forms.databases.updateName.inputs.name.placeholder()}
                            autocomplete={false}
                            bind:value={databaseName}
                            required />
                        {#if showError === 'name'}
                            <Helper type={errorType}>{errorMessage}</Helper>
                        {/if}
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={databaseName === $database.name || !databaseName} submit
                        >{$LL.console.button.submit.update()}</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid danger>
            <div>
                <Heading tag="h6" size="7">{$LL.console.project.title.deleteDatabase()}</Heading>
            </div>

            <p>
                {$LL.console.project.texts.databases.settings()}
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$database.name}</h6>
                        <span
                            >{$LL.console.project.texts.databases.lastUpdated()}{' '}{toLocaleDateTime(
                                $database.$updatedAt
                            )}</span>
                    </svelte:fragment>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}
                    >{$LL.console.project.button.submit.delete()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Container>
    <Delete bind:showDelete />
{/if}
