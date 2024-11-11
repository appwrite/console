<script lang="ts">
    import { Card, Layout, Typography, Input } from '@appwrite.io/pink-svelte';
    import { CustomId } from '$lib/components/index.js';

    let showCustomId = true;
    let id: string;
</script>

<Card.Base variant="primary"
    ><Layout.Stack direction="column" gap="xxl">
        <Typography.Title size="l">Create your project</Typography.Title>
        <form>
            <div>
                <Input.Text label="Name" placeholder="Project name" />
                <CustomId bind:show={showCustomId} name="Project" isProject bind:id />
            </div>
        </form>
    </Layout.Stack></Card.Base>
