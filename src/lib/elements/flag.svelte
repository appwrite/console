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
        let flag = sdk.forProject.avatars
            .getFlag(country, width * 2, height * 2, quality)
            ?.toString();
        flag?.includes('&project=')
            ? (flag = flag.replace('&project=', '&mode=admin'))
            : flag + '&mode=admin';
        return flag;
    }
</script>

<img
    style="border-radius: 2.5px"
    src={getFlag(flag, width, height, quality)}
    alt={name}
    class={classes}
    {width}
    {height} />
