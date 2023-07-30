<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading, Secret } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import Scopes from '../scopes.svelte';
    import Delete from './delete.svelte';
    import { key } from './store';
    import UpdateExpirationDate from './updateExpirationDate.svelte';
    import LL from '$i18n/i18n-svelte';

    let showDelete = false;
    let name: string = null;
    let secret: string = null;
    let scopes: string[] = null;

    onMount(() => {
        name ??= $key.name;
        secret ??= $key.secret;
        scopes ??= $key.scopes;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                name,
                $key.scopes,
                $key.expire
            );
            await invalidate(Dependencies.KEY);
            trackEvent(Submit.KeyUpdateName);
            addNotification({
                type: 'success',
                message: 'API Key name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyUpdateName);
        }
    }

    async function updateScopes() {
        try {
            await sdk.forConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                scopes,
                $key.expire
            );
            await invalidate(Dependencies.KEY);
            trackEvent(Submit.KeyUpdateScopes, {
                scopes
            });
            addNotification({
                type: 'success',
                message: 'API Key scopes have been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyUpdateScopes);
        }
    }
</script>

<svelte:head>
    <title>{$LL.console.project.title.apiKey()} - Appwrite</title>
</svelte:head>

<Container>
    {@const accessedAt = $key.accessedAt ? toLocaleDateTime($key.accessedAt) : 'never'}
    <CardGrid>
        <div>
            <Heading tag="h6" size="7">{$key.name}</Heading>
        </div>
        <svelte:fragment slot="aside">
            <p>
                {$LL.console.project.texts.overview.lastAccessed()}{' '}{accessedAt}<br />
                {$LL.console.project.texts.overview.scopeGranted()}{' '}{$key.scopes.length}
            </p>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.table.pill.apiKeySecret()}</Heading>
        <svelte:fragment slot="aside">
            <Secret copyEvent="key" bind:value={secret} />
        </svelte:fragment>
    </CardGrid>

    <Form onSubmit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.project.forms.overview.title.name()}</Heading>
            <p class="text">{$LL.console.project.texts.overview.chooseName()}</p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputText
                        id="name"
                        label={$LL.console.project.forms.overview.inputs.name.label()}
                        bind:value={name}
                        required
                        placeholder={$LL.console.project.forms.overview.inputs.name.defaultPlaceholder()} />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={name === $key.name} submit
                    >{$LL.console.project.button.submit.update()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
    <Form onSubmit={updateScopes}>
        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.project.title.scopes()}</Heading>
            <p class="text">
                {$LL.console.project.texts.overview.permissionScope()}
            </p>
            <svelte:fragment slot="aside">
                {#if scopes !== null}
                    <Scopes bind:scopes />
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    submit
                    disabled={scopes &&
                        $key?.scopes &&
                        !symmetricDifference(scopes, $key.scopes).length}
                    >{$LL.console.project.button.submit.update()}</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <UpdateExpirationDate />

    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">{$LL.console.project.title.deleteApiKey()}</Heading>
        </div>
        <p>{$LL.console.project.texts.overview.deletePermanent()}</p>
        <svelte:fragment slot="aside">
            <div class="box">
                <div class="u-flex u-gap-16">
                    <div class="u-cross-child-center u-line-height-1-5">
                        <h6 class="u-bold">{$key.name}</h6>
                        <p>{$LL.console.project.texts.overview.lastAccessed()}{' '}{accessedAt}</p>
                    </div>
                </div>
            </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}
                >{$LL.console.project.button.submit.delete()}</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
