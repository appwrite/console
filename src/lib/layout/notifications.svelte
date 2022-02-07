<script lang="ts">
	import Notification from './notification.svelte';

	import { dismissToast, toasts } from '../stores/notifications';
</script>

{#if $toasts}
	<section>
		{#each $toasts as toast (toast.id)}
			<Notification
				type={toast.type}
				dismissible={toast.dismissible}
				on:dismiss={() => dismissToast(toast.id)}
			>
				{toast.message}
			</Notification>
		{/each}
	</section>
{/if}

<style lang="postcss">
	section {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		display: flex;
		margin-top: 1rem;
		justify-content: center;
		flex-direction: column;
		z-index: 1000;
	}
</style>
