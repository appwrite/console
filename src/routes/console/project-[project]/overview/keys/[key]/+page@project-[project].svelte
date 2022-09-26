<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardGrid } from '$lib/components';
    import { scopes } from '$lib/constants';
    import {
        Button,
        Form,
        FormList,
        InputCheckbox,
        InputNumber,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
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
        prev[next] = false;

        return prev;
    }, {});

    let loaded = false;
    let showDelete = false;
    let name: string = null;
    let secret: string = null;
    let expire: number = null;

    onMount(handle);
    afterNavigate(handle);

    async function handle(event = null) {
        if ($key?.$id !== keyId) {
            await key.load(projectId, keyId);
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
        console.log(scopes.filter((scope) => activeScopes[scope]));
        try {
            await sdkForConsole.projects.updateKey(
                $project.$id,
                $key.$id,
                $key.name,
                scopes.filter((scope) => activeScopes[scope])
            );
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

    function unselectAll() {
        for (const scope in activeScopes) {
            activeScopes[scope] = false;
        }
    }
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
                    Last accessed: {toLocaleDateTime($key.$updatedAt)}<br />
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
                    <FormList>
                        {#each scopes as scope}
                            <InputCheckbox
                                id={scope}
                                label={scope}
                                bind:value={activeScopes[scope]} />
                        {/each}
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
        <Form on:submit={updateExpire}>
            <CardGrid>
                <h6 class="heading-level-7">Update Expiration Date</h6>
                <p class="text">Choose any name that will help you distinguish between API keys.</p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <InputNumber
                            id="expire"
                            label="Expiration Date"
                            bind:value={expire}
                            required />
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
                            <p>Last accessed: {toLocaleDateTime($key.$updatedAt)}</p>
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
