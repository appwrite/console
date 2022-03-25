<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { sdkForConsole, setProject } from '$lib/stores/sdk';
	import { collection } from './database/collection/[collection]/store';
	import { UploadBox } from '$lib/components';
	import { project } from './store';
	import type { Models } from 'src/sdk';

	type Attributes =
		| Models.AttributeBoolean
		| Models.AttributeEmail
		| Models.AttributeEnum
		| Models.AttributeFloat
		| Models.AttributeInteger
		| Models.AttributeIp
		| Models.AttributeString
		| Models.AttributeUrl;

	$: projectId = $page.params.project;
	$: {
		setProject(projectId);
		if (browser) {
			project.load(projectId);
		}
	}
	if (browser) {
		sdkForConsole.subscribe<Attributes | Models.Index>('console', (message) => {
			switch (message.event) {
				case 'database.attributes.create':
					collection.addAttribute(<Attributes>message.payload);
					break;

				case 'database.attributes.update':
					collection.updateAttribute(<Attributes>message.payload);
					break;

				case 'database.attributes.delete':
					collection.removeAttribute(<Attributes>message.payload);
					break;
			}
		});
	}
</script>

{#if $project}
	<slot />
{:else}
	loading
{/if}
<UploadBox />
