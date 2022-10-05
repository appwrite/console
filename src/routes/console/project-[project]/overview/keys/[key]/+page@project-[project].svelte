<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardGrid, Collapsible, CollapsibleItem } from '$lib/components';
    import { scopes } from '$lib/constants';
    import {
        Button,
        Form,
        FormList,
        InputChoice,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
    import InputDateTime from '$lib/elements/forms/inputDateTime.svelte';
    import { difference } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { updateLayout } from '$lib/stores/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { project } from '../../../store';
    import Delete from './delete.svelte';
    import { key } from './store';

    const projectId = $page.params.project;
    const keyId = $page.params.key;
    const activeScopes = scopes.reduce((prev, next) => {
        prev[next.scope] = false;

        return prev;
    }, {});

    let loaded = false;
    let showDelete = false;
    let name: string = null;
    let secret: string = null;
    let expire: string = null;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        const promise = key.load(projectId, keyId);
        if ($key?.$id !== keyId) {
            await promise;
        }

        name ??= $key.name;
        secret ??= $key.secret;
        expire ??= $key.expire;
        unselectAll();
        $key.scopes.forEach((scope) => {
            activeScopes[scope] = true;
        });

        updateLayout({
            navigate: event,
            back: `${base}/console/project-${$page.params.project}/overview/keys`,
            title: $key.name,
            level: 4,
            copy: {
                text: 'API Key Secret',
                value: $key.secret
            },
            breadcrumbs: [
                {
                    level: 3,
                    href: 'keys',
                    title: 'API Keys'
                },
                {
                    level: 4,
                    href: keyId,
                    title: $key.name
                }
            ]
        });
        loaded = true;
    }

    async function updateName() {
        try {
            await sdkForConsole.projects.updateKey($project.$id, $key.$id, name, $key.scopes);
            $key.name = name;
            addNotification({
                type: 'success',
                message: 'API Key name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function updateExpire() {
        try {
            await sdkForConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                $key.scopes,
                expire
            );
            $key.expire = expire;
            addNotification({
                type: 'success',
                message: 'API Key expiration has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    async function updateScopes() {
        try {
            await sdkForConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                selectedScoped
            );
            $key.scopes = selectedScoped;
            addNotification({
                type: 'success',
                message: 'API Key scopes has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    function selectAll() {
        for (const scope in activeScopes) {
            activeScopes[scope] = true;
        }
    }

    function unselectAll() {
        for (const scope in activeScopes) {
            activeScopes[scope] = false;
        }
    }

    $: selectedScoped = scopes
        .filter((scope) => activeScopes[scope.scope])
        .map(({ scope }) => scope);
</script>

<svelte:head>
    <title>Appwrite - API Key</title>
</svelte:head>

<Container>
    {#if loaded}
        <CardGrid>
            <div>
                <h6 class="heading-level-7">{$key.name}</h6>
            </div>
            <svelte:fragment slot="aside">
                <p>
                    Last accessed: {toLocaleDateTime($key.accessedAt)}<br />
                    Scopes granted: {$key.scopes.length}
                </p>
            </svelte:fragment>
        </CardGrid>
        <Form>
            <CardGrid>
                <h6 class="heading-level-7">API Key Secret</h6>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputPassword
                            id="secret"
                            label="API Key Secret"
                            bind:value={secret}
                            showPasswordButton
                            required />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
        <Form on:submit={updateName}>
            <CardGrid>
                <h6 class="heading-level-7">Update Name</h6>
                <p class="text">Choose any name that will help you distinguish between API keys.</p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputText
                            id="name"
                            label="Name"
                            bind:value={name}
                            required
                            placeholder="Enter name" />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $key.name} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
        <Form on:submit={updateScopes}>
            <CardGrid>
                <h6 class="heading-level-7">Update Scopes</h6>
                <p class="text">
                    You can choose which permission scope to grant your application. It is a best
                    practice to allow only the permissions you need to meet your project goals.
                </p>
                <svelte:fragment slot="aside">
                    <div class="u-flex u-cross-center u-main-end">
                        <Button text on:click={unselectAll}>Unselect all</Button>
                        <Button text on:click={selectAll}>Select all</Button>
                    </div>
                    <Collapsible>
                        {#each ['Authentication', 'Database', 'Functions', 'Storage', 'Other'] as category}
                            <CollapsibleItem>
                                <svelte:fragment slot="title">{category}</svelte:fragment>
                                <FormList>
                                    {#each scopes.filter((s) => s.category === category) as scope}
                                        <InputChoice
                                            id={scope.scope}
                                            label={scope.scope}
                                            bind:value={activeScopes[scope.scope]}>
                                            {scope.description}
                                        </InputChoice>
                                    {/each}
                                </FormList>
                            </CollapsibleItem>
                        {/each}
                    </Collapsible>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        submit
                        disabled={!(
                            difference(selectedScoped, $key.scopes).length !== 0 ||
                            difference($key.scopes, selectedScoped).length !== 0
                        )}>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
        <Form on:submit={updateExpire}>
            <CardGrid>
                <h6 class="heading-level-7">Update Expiration Date</h6>
                <p class="text">Choose any name that will help you distinguish between API keys.</p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputDateTime id="expire" label="Expiration Date" bind:value={expire} />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={expire === $key.expire} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
        <CardGrid>
            <div>
                <h6 class="heading-level-7">Delete API Key</h6>
            </div>
            <p>The API Key will be permanently deleted. This action is irreversible.</p>
            <svelte:fragment slot="aside">
                <div class="box">
                    <div class="u-flex u-gap-16">
                        <div class="u-cross-child-center u-line-height-1-5">
                            <h6 class="u-bold">{$key.name}</h6>
                            <p>Last accessed: {toLocaleDateTime($key.accessedAt)}</p>
                        </div>
                    </div>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
