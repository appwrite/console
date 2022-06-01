<script lang="ts">
    import { page } from '$app/stores';
    import { Card, Empty, List, ListItem, Pagination } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';

    let offset = 0;

    const limit = 25;
    const deleteSession = async (id: string) => {
        try {
            await sdkForProject.users.deleteSession($page.params.user, id);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
    const deleteAllSessions = async () => {
        try {
            if (confirm('You really want to delete all sessions?')) {
                await sdkForProject.users.deleteSessions($page.params.user);
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    $: request = sdkForProject.users.getSessions($page.params.user);
</script>

<Container>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Card>
                <List>
                    {#each response.sessions as session}
                        <ListItem
                            avatar={sdkForProject.avatars
                                .getBrowser(session.clientCode, 64, 64)
                                .toString()}>
                            <svelte:fragment slot="header">
                                <h2 class="sessions-item-title">
                                    <span class="text">
                                        <span class="browser-name">{session.clientName}</span>
                                        <span class="browser-version">{session.clientVersion}</span>
                                        <span>on</span>
                                        <span class="browser-os">{session.osName}</span>
                                        <span class="browser-os-version">{session.osVersion}</span>
                                    </span>
                                </h2>
                                {#if session.current}
                                    <span class="pill is-success">Current Session</span>
                                {/if}
                            </svelte:fragment>
                            <svelte:fragment slot="info">
                                {session.ip} / {session.countryName}
                            </svelte:fragment>
                            <svelte:fragment slot="action">
                                <Button danger on:click={() => deleteSession(session.$id)}
                                    >Logout</Button>
                            </svelte:fragment>
                        </ListItem>
                    {/each}
                </List>
            </Card>
        {:else}
            <Empty centered>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <p>No Session Available</p>
                    </div>
                    <div class="common-section">
                        <Button secondary href="#">Documentation</Button>
                    </div>
                </div>
            </Empty>
        {/if}
        <div class="u-flex common-section u-main-space-between">
            <p class="text">Total results: {response.total}</p>
            <Pagination {limit} bind:offset sum={response.total} />
        </div>
        {#if response.total}
            <Button danger on:click={deleteAllSessions}>Logout from all sessions</Button>
        {/if}
    {/await}
</Container>
