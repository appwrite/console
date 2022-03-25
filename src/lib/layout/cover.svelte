<script lang="ts">
	export let adjustContentToCover = false;
</script>

<div class="top-cover" class:is-adjust-content-to-cover={adjustContentToCover}>
	<div class="container">
		<slot name="breadcrumbs" />
		<h1 class="main-title">
			<slot name="title" />
		</h1>
		<slot />
	</div>
</div>
