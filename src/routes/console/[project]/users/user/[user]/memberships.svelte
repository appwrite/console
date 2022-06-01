<script lang="ts">
    import { page } from '$app/stores';
    import { Card, Pagination, Empty } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCell,
        TableCellHead,
        TableCellLink,
        TableCellText
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    // import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 30, 30).toString();

    let offset = 0;

    const limit = 25;

    $: request = sdkForProject.users.getMemberships($page.params.user);
</script>

<Container>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Card>
                <Table>
                    <TableHeader>
                        <TableCellHead width={30} />
                        <TableCellHead>Name</TableCellHead>
                        <TableCellHead>Role</TableCellHead>
                        <TableCellHead width={30} />
                    </TableHeader>
                    <TableBody>
                        {#each response.memberships as membership}
                            <TableRow>
                                <TableCell onlyDesktop>
                                    <div class="image">
                                        <img
                                            class="avatar"
                                            width="30"
                                            height="30"
                                            src={getAvatar(membership.userName)}
                                            alt={membership.userName} />
                                    </div>
                                </TableCell>
                                <TableCellLink href="#" title="Name">
                                    {membership.userName ? membership.userName : 'n/a'}
                                </TableCellLink>
                                <TableCellText title="Role">ROLE</TableCellText>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>

                <Pagination {limit} bind:offset sum={response.total} />
            </Card>
        {:else}
            <Empty centered>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <p>No Memberships Available</p>
                    </div>
                    <div class="common-section">
                        <Button secondary href="#">Documentation</Button>
                    </div>
                </div>
            </Empty>
            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {response.total}</p>
                <Pagination {limit} bind:offset sum={response.total} />
            </div>
        {/if}
    {/await}
</Container>
