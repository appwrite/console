<script lang="ts">
    export let href: string;
    export let disabled = false;
</script>

<li class="drop-tabs-item">
    <a class="drop-tabs-button" {disabled} {href}>
        <span class="text"><slot /></span>
    </a>
</li>
