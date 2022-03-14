<script lang="ts">
	import { addNotification } from '$lib/stores/notifications';

	export let value: string;

	const copy = async () => {
		try {
			if (navigator.clipboard === undefined) {
				//TODO: add fallback to old methods
				throw new Error('Clipboard API only available to SSL');
			}

			await navigator.clipboard.writeText(value);
		} catch (error) {
			addNotification({
				message: error.message,
				type: 'error'
			});
		}
	};
</script>

<div class="input-text-wrapper is-with-end-button">
	<input {value} type="text" class="input-text" disabled />
	<button type="button" class="input-button" aria-label="Click to copy." on:click={copy}>
		<span class="icon-docs" aria-hidden="true" />
	</button>
</div>
