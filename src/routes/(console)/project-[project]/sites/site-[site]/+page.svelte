<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms/index.js';
    import { sdk } from '$lib/stores/sdk.js';

    export let data;
    let files = null;

    async function fuckingDeployment() {
        try {
            console.log(files);
            await sdk.forProject.sites.createDeployment($page.params.site, files[0], true);
            console.log('success');
        } catch (e) {
            console.log(e);
        }
    }
</script>

{JSON.stringify(data.site)}

<input type="file" name="" id="" bind:files />

<div>
    <Button on:click={fuckingDeployment}>Fucking deploy me</Button>
</div>

<img
    height="200px"
    width="200px"
    src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHE5dWx3aWhjampzampvdGw0emh6ZnYzaWpxNzFrdmU3bGw0N2V5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9JrkkDoJuU0FbdbUZU/giphy.gif"
    alt="" />
