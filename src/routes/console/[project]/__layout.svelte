<script lang="ts">
	import { browser } from '$app/env';

	import { page } from '$app/stores';
	import { sdkForConsole, setProject } from '$lib/stores/sdk';
	import type { Models } from 'src/sdk';
	import { collection } from './database/[collection]/store';
	import { project } from './store';

	$: projectId = $page.params.project;
	$: {
		setProject(projectId);
		if (browser) {
			project.load(projectId);
		}
	}

	if (browser) {
		sdkForConsole.subscribe<Models.Attributes | Models.Index>('console', (message) => {
			switch (message.event) {
				case 'database.attributes.create':
					collection.addAttribute(<Models.Attributes>message.payload);
					break;

				case 'database.attributes.update':
					collection.updateAttribute(<Models.Attributes>message.payload);
					break;

				case 'database.attributes.delete':
					collection.removeAttribute(<Models.Attributes>message.payload);
					break;
			}
		});
	}
</script>

<slot />
