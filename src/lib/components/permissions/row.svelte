<script lang="ts">
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { AvatarInitials, DropList } from '../';
    import Output from '../output.svelte';

    export let role: string;
    export let showDropdown = false;

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

<div class="u-flex u-cross-center u-gap-8">
    <div>
        {#if role === 'users'}
            <div>Users</div>
        {:else if role === 'guests'}
            <div>Guests</div>
        {:else if role === 'any'}
            <div>Any</div>
        {:else}
            <DropList bind:show={showDropdown} placement="bottom-start" isHover>
                <div>
                    {role}
                </div>
                <svelte:fragment slot="list">
                    {#await getData(role) then data}
                        <div class="u-flex u-cross-center u-gap-16">
                            <AvatarInitials name={data.name} size={40} />
                            <div>
                                <p class="text body-text-1">
                                    {data.name
                                        ? data.name
                                        : data?.email
                                        ? data?.email
                                        : data?.phone
                                        ? data?.phone
                                        : '-'}
                                </p>
                                <Output value={data.$id}>{role}</Output>
                            </div>
                        </div>
                        {#if data?.email || data?.phone}
                            <p class="text u-small">{data?.email}</p>
                            <p class="text u-small">{data?.phone}</p>
                        {:else if data?.total}
                            <p class="text u-small">Members:{data?.total}</p>
                        {/if}
                    {/await}
                </svelte:fragment>
            </DropList>
        {/if}
    </div>
</div>
