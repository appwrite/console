<script lang="ts">
    import { CardGrid, Heading, AvatarInitials } from '$lib/components';
    import { Container } from '$lib/layout';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { team } from './store';
    import UpdatePrefs from './updatePrefs.svelte';
    import UpdateName from './updateName.svelte';
    import DangerZone from './dangerZone.svelte';
</script>

<Container>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
            <AvatarInitials size={48} name={$team.name} />
            <div>
                <Heading tag="h6" size="7">{$team.name}</Heading>
            </div>
        </div>
        <svelte:fragment slot="aside">
            <div>
                <p>{$team.total} Members</p>
                <p>Created on {toLocaleDateTime($team.$createdAt)}</p>
            </div>
        </svelte:fragment>
    </CardGrid>
    <UpdateName />
    <UpdatePrefs />
    <DangerZone />
</Container>
