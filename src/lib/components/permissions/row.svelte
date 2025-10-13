<script lang="ts">
    import { type ComponentProps } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { AvatarInitials } from '../';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        Badge,
        Divider,
        Icon,
        InteractiveText,
        Layout,
        Link,
        Popover,
        Spinner,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Avatar from '../avatar.svelte';
    import { IconAnonymous, IconMinusSm } from '@appwrite.io/pink-icons-svelte';
    import { page } from '$app/state';
    import { menuOpen } from '$lib/components/menu/store';
    import { base } from '$app/paths';
    import { formatName } from '$lib/helpers/string';

    export let role: string;
    export let placement: ComponentProps<Popover>['placement'] = 'bottom-start';

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
                .users.get({ userId: id });
            return user;
        }
        if (role === 'team') {
            const team = await sdk
                .forProject(page.params.region, page.params.project)
                .teams.get({ teamId: id });
            return team;
        }
    }

    let isMouseOverTooltip = false;
    function hidePopover(hideTooltip: () => void, timeout = true) {
        if (!timeout) {
            isMouseOverTooltip = false;
            return hideTooltip();
        }

        setTimeout(() => {
            if (!isMouseOverTooltip) {
                hideTooltip();
            }
        }, 150);
    }
</script>

{#if role === 'users'}
    <div>Users</div>
{:else if role === 'guests'}
    <div>Guests</div>
{:else if role === 'any'}
    <div>Any</div>
{:else}
    <Popover let:show let:hide {placement} portal>
        <button
            on:mouseenter={() => {
                if (!$menuOpen) {
                    setTimeout(show, 150);
                }
            }}
            on:mouseleave={() => hidePopover(hide)}>
            <slot>
                <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                    <Typography.Text>
                        {#await getData(role)}
                            {role}
                        {:then data}
                            {formatName(
                                data.name ?? data?.email ?? data?.phone ?? '-',
                                $isSmallViewport ? 5 : 12
                            )}
                        {/await}
                    </Typography.Text>
                    <Badge
                        size="xs"
                        variant="secondary"
                        content={role.startsWith('user') ? 'User' : 'Team'} />
                </Layout.Stack>
            </slot>
        </button>

        <div
            let:hide
            let:showing
            slot="tooltip"
            role="tooltip"
            style:padding="1rem"
            style:margin="-1rem"
            on:mouseenter={() => (isMouseOverTooltip = true)}
            on:mouseleave={() => hidePopover(hide, false)}>
            {#if showing}
                <Layout.Stack gap="s" alignContent="flex-start">
                    {#await getData(role)}
                        <Layout.Stack alignItems="center">
                            <Spinner />
                        </Layout.Stack>
                    {:then data}
                        {@const isUser = role.startsWith('user')}
                        {@const isAnonymous = !data.email && !data.phone && !data.name && isUser}
                        {@const id = role.split(':')[1].split('/')[0]}

                        <Layout.Stack gap="s" alignItems="flex-start">
                            <Layout.Stack
                                direction="row"
                                gap="s"
                                alignItems="center"
                                justifyContent="flex-start">
                                {#if isAnonymous}
                                    <Avatar alt="avatar" size="m">
                                        <Icon icon={IconAnonymous} size="s" />
                                    </Avatar>
                                {:else if data.name}
                                    <AvatarInitials name={data.name} size="m" />
                                {:else}
                                    <Avatar alt="avatar" size="m">
                                        <Icon icon={IconMinusSm} size="s" />
                                    </Avatar>
                                {/if}

                                <Layout.Stack alignItems="flex-start" gap="xxs">
                                    <Layout.Stack style="padding-left: 0.25rem;">
                                        <Link.Anchor
                                            variant="quiet"
                                            href={role.startsWith('user')
                                                ? `${base}/project-${page.params.region}-${page.params.project}/auth/user-${id}`
                                                : `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${id}`}>
                                            <Typography.Text
                                                size="s"
                                                color="--fgcolor-neutral-primary">
                                                {formatName(
                                                    data.name ?? data?.email ?? data?.phone ?? '-',
                                                    $isSmallViewport ? 12 : 24
                                                )}
                                            </Typography.Text>
                                        </Link.Anchor>
                                    </Layout.Stack>
                                    <InteractiveText
                                        isVisible
                                        variant="copy"
                                        text={id}
                                        value={id} />
                                </Layout.Stack>
                            </Layout.Stack>

                            {#if isUser && (data.email || data.phone)}
                                <Divider />
                                <Layout.Stack gap="xs" alignItems="flex-start">
                                    {#if data.email}
                                        <Typography.Text
                                            size="xs"
                                            color="--fgcolor-neutral-secondary">
                                            Email: {data.email}
                                        </Typography.Text>
                                    {/if}
                                    {#if data.phone}
                                        <Typography.Text
                                            size="xs"
                                            color="--fgcolor-neutral-secondary">
                                            Phone: {data.phone}
                                        </Typography.Text>
                                    {/if}
                                </Layout.Stack>
                            {/if}
                        </Layout.Stack>
                    {/await}
                </Layout.Stack>
            {/if}
        </div>
    </Popover>
{/if}
