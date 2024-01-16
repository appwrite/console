<script lang="ts">
    import { sdk } from '$lib/stores/sdk';

    export let brand: string;
    export let width = 23;
    export let height = 16;

    function getCreditCardImage(brand: string, width = 46, height = 32) {
        if (!brand) return '';
        return sdk.forConsole.avatars.getCreditCard(brand, width, height).toString();
    }
</script>

<img style="border-radius: 2.5px" {width} {height} src={getCreditCardImage(brand)} alt={brand} />
