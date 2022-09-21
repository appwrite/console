<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Empty, Pagination, Avatar, Copy, Search } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableHeader,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableRowLink
    } from '$lib/elements/table';
    import Create from './_createUser.svelte';
    import { goto } from '$app/navigation';
    import { event } from '$lib/actions/analytics';
    import { Pill } from '$lib/elements';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { usersList } from './store';
    import type { Models } from '@aw-labs/appwrite-console';
    import { pageLimit } from '$lib/stores/layout';
    import { _ } from '$lib/i18n';

    let showCreate = false;
    let search = '';
    let offset = 0;

    const project = $page.params.project;
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 32, 32).toString();
    const userCreated = async (event: CustomEvent<Models.User<Record<string, unknown>>>) => {
        await goto(`${base}/console/project-${project}/authentication/user/${event.detail.$id}`);
    };

    $: if (search) offset = 0;
    $: usersList.load(search, $pageLimit, offset ?? 0);
</script>

<Container>
    <Search bind:search placeholder={$_.t('services.authentication.users.search')}>
        <span
            use:event={{
                name: 'console_users',
                action: 'click_create',
                parameters: {
                    type: 'user'
                }
            }}>
            <Button on:click={() => (showCreate = true)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">{$_.t('services.authentication.users.create')}</span>
            </Button>
        </span>
    </Search>
    {#if $usersList?.total}
        <Table>
            <TableHeader>
                <TableCellHead>{$_.t('models.user.name')}</TableCellHead>
                <TableCellHead>{$_.t('models.user.email')}</TableCellHead>
                <TableCellHead width={100}>{$_.t('models.user.status')}</TableCellHead>
                <TableCellHead width={100}>{$_.t('models.user.id')}</TableCellHead>
                <TableCellHead>{$_.t('models.user.joined')}</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $usersList.users as user}
                    <TableRowLink
                        href={`${base}/console/project-${project}/authentication/user/${user.$id}`}>
                        <TableCell title={$_.t('models.user.name')}>
                            <div class="u-flex u-gap-12 u-cross-center">
                                <Avatar size={32} src={getAvatar(user.name)} name={user.name} />
                                <span class="text u-trim">{user.name ? user.name : 'n/a'}</span>
                            </div>
                        </TableCell>
                        <TableCellText title={$_.t('models.user.email')}
                            >{user.email}</TableCellText>
                        <TableCell title={$_.t('models.user.status')}>
                            {#if user.status}
                                {@const verified = user.emailVerification || user.phoneVerification}
                                <Pill success={verified}>
                                    {verified
                                        ? $_.t('models.user.verified')
                                        : $_.t('models.user.unverified')}
                                </Pill>
                            {:else}
                                <Pill danger>{$_.t('models.user.blocked')}</Pill>
                            {/if}
                        </TableCell>
                        <TableCell showOverflow title={$_.t('models.user.id')}>
                            <Copy value={user.$id}>
                                <Pill button>
                                    <span class="icon-duplicate" aria-hidden="true" />
                                    <span class="text">User ID</span>
                                </Pill>
                            </Copy>
                        </TableCell>
                        <TableCellText title={$_.t('models.user.joined')}>
                            {toLocaleDateTime(user.registration)}
                        </TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$usersList.total}</p>
            <Pagination limit={$pageLimit} bind:offset sum={$usersList.total} />
        </div>
    {:else if search}
        <Empty>
            <div class="u-flex u-flex-vertical">
                <b>Sorry, we couldn't find '{search}'</b>
                <div class="common-section">
                    <p>There are no users that match your search.</p>
                </div>
                <div class="common-section">
                    <Button secondary on:click={() => (search = '')}>Clear Search</Button>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$usersList.total}</p>
            <Pagination limit={$pageLimit} bind:offset sum={$usersList.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div
                    class="common-section"
                    use:event={{
                        name: 'console_users',
                        action: 'click_create',
                        parameters: {
                            type: 'user'
                        }
                    }}>
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Add Your First User To Get Started</p>
                </div>
                <div class="common-section">
                    <Button secondary href="#">Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={userCreated} />
