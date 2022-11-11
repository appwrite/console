<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { tick } from 'svelte';
    import { AvatarInitials } from '../';
    import Output from '../output.svelte';

    export let role: string;

    let content: HTMLDivElement;
    let data = null;

    async function getData(
        permission: string
    ): Promise<Partial<Models.User<Record<string, unknown>> & Models.Team>> {
        const role = permission.split(':')[0];
        const id = permission.split(':')[1].split('/')[0];
        if (role === 'user') {
            const user = await sdkForProject.users.get(id);
            return user;
        }
        if (role === 'team') {
            const team = await sdkForProject.teams.get(id);
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
                    onTrigger(instance) {
                        instance.hide();
                        getData(role)
                            .then((n) => {
                                data = n;
                            })
                            .finally(() => {
                                tick().then(() => {
                                    instance.setContent(content.innerHTML);
                                    instance.show();
                                });
                            });
                    }
                }}>
                {role}
            </div>
            <div class="u-hide" bind:this={content}>
                {#if data}
                    <div class="user-profile">
                        <AvatarInitials name={data.name} size={40} />
                        <span class="user-profile-info is-only-desktop">
                            <span class="name">
                                {data.name
                                    ? data.name
                                    : data?.email
                                    ? data?.email
                                    : data?.phone
                                    ? data?.phone
                                    : '-'}
                            </span>
                            <Output value={data.$id}>{role}</Output>
                        </span>

                        <span class="user-profile-sep" />

                        <span class="user-profile-empty-column" />
                        <span class="user-profile-info is-only-desktop">
                            {#if role.startsWith('user')}
                                <p class="text u-x-small">{data?.email}</p>
                                <p class="text u-x-small">{data?.phone}</p>
                            {:else if role.startsWith('team')}
                                <p class="text u-x-small">Members: {data?.total}</p>
                            {/if}
                        </span>
                    </div>
                {:else}
                    Not found.
                {/if}
            </div>
        {/if}
    </div>
</div>

<style lang="scss" global>
    .tippy-user .tippy-box {
        --p-drop-bg-color: var(--color-neutral-500);
        --p-drop-border-color: var(--color-neutral-200);

        body.theme-light & {
            --p-drop-bg-color: var(--color-neutral-0);
            --p-drop-border-color: var(--color-neutral-10);
        }

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
