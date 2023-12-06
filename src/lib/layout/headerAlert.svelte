<script lang="ts">
    export let title: string;
    export let type: 'info' | 'success' | 'warning' | 'error' | 'default' = 'info';
</script>

<section
    class="alert is-action is-action-and-top-sticky u-sep-block-end"
    class:is-success={type === 'success'}
    class:is-warning={type === 'warning'}
    class:is-danger={type === 'error'}
    class:is-info={type === 'info'}>
    <div class="alert-grid">
        <span class="icon-info" aria-hidden="true" />
        <div class="alert-content">
            {#if title || $$slots.title}
                <h6 class="alert-title">
                    <slot name="title">
                        {title}
                    </slot>
                </h6>
            {/if}
            <p class="alert-message">
                <slot />
            </p>
        </div>
        {#if $$slots.buttons}
            <div class="alert-buttons u-flex u-gap-16 u-cross-child-center">
                <slot name="buttons" />
            </div>
        {/if}
    </div>
</section>
