<script lang="ts">
	export let avatar: string;
</script>

<li class="sessions-item">
	<article class="card">
		<img class="sessions-item-image avatar" src={avatar} alt="" />
		<header class="sessions-item-header">
			<slot name="header" />
		</header>
		<p class="sessions-item-info">
			<slot name="info" />
		</p>
		<slot name="action" />
	</article>
</li>
