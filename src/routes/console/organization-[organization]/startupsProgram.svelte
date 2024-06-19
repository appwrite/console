<script lang="ts">
    import { Avatar, Card, DropList, DropListItem, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    let events = [
        {
            title: 'Office Hours',
            date: 'Friday, 03 May at 14:00'
        },
        {
            title: 'Office Hours',
            date: 'Friday, 03 May at 14:00'
        }
    ];

    let showAddToCalendarDropdown = [];
</script>

<Heading size="5" tag="h2" class="u-margin-block-start-48">Startups Program</Heading>
<div class="u-margin-block-start-16 grid-2-1">
    <Card isTile class="u-flex u-flex-vertical-mobile u-gap-24">
        <div class="u-flex-vertical u-gap-24">
            <div class="u-flex u-gap-16">
                <Avatar size={40} src="https://unsplash.it/200" name="Tessa Mero" />
                <div class="u-cross-child-center u-line-height-1-5">
                    <h4 class="body-text-1 u-bold">Tessa Mero</h4>
                    <h5 class="body-text-2 u-bold u-color-text-offline">Developer Advocate</h5>
                    <p class="text u-margin-block-start-8">
                        Contact Tessa with any questions you might have about Appwrite.
                    </p>
                </div>
            </div>
            <Button
                secondary
                fullWidth
                class="u-margin-block-start-auto"
                event="schedule_program_manager_call"
                eventParams={{ source: 'startup_program_card' }}>
                <span class="text">Schedule a call</span>
                <span class="icon-external-link"></span>
            </Button>
        </div>

        <div style="flex-basis:1px; background-color:hsl(var(--color-border));"></div>
        <div class="u-flex-vertical u-gap-24">
            <div class="u-flex u-gap-16">
                <Avatar size={40} src="https://unsplash.it/201" name="Tessa Mero" />
                <div class="u-cross-child-center u-line-height-1-5">
                    <h4 class="body-text-1 u-bold">Private channel</h4>
                    <h5 class="body-text-2 u-bold u-color-text-offline">#acme-corp-appwrite</h5>
                    <p class="text u-margin-block-start-8">
                        Visit your dedicated Discord channel to chat with our team of engineers.
                    </p>
                </div>
            </div>
            <Button
                secondary
                fullWidth
                class="u-margin-block-start-auto"
                event="open_private_channel"
                eventParams={{ source: 'startup_program_card' }}>
                <span class="text">Message us on Discord</span>
                <span class="icon-external-link"></span>
            </Button>
        </div>
    </Card>
    <Card isTile>
        <h4 class="body-text-1 u-bold">Upcoming events</h4>
        {#if events?.length}
            <div class="u-flex-vertical u-gap-16 u-margin-block-start-16">
                {#each events as event, i}
                    {#if i > 0}
                        <div class="u-sep-block-start"></div>
                    {/if}
                    <div class="u-flex u-gap-16 u-main-space-between">
                        <div>
                            <h4 class="body-text-2 u-bold">{event.title}</h4>
                            <time class="u-block">{event.date}</time>
                        </div>
                        <DropList bind:show={showAddToCalendarDropdown[i]}>
                            <Button
                                text
                                noMargin
                                on:click={() => (showAddToCalendarDropdown[i] = true)}>
                                Add to calendar
                            </Button>
                            <svelte:fragment slot="list">
                                <DropListItem
                                    event="add_event_to_calendar"
                                    eventParams={{
                                        source: 'startup_program_card',
                                        provider: 'apple'
                                    }}>
                                    Apple
                                </DropListItem>
                                <DropListItem
                                    event="add_event_to_calendar"
                                    eventParams={{
                                        source: 'startup_program_card',
                                        provider: 'google'
                                    }}>
                                    Google
                                </DropListItem>
                                <DropListItem
                                    event="add_event_to_calendar"
                                    eventParams={{
                                        source: 'startup_program_card',
                                        provider: 'outlook'
                                    }}>
                                    Outlook
                                </DropListItem>
                                <DropListItem
                                    event="add_event_to_calendar"
                                    eventParams={{
                                        source: 'startup_program_card',
                                        provider: 'yahoo'
                                    }}>
                                    Yahoo
                                </DropListItem>
                                <DropListItem
                                    event="add_event_to_calendar"
                                    eventParams={{
                                        source: 'startup_program_card',
                                        provider: 'local'
                                    }}>
                                    Download invite (.ics)
                                </DropListItem>
                            </svelte:fragment>
                        </DropList>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="card u-margin-block-start-16">
                <div class="u-flex u-flex-vertical u-main-center u-cross-center u-gap-8">
                    <h5 class="body-text-2 u-bold u-text-center">No events scheduled</h5>
                    <p class="text u-text-center">Please check back later</p>
                </div>
            </div>
        {/if}
    </Card>
</div>
