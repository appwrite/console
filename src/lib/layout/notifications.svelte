<script lang="ts">
	import Notification from './notification.svelte';
	import { dismissNotification, notifications } from '../stores/notifications';
</script>

{#if $notifications}
	<section>
		{#each $notifications as notification (notification.id)}
			<Notification
				type={notification.type}
				dismissible={notification.dismissible}
				on:dismiss={() => dismissNotification(notification.id)}
			>
				{notification.message}
			</Notification>
		{/each}
	</section>
{/if}

<style lang="scss">
	section {
		position: fixed;
		bottom: 0;
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
