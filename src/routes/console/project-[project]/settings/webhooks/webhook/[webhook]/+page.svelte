<script lang="ts">
    import { onMount } from 'svelte';
    import { CardGrid, Box, Secret, Empty, EventModal } from '$lib/components';
    import {
        Button,
        Form,
        FormList,
        InputText,
        InputChoice,
        InputPassword
    } from '$lib/elements/forms';
    import { TableList, TableCellText, TableCell } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { webhook } from './store';
    import { page } from '$app/stores';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Delete from './delete.svelte';
    import Regenerate from './regenerate.svelte';
    import { difference } from '$lib/helpers/array';

    const projectId = $page.params.project;
    let name: string = null;
    let url: string = null;
    let events = [];
    let httpUser: string = null;
    let httpPass: string = null;
    let security = false;
    let showDelete = false;
    let showCreateEvent = false;
    let areEventsDisabled = true;
    let showRegenerate = false;

    onMount(async () => {
        name ??= $webhook.name;
        url ??= $webhook.url;
        events = $webhook.events;
        httpUser ??= $webhook.httpUser;
        httpPass ??= $webhook.httpPass;
        security = $webhook.security;
    });

    async function updateName() {
        try {
            await sdkForConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                name,
                $webhook.events,
                $webhook.url,
                $webhook.security
            );
            $webhook.name = name;
            addNotification({
                type: 'success',
                message: 'Webhook name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    async function updateUrl() {
        try {
            await sdkForConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                $webhook.name,
                $webhook.events,
                url,
                $webhook.security
            );
            $webhook.url = url;
            addNotification({
                type: 'success',
                message: 'Webhook url has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    async function updateEvents() {
        try {
            await sdkForConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                $webhook.name,
                events,
                $webhook.url,
                $webhook.security
            );
            $webhook.events = events;
            areEventsDisabled = true;
            addNotification({
                type: 'success',
                message: 'Webhook events have been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    async function updateSecurity() {
        try {
            await sdkForConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                $webhook.name,
                $webhook.events,
                $webhook.url,
                security,
                httpUser,
                httpPass
            );
            $webhook.security = security;
            $webhook.httpUser = httpUser;
            $webhook.httpPass = httpPass;
            addNotification({
                type: 'success',
                message: 'Webhook security has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    $: signatureKey = $webhook?.signatureKey;
    $: if (difference(events, $webhook.events).length > 0) {
        areEventsDisabled = false;
    }
</script>

<Container>
    <CardGrid>
        <h6 class="heading-level-7">Signature Key</h6>
        <p>You can use the Signature Key to validate your webhooks.</p>
        <svelte:fragment slot="aside">
            <div>
                <p>Key</p>
                <Secret bind:value={signatureKey} />
            </div>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button on:click={() => (showRegenerate = true)} secondary submit
                >Regenerate Key</Button>
        </svelte:fragment>
    </CardGrid>
    <Form on:submit={updateName}>
        <CardGrid>
            <h6 class="heading-level-7">Update Name</h6>
            <p>Choose any name that will help you distinguish between Webhooks.</p>
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
                <Button disabled={name === $webhook.name || !name} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateUrl}>
        <CardGrid>
            <h6 class="heading-level-7">Update Url</h6>

            <svelte:fragment slot="aside">
                <FormList>
                    <InputText
                        id="url"
                        label="POST URL"
                        bind:value={url}
                        required
                        placeholder="https://example.com/callback" />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={url === $webhook.url || !url} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateEvents}>
        <CardGrid>
            <h6 class="heading-level-7">Update Events</h6>
            <p class="text">
                Set the events that will trigger your webhook. Maximum 100 events allowed.
            </p>
            <svelte:fragment slot="aside">
                {#if events?.length}
                    <TableList>
                        {#each events as id}
                            <li class="table-row">
                                <TableCellText title="id">
                                    {id}
                                </TableCellText>
                                <TableCell showOverflow title="options" width={30}>
                                    <button
                                        class="button is-text is-only-icon"
                                        aria-label="delete id"
                                        on:click|preventDefault={() => {
                                            events = events.filter((item) => item !== id);
                                        }}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </button>
                                </TableCell>
                            </li>
                        {/each}
                    </TableList>
                {:else}
                    <Empty isButton single on:click={() => (showCreateEvent = !showCreateEvent)}
                        >Add a event to get started</Empty>
                {/if}

                <Button text on:click={() => (showCreateEvent = !showCreateEvent)}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="u-text">Add event</span>
                </Button>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={areEventsDisabled} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Form on:submit={updateSecurity}>
        <CardGrid>
            <h6 class="heading-level-7">Security</h6>
            <p class="text">
                Set an optional basic HTTP authentication username and password to protect your
                endpoint from unauthorized access.
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <div>
                        <h2 class="heading-level-7">HTTP Authentication</h2>
                        <p class="text">Use to secure your endpoint from untrusted sources.</p>
                    </div>
                    <InputText
                        label="User"
                        id="user"
                        placeholder="Enter username"
                        bind:value={httpUser} />
                    <InputPassword
                        label="Password"
                        id="password"
                        showPasswordButton
                        placeholder="Enter password"
                        bind:value={httpPass} />

                    <InputChoice
                        id="Security"
                        label="Certificate verification (SSL/TLS)"
                        bind:value={security}>
                        <span class="u-error">Warning:</span> Untrusted or self-signed certificates
                        may not be secure.
                        <a href="#/" target="_blank" rel="noopener noreferrer" class="link">
                            Learn more</a
                        ></InputChoice>
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={httpUser === $webhook.httpUser ||
                        httpPass === $webhook.httpPass ||
                        !httpUser ||
                        !httpPass}
                    submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid>
        <div>
            <h6 class="heading-level-7">Delete Webhook</h6>
        </div>
        <p>The webhook will be permanently deleted. This action is irreversible.</p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold">{$webhook.name}</h6>
                </svelte:fragment>
                <p>Last updated: {toLocaleDateTime($webhook.$updatedAt)}</p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
<Regenerate bind:show={showRegenerate} />
<EventModal
    bind:show={showCreateEvent}
    on:created={(e) => {
        events.push(e.detail[0]);
        events = events;
    }} />
