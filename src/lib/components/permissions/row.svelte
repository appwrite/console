<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { AvatarInitials } from '../';
    import {
        Button,
        Divider,
        Icon,
        Layout,
        Link,
        Popover,
        Spinner,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Avatar from '../avatar.svelte';
    import { IconAnonymous, IconExternalLink, IconMinusSm } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';

    export let role: string;

    async function getData(
        permission: string
    ): Promise<
        Partial<Models.User<Record<string, unknown>> & Models.Team<Record<string, unknown>>>
    > {
        const role = permission.split(':')[0];
        const id = permission.split(':')[1].split('/')[0];
        if (role === 'user') {
            const user = await sdk
                .forProject(page.params.region, page.params.project)
                .users.get(id);
            return user;
        }
        if (role === 'team') {
            const team = await sdk
                .forProject(page.params.region, page.params.project)
                .teams.get(id);
            return team;
        }
    }
</script>

{#if role === 'users'}
    <div>Users</div>
{:else if role === 'guests'}
    <div>Guests</div>
{:else if role === 'any'}
    <div>Any</div>
{:else}
    <Popover let:toggle placement="bottom-start">
        <Link.Button on:click={toggle}>{role}</Link.Button>
        <div let:showing slot="tooltip" style:width="200px">
            {#key showing}
                {#await getData(role)}
                    <Layout.Stack alignItems="center">
                        <Spinner />
                    </Layout.Stack>
                {:then data}
                    {@const isUser = role.startsWith('user')}
                    {@const isTeam = role.startsWith('team')}
                    {@const isAnonymous = !data.email && !data.phone && !data.name && isUser}
                    <Layout.Stack>
                        <Layout.Stack direction="row" gap="s" alignItems="center">
                            {#if isAnonymous}
                                <Avatar alt="avatar" size="xs">
                                    <Icon icon={IconAnonymous} size="s" />
                                </Avatar>
                            {:else if data.name}
                                <AvatarInitials name={data.name} size="xs" />
                            {:else}
                                <Avatar alt="avatar" size="xs">
                                    <Icon icon={IconMinusSm} size="s" />
                                </Avatar>
                            {/if}
                            <Typography.Text truncate color="--fgcolor-neutral-primary">
                                {data.name ?? data?.email ?? data?.phone ?? '-'}
                            </Typography.Text>
                        </Layout.Stack>

                        <Divider />
                        {#if isUser}
                            {#if data?.email}
                                <Typography.Text truncate>Email: {data?.email}</Typography.Text>
                            {/if}
                            {#if data?.phone}
                                <Typography.Text truncate>Phone: {data?.phone}</Typography.Text>
                            {/if}
                            <div>
                                <Button.Anchor
                                    href={`${base}/project-${page.params.region}-${page.params.project}/auth/user-${data?.$id}`}
                                    size="xs"
                                    target="_blank"
                                    variant="secondary">
                                    View user
                                    <Icon slot="end" icon={IconExternalLink} size="s" />
                                </Button.Anchor>
                            </div>
                        {:else if isTeam}
                            <Typography.Text>Members: {data?.total}</Typography.Text>
                            <div>
                                <Button.Anchor
                                    href={`${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${data?.$id}`}
                                    size="s"
                                    target="_blank"
                                    variant="secondary">
                                    View team
                                    <Icon slot="end" icon={IconExternalLink} size="s" />
                                </Button.Anchor>
                            </div>
                        {/if}
                    </Layout.Stack>
                {/await}
            {/key}
        </div>
    </Popover>
{/if}
