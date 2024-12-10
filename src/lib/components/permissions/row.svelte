<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { tick } from 'svelte';
    import { AvatarInitials } from '../';
    import Output from '../output.svelte';
    import { page } from '$app/stores';

    export let role: string;

    let content: HTMLDivElement;
    let data = null;
    let isFetching = false;

    async function getData(
        permission: string
    ): Promise<
        Partial<Models.User<Record<string, unknown>> & Models.Team<Record<string, unknown>>>
    > {
        const role = permission.split(':')[0];
        const id = permission.split(':')[1].split('/')[0];
        if (role === 'user') {
            const user = await sdk
                .forProject($page.params.region, $page.params.project)
                .users.get(id);
            return user;
        }
        if (role === 'team') {
            const team = await sdk
                .forProject($page.params.region, $page.params.project)
                .teams.get(id);
            return team;
        }
    }
</script>

<div class="u-flex u-cross-center u-gap-8 tippy-user">
    <div>
        {#if role === 'users'}
            <div>Users</div>
        {:else if role === 'guests'}
            <div>Guests</div>
        {:else if role === 'any'}
            <div>Any</div>
        {:else}
            <div
                class="u-trim-1"
                use:tooltip={{
                    interactive: true,
                    allowHTML: true,
                    onShow(instance) {
                        if (isFetching || data) {
                            return;
                        }

                        getData(role)
                            .then((n) => {
                                data = n;
                            })
                            .finally(() => {
                                tick().then(() => {
                                    instance.setContent(content);
                                });
                            });
                    }
                }}>
                {role}
            </div>
            <div class="u-hide">
                <div bind:this={content}>
                    {#if data}
                        {@const isUser = role.startsWith('user')}
                        {@const isTeam = role.startsWith('team')}
                        {@const isAnonymous = !data.email && !data.phone && isUser}
                        <div class="user-profile">
                            {#if isAnonymous}
                                <div class="avatar is-size-small">
                                    <span class="icon-anonymous" aria-hidden="true" />
                                </div>
                            {:else if data.name}
                                <AvatarInitials name={data.name} size={40} />
                            {:else}
                                <div class="avatar is-size-small">
                                    <span class="icon-minus-sm" aria-hidden="true" />
                                </div>
                            {/if}
                            <span class="user-profile-info is-only-desktop">
                                <span class="name">
                                    {data.name ?? data?.email ?? data?.phone ?? '-'}
                                </span>
                                <Output value={data.$id}>{role}</Output>
                            </span>
                            {#if (isUser && (data?.email || data?.phone)) || isTeam}
                                <span class="user-profile-sep" />

                                <span class="user-profile-empty-column" />
                                <span class="user-profile-info is-only-desktop">
                                    {#if isUser}
                                        <div class="u-grid u-gap-4">
                                            {#if data?.email}
                                                <p class="text u-x-small">Email: {data?.email}</p>
                                            {/if}
                                            {#if data?.phone}
                                                <p class="text u-x-small">Phone: {data?.phone}</p>
                                            {/if}
                                        </div>
                                    {:else if isTeam}
                                        <p class="text u-x-small">Members: {data?.total}</p>
                                    {/if}
                                </span>
                            {/if}
                        </div>
                    {:else}
                        Not found.
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- svelte-ignore css-unused-selector -->
<style lang="scss" global>
    .tippy-user .tippy-box {
        --p-drop-bg-color: var(--color-neutral-105);
        --p-drop-border-color: var(--color-neutral-85);

        inset-inline-start: -0.625rem;
        inset-block-end: calc(100% + 0.625rem);
        background-color: hsl(var(--p-drop-bg-color));
        border: solid 0.0625rem hsl(var(--p-drop-border-color));
        border-radius: var(--border-radius-small);
        box-shadow: var(--shadow-small);
        font-size: var(--font-size-0);
        color: hsl(var(--p-body-text-color));
        max-inline-size: 32.5rem;
        margin-inline: auto;
        line-height: 1.5;

        body.theme-light & {
            --p-drop-bg-color: var(--color-neutral-0);
            --p-drop-border-color: var(--color-neutral-10);
        }

        .tippy-content {
            padding: 1rem;
        }

        &[data-placement^='top'] > .tippy-arrow::before {
            border-top-color: hsl(var(--p-drop-bg-color));
        }
        &[data-placement^='bottom'] > .tippy-arrow::before {
            border-bottom-color: hsl(var(--p-drop-bg-color));
        }
        &[data-placement^='left'] > .tippy-arrow::before {
            border-left-color: hsl(var(--p-drop-bg-color));
        }
        &[data-placement^='right'] > .tippy-arrow::before {
            border-right-color: hsl(var(--p-drop-bg-color));
        }
    }
</style>
