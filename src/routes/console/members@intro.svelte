<script lang="ts">
    import {
        Table,
        TableHeader,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableRow
    } from '$lib/elements/table';
    import { Avatar, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { organization, memberList } from './store';
    import { sdkForProject } from '$lib/stores/sdk';

    const limit = 5;
    let search = '';
    let offset: number = null;

    let showCreate = false;
    let showDelete = false;

    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 32, 32).toString();

    $: if (search) offset = 0;
    $: memberList.load($organization.$id, search, limit, offset ?? 0);
</script>

<Container>
    {#if $memberList?.total}
        <div class="u-flex u-gap-12 common-section u-main-space-between">
            <h2 class="heading-level-5">Members</h2>

            <Button
                on:click={() => {
                    showCreate = true;
                }}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create project</span>
            </Button>
        </div>

        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Email</TableCellHead>
                <TableCellHead width={100}>Role</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $memberList.memberships as member}
                    <TableRow>
                        <TableCell title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <Avatar
                                    size={32}
                                    src={getAvatar(member.userName) + $organization.name}
                                    name={member.userName} />
                                <span class="text u-trim"
                                    >{member.userName ? member.userName : 'n/a'}</span>
                                {#if member.invited && !member.joined}
                                    <Pill warning>Pending</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Email">{member.userEmail}</TableCellText>
                        <TableCell title="Roles">
                            {#if member.invited && !member.joined}
                                <Button secondary>Resend</Button>
                            {:else}
                                {member.roles}
                            {/if}
                        </TableCell>

                        <TableCell>
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                on:click|preventDefault={() => {
                                    // selectedMembership = membership;
                                    showDelete = true;
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </button>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$memberList.total}</p>
            <Pagination {limit} bind:offset sum={$memberList.total} />
        </div>
    {/if}
</Container>
