<script lang="ts">
    export let href: string;
    export let title: string;
</script>

<div class="table-col" data-title={title} role="cell">
    <a role="button" tabindex="0" class="link" {href}><slot /></a>
</div>
