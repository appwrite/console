<script context="module">
	import { base } from '$app/paths';

	export const load = async () => ({
		status: 302,
		redirect: `${base}/login`
	});
</script>
