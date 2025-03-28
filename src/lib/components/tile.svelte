<script lang="ts">
    export let href: string;
    export let title: string;
</script>

<li class="tile">
    <a class="card" {href}>
        <h2 class="tiles-title">{title}</h2>
        <span class="icon-right-open" aria-hidden="true"></span>
    </a>
</li>
