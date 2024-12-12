<script lang="ts">
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { sdk } from '$lib/stores/sdk';
    import { CreditCard } from '@appwrite.io/console';

    export let brand: string;
    export let width = 23;
    export let height = 16;

    function getCreditCardImage(brand: string, width = 46, height = 32) {
        if (!isValueOfStringEnum(CreditCard, brand)) return '';
        return sdk.forConsole.avatars.getCreditCard(brand, width, height);
    }
</script>

<img style="border-radius: 2.5px" {width} {height} src={getCreditCardImage(brand)} alt={brand} />
