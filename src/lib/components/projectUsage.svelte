<script lang="ts">
    import { Card, Heading, ProgressBar } from '.';
    export let title: string;
    export let data: {
        name: string;
        icon: string;
        unit: string;
        max: number;
        used: number;
        status: null | 'warning' | 'error';
    }[];
</script>

<Card>
    <div class="grid-item-1">
        <div class="grid-item-1-start-start">
            <div class="eyebrow-heading-3"><slot name="eyebrow" /></div>
            <Heading tag="h2" size="7">{title}</Heading>
        </div>
        <div class="grid-item-1-start-end">status</div>

        <div class="grid-item-1-end-start">
            <ul class="u-flex-vertical u-gap-24">
                {#each data as project}
                    <li>
                        <ProgressBar
                            name={project.name}
                            max={project.max}
                            used={project.used}
                            unit={project.unit}
                            icon={project.icon} />
                    </li>
                {/each}
            </ul>
        </div>
        <div class="grid-item-1-end-end">
            <a href="https://#">More details</a>
        </div>
    </div>
</Card>
