<script lang="ts">
    import type { ProgressbarProps } from '$lib/components';

    type $$Props = ProgressbarProps;

    /**
     * The max value of the progressbar
     */
    export let maxSize: $$Props['maxSize'];

</script>
<section class="progressbar__container">

</section>


<style lang="scss">
    @use './progressbar';
    @include progressbar.base;
</style>