<script lang="ts">
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { sdk } from '$lib/stores/sdk';
    import { CreditCard } from '@appwrite.io/console';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconCreditCard } from '@appwrite.io/pink-icons-svelte';

    export let brand: string;
    export let width = 23;
    export let height = 16;

    $: ccImage = isValueOfStringEnum(CreditCard, brand)
        ? sdk.forConsole.avatars.getCreditCard({
              code: brand,
              width,
              height
          })
        : '';
</script>

{#if ccImage}
    <img alt={brand} src={ccImage} {width} {height} style:border-radius="2.5px" />
{:else}
    <Icon icon={IconCreditCard} color="--fgcolor-neutral-tertiary" />
{/if}
