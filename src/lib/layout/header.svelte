<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { user } from '$lib/stores/user';

	$: currentProject = $page.params.project;

	const onChange = async (event: Event) => {
		const target = event.target as HTMLSelectElement;
		await goto(`/console/${target.value}`);
	};
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
			<button class="transparent-button" on:click={() => goto('/console/@me')}>
				<span class="link is-only-desktop">{$user.name}</span>
				<img
					class="user-image"
					src={sdkForConsole.avatars.getInitials($user.name, 40, 40).toString()}
					alt=""
				/>
			</button>
		{/if}
	</div>
</div>
