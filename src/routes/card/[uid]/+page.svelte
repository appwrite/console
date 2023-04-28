<script lang="ts">
    import Display from '../display.svelte';
    import { getCardImgUrls } from '../helpers';

    export let data;

    const { ogImg } = getCardImgUrls(data.userId);
</script>

<Display userId={data.userId} variant="external" />
