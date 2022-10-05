<script lang="ts">
    import { page } from '$app/stores';
    import { GridItem1 } from '$lib/components';
    import Code from '$lib/components/code.svelte';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { project } from '../../store';
    import Create from './create.svelte';

    let show = false;

    const path = `/console/project-${$page.params.project}/overview/platforms`;
</script>

<Code
    showLineNumbers
    showCopy
    label="Web SDK"
    language="js"
    code={`import { Client, Account } from "appwrite";

const client = new Client();

const account = new Account(client);

client
    .setEndpoint('https://[HOSTNAME_OR_IP]/v1') // Your API Endpoint
    .setProject('5df5acd0d48c2') // Your project ID
;

const promise = account.create('[USER_ID]', 'email@example.com', 'password');

promise.then(function (response) {
    console.log(response); // Success
}, function (error) {
    console.log(error); // Failure
});`} />

<div class="common-section u-flex u-gap-12">
    <h3 class="heading-level-7">Platforms</h3>
    <span class="u-margin-inline-start-auto">
        <Button on:click={() => (show = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Add Platform</span>
        </Button>
    </span>
</div>

<div class="grid-box u-margin-block-start-32" style="--grid-gap:2rem; --grid-item-size:25rem;">
    {#each $project.platforms as platform}
        <GridItem1 href={`${path}/${platform.$id}`}>
            <svelte:fragment slot="title">{platform.name}</svelte:fragment>

            <div class="grid-item-1-end-start">
                <p>Last Updated</p>
                <p>{toLocaleDateTime(platform.$updatedAt)}</p>
            </div>
        </GridItem1>
    {/each}
</div>

<Create bind:show />
