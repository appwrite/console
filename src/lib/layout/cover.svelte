<script lang="ts">
    export let adjustContentToCover = false;
</script>

<div class="top-cover" class:is-adjust-content-to-cover={adjustContentToCover}>
    <div class="container">
        <h1 class="heading-level-1">
            <slot name="title" />
        </h1>
        <slot />
    </div>
</div>

<style lang="scss">
    .top-cover {
        .container {
            padding-bottom: 0;
        }

        .heading-level-1 {
            margin-bottom: 2rem;
        }
    }
</style>
