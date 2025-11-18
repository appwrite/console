<script lang="ts">
    import { type ComponentProps, type Snippet } from 'svelte';
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

    type PermissionData = Partial<Models.User & Models.Team> & {
        notFound?: boolean;
        roleName?: string;
        customName?: string;
    };

    const permissionDataCache: Map<string, Promise<PermissionData>> = new Map();

    interface Props {
        role: string;
        placement?: ComponentProps<Popover>['placement'];
        children?: Snippet;
    }

    let { role, placement = 'bottom-start', children }: Props = $props();

    type ParsedPermission = {
        type: 'user' | 'team' | 'other';
        id: string;
        roleName?: string;
        isValid: boolean;
    };

    function parsePermission(permission: string): ParsedPermission {
        try {
            const [type, rest] = permission.split(':');
            if (!rest) {
                return { type: 'other', id: permission, isValid: false };
            }

            const [id, roleName] = rest.split('/');
            if (!id) {
                return { type: 'other', id: permission, isValid: false };
            }

            if (type === 'user' || type === 'team') {
                return {
                    type: type as 'user' | 'team',
                    id,
                    roleName,
                    isValid: true
                };
            }

            return { type: 'other', id: permission, isValid: false };
        } catch (error) {
            return { type: 'other', id: permission, isValid: false };
        }
    }

    async function fetchPermissionData(parsed: ParsedPermission): Promise<PermissionData> {
        if (!parsed.isValid || parsed.type === 'other') {
            return { notFound: true, roleName: parsed.roleName, customName: parsed.id };
        }

        if (parsed.type === 'user') {
            try {
                return await sdk
                    .forProject(page.params.region, page.params.project)
                    .users.get({ userId: parsed.id });
            } catch (error) {
                return { notFound: true, roleName: parsed.roleName, customName: parsed.id };
            }
        }

        if (parsed.type === 'team') {
            try {
                return await sdk
                    .forProject(page.params.region, page.params.project)
                    .teams.get({ teamId: parsed.id });
            } catch (error) {
                return { notFound: true, roleName: parsed.roleName, customName: parsed.id };
            }
        }

        return { notFound: true, roleName: parsed.roleName, customName: parsed.id };
    }

    async function getData(permission: string): Promise<PermissionData> {
        const cached = permissionDataCache.get(permission);
        if (cached) return cached;

        const parsed = parsePermission(permission);
        const fetchPromise = fetchPermissionData(parsed);

        permissionDataCache.set(permission, fetchPromise);
        return fetchPromise;
    }

    let isMouseOverTooltip = $state(false);
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

    function isCustomPermission(role: string): boolean {
        const parsed = parsePermission(role);
        return !!parsed.roleName || !parsed.isValid;
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
            type="button"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            onmouseenter={() => {
                if (!$menuOpen) {
                    setTimeout(show, 150);
                }
            }}
            onmouseleave={() => hidePopover(hide)}>
            {@render children?.()}
            {#if isCustomPermission(role)}
                <Typography.Text style="text-decoration: underline;">
                    {formatName(role, $isSmallViewport ? 8 : 15)}
                </Typography.Text>
            {:else}
                <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                    <Typography.Text>
                        {#await getData(role)}
                            {role}
                        {:then data}
                            {formatName(
                                data.name ?? data?.email ?? data?.phone ?? '-',
                                $isSmallViewport ? 16 : 18
                            )}
                        {/await}
                    </Typography.Text>
                    <Badge
                        size="xs"
                        variant="secondary"
                        content={role.startsWith('user') ? 'User' : 'Team'} />
                </Layout.Stack>
            {/if}
        </button>

        <div
            let:hide
            let:showing
            slot="tooltip"
            role="tooltip"
            class="popover"
            onmouseenter={() => (isMouseOverTooltip = true)}
            onmouseleave={() => hidePopover(hide, false)}>
            {#if showing}
                <Layout.Stack gap="s" alignContent="flex-start">
                    {#await getData(role)}
                        <Layout.Stack alignItems="center">
                            <Spinner />
                        </Layout.Stack>
                    {:then data}
                        {#if data.notFound}
                            <Layout.Stack gap="s" alignItems="flex-start">
                                <Layout.Stack
                                    direction="row"
                                    gap="s"
                                    alignItems="center"
                                    justifyContent="flex-start">
                                    <Avatar alt="avatar" size="m">
                                        <Icon icon={IconMinusSm} size="s" />
                                    </Avatar>

                                    <Layout.Stack alignItems="flex-start" gap="xxs">
                                        <Layout.Stack style="padding-left: 0.25rem;">
                                            <Typography.Text
                                                size="m"
                                                color="--fgcolor-neutral-primary">
                                                {data.customName}
                                            </Typography.Text>
                                        </Layout.Stack>
                                        {#if data.roleName}
                                            <InteractiveText
                                                isVisible
                                                variant="copy"
                                                text={data.roleName}
                                                value={data.roleName} />
                                        {:else}
                                            <InteractiveText
                                                isVisible
                                                variant="copy"
                                                text={role}
                                                value={role} />
                                        {/if}
                                    </Layout.Stack>
                                </Layout.Stack>
                            </Layout.Stack>
                        {:else}
                            {@const isUser = role.startsWith('user')}
                            {@const isAnonymous =
                                !data.email && !data.phone && !data.name && isUser}
                            {@const parsed = parsePermission(role)}
                            {@const id = parsed.id}

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
                                                    size="m"
                                                    color="--fgcolor-neutral-primary">
                                                    {formatName(
                                                        data.name ??
                                                            data?.email ??
                                                            data?.phone ??
                                                            '-',
                                                        $isSmallViewport ? 18 : 24
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
                                    <Layout.Stack gap="xxs" alignItems="flex-start">
                                        {#if data.email}
                                            <Typography.Text
                                                size="xs"
                                                variant="m-400"
                                                color="--fgcolor-neutral-secondary">
                                                Email: {data.email}
                                            </Typography.Text>
                                        {/if}
                                        {#if data.phone}
                                            <Typography.Text
                                                size="xs"
                                                variant="m-400"
                                                color="--fgcolor-neutral-secondary">
                                                Phone: {data.phone}
                                            </Typography.Text>
                                        {/if}
                                    </Layout.Stack>
                                {/if}
                            </Layout.Stack>
                        {/if}
                    {/await}
                </Layout.Stack>
            {/if}
        </div>
    </Popover>
{/if}

<style lang="scss">
    .popover {
        display: flex;
        width: 280px;
        min-width: 260px;
        padding: var(--space-5, 10px) var(--space-6, 12px);
        align-items: flex-start;
        gap: var(--gap-XXS, 4px);
        margin: -1rem;
    }
</style>
