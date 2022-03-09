<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Notification } from '../stores/notifications';

	export let type: Notification['type'] = 'info';

	const dispatch = createEventDispatcher();
</script>

<li class="toaster-item">
	<div class={`toaster-message is-${type}`}>
		<button class="x-button" on:click={() => dispatch('dismiss')}>
			<span class="icon-cancel" aria-hidden="true" />
		</button>
		<span class="text">
			<slot />
		</span>
	</div>
</li>
