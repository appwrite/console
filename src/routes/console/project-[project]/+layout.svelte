<script lang="ts">
    import { browser } from '$app/environment';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { collection } from './databases/database/[database]/collection/[collection]/store';
    import { UploadBox } from '$lib/components';
    import type { Models } from '@aw-labs/appwrite-console';
    import { project } from './store';
    import { organization } from '$lib/stores/organization';

    type Attributes =
        | Models.AttributeBoolean
        | Models.AttributeEmail
        | Models.AttributeEnum
        | Models.AttributeFloat
        | Models.AttributeInteger
        | Models.AttributeIp
        | Models.AttributeString
        | Models.AttributeUrl;

    // TODO: move to database routes
    if (browser) {
        sdkForConsole.client.subscribe<Attributes | Models.Index>('console', (message) => {
            if (message.events.includes('databases.*.collections.*.attributes.*.create')) {
                collection.addAttribute(<Attributes>message.payload);

                return;
            }

            if (message.events.includes('databases.*.collections.*.attributes.*.update')) {
                collection.updateAttribute(<Attributes>message.payload);

                return;
            }

            if (message.events.includes('databases.*.collections.*.attributes.*.delete')) {
                collection.removeAttribute(<Attributes>message.payload);

                return;
            }
        });
    }
</script>

{#if $project && $organization}
    <slot />
{:else}
    loading
{/if}

<UploadBox />
