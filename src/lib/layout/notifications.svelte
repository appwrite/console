<script lang="ts">
	import Notification from './notification.svelte';
	import { dismissNotification, notifications } from '../stores/notifications';
</script>

{#if $notifications}
	<section class="toaster">
		<ul class="toaster-list">
			{#each $notifications as notification (notification.id)}
				<Notification
					type={notification.type}
					on:dismiss={() => dismissNotification(notification.id)}
				>
					{notification.message}
				</Notification>
			{/each}
		</ul>
	</section>
{/if}

<style lang="scss">
	section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		margin-bottom: 0.5rem;
	}
</style>
