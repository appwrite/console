<script lang="ts">
    export let name: string;
    export let group: string;
    export let value: unknown;
    export let disabled = false;
    export let padding: number = 1;
    export let icon: string = null;
</script>

<label class="card is-allow-focus u-cursor-pointer" style={`--card-padding:${padding}rem`}>
    <div class="u-flex u-gap-16">
        <input type="radio" {name} disabled bind:group bind:value />
        <div class="u-flex u-flex-vertical u-gap-4">
            <h4 class="body-text-2"><slot name="title" /></h4>
            <p class="u-color-text-gray">
                <slot />
            </p>
        </div>
        {#if icon}
            <span class={`icon-${icon} u-margin-inline-start-auto`} aria-hidden="true" />
        {/if}
    </div>
</label>
