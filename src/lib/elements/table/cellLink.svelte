<script lang="ts">
    export let href: string;
    export let title: string;
    export let main = false;
</script>

<div class="table-col" class:is-main={main} data-title={title} role="cell">
    <a role="button" tabindex="0" class="link" {href}><slot /></a>
</div>
