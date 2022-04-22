<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { DropList, DropListItem, DropListLink, Avatar } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';

    $: currentProject = $page.params.project;

    const onChange = async (event: Event) => {
        const target = event.target as HTMLSelectElement;
        await goto(`${base}/console/${target.value}`);
    };
    const toggleTheme = () => {
        $app.theme = $app.theme === 'light' ? 'dark' : 'light';
    };

    let showDropdown = false;
</script>

<div class="console-header">
    <div class="start">
        {#if currentProject}
            <div class="select is-only-desktop">
                <select on:change={onChange}>
                    {#await sdkForConsole.projects.list() then { projects }}
                        {#each projects as project}
                            <option value={project.$id} selected={currentProject === project.$id}>
                                {project.name}
                            </option>
                        {/each}
                    {/await}
                </select>
                <span class="icon-down-open" aria-hidden="true" />
            </div>

            <button class="button is-only-icon" aria-label="Create Project">
                <span class="icon-plus" aria-hidden="true" />
            </button>
        {/if}
    </div>
    <div class="end">
        {#if $user}
            <DropList bind:show={showDropdown} position="bottom" horizontal="left">
                <button class="transparent-button" on:click={() => (showDropdown = !showDropdown)}>
                    <span class="is-only-desktop">{$user.name}</span>
                    <Avatar
                        size={50}
                        src={sdkForConsole.avatars.getInitials($user.name, 50, 50).toString()} />
                </button>
                <svelte:fragment slot="list">
                    <DropListLink href="/console/$me" icon="user">Your Account</DropListLink>
                    <DropListItem
                        on:click={toggleTheme}
                        icon={$app.theme === 'light' ? 'sun-inv' : 'moon-inv'}>
                        Toggle Theme
                    </DropListItem>
                </svelte:fragment>
            </DropList>
        {/if}
    </div>
</div>
