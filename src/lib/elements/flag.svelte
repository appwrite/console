<script lang="ts">
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { sdk } from '$lib/stores/sdk';
    import { Flag } from '@appwrite.io/console';

    export let flag: string;
    export let name: string = flag;
    export let width = 40;
    export let height = 30;
    export let quality = 100;
    let classes: string = '';
    export { classes as class };

    export function getFlag(country: string, width: number, height: number, quality: number) {
        if (!isValueOfStringEnum(Flag, country)) return '';
        return sdk.forConsole.avatars
            .getFlag(country, width * 2, height * 2, quality)
            ?.toString()
            ?.replace('&project=console', '&mode=admin');
    }
</script>

<img
    style="border-radius: 2.5px"
    src={getFlag(flag, width, height, quality)}
    alt={name}
    class={classes}
    {width}
    {height} />
