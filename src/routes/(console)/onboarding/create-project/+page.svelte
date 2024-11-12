<script lang="ts">
    import { Card, Layout, Typography, Input } from '@appwrite.io/pink-svelte';
    import { CustomId } from '$lib/components/index.js';

    let showCustomId = true;
    let id: string;
</script>

<div class="page-container u-flex-vertical u-cross-child-center u-main-center u-cross-center">
    <img
        src="/console/images/appwrite-logo-light.svg"
        width="120"
        height="22"
        class="u-only-light"
        alt="Appwrite Logo" />
    <img
        src="/console/images/appwrite-logo-dark.svg"
        width="120"
        height="22"
        class="u-only-dark"
        alt="Appwrite Logo" />
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
</div>

<style>
    .page-container {
        width: 700px;
        min-height: 100vh;
        gap: 4.5rem;
    }
</style>
