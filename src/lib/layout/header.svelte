<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DropList from '$lib/components/dropList.svelte';
	import DropListItem from '$lib/components/dropListItem.svelte';
	import DropListLink from '$lib/components/dropListLink.svelte';
	import { app } from '$lib/stores/app';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { user } from '$lib/stores/user';

	$: currentProject = $page.params.project;

	const onChange = async (event: Event) => {
		const target = event.target as HTMLSelectElement;
		await goto(`/console/${target.value}`);
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
					<img
						class="user-image"
						src={sdkForConsole.avatars.getInitials($user.name, 40, 40).toString()}
						alt=""
					/>
				</button>
				<svelte:fragment slot="list">
					<DropListLink href="/console/@me" icon="user">Your Account</DropListLink>
					<DropListItem
						on:click={toggleTheme}
						icon={$app.theme === 'light' ? 'sun-inv' : 'moon-inv'}
					>
						Toggle Theme
					</DropListItem>
				</svelte:fragment>
			</DropList>
		{/if}
	</div>
</div>
