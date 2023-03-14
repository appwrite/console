<script lang="ts">
    export let isSticky = false;
</script>

<div class="table-with-scroll u-margin-block-start-32" data-private>
    <div class="table-wrapper">
        <table class="table" class:is-sticky-scroll={isSticky}>
            <slot />
        </table>
    </div>
</div>
