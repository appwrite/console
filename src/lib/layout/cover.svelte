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
