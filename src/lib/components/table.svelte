<script lang="ts">
	export let columns: {
		key: string;
		title: string;
	}[] = [];

	export let data = [];
	export let anchor = '';
	export let anchorReplace: {
		[key: string]: string;
	} = null;

	const createLink = (entry) => {
		let link = anchor;
		for (const key in anchorReplace) {
			link = link.replace(anchorReplace[key], entry[key]);
		}

		return link;
	};
</script>

<table>
	<thead>
		<tr>
			{#each columns as column}
				<td>{column.title}</td>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each data as entry}
			<tr>
				{#each columns as column}
					<td>
						{#if anchor}
							<a href={createLink(entry)}>
								{entry[column.key] ?? 'n/a'}
							</a>
						{:else}
							{entry[column.key] ?? 'n/a'}
						{/if}
					</td>
				{/each}
			</tr>
		{:else}
			nothing found
		{/each}
	</tbody>
	<tfoot>
		<tr />
	</tfoot>
</table>
