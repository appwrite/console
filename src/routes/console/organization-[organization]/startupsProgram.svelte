<script lang="ts">
    import { Avatar, Card, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
</script>

<Heading size="5" tag="h2" class="u-margin-block-start-48">Startups Program</Heading>
<div
    class="u-margin-block-start-16 grid-1-2"
    style:column-gap="1rem"
    style:grid-template-columns="1.5fr 1fr">
    <Card isTile class="u-flex u-flex-vertical-mobile u-gap-24">
        <div class="u-flex-vertical u-gap-24">
            <div class="u-flex u-gap-16">
                <Avatar size={40} src="https://unsplash.it/200" name="Tessa Mero" />
                <div class="u-cross-child-center u-line-height-1-5">
                    <h4 class="body-text-1 u-bold">Tessa Mero</h4>
                    <h5 class="body-text-2 u-bold u-color-text-offline">Developer Advocate</h5>
                    <p class="text u-margin-block-start-8 u-trim-1">
                        Contact Tessa with any questions you might have about Appwrite.
                    </p>
                </div>
            </div>
            <Button secondary fullWidth>
                <span class="text">Schedule a call</span>
                <span class="icon-external-link"></span>
            </Button>
        </div>

        <div class="divider is-not-mobile" style="height: 100%; width:1px" />
        <div class="divider is-only-mobile" />
        <div class="u-flex-vertical u-gap-24">
            <div class="u-flex u-gap-16">
                <Avatar size={40} src="https://unsplash.it/200" name="Tessa Mero" />
                <div class="u-cross-child-center u-line-height-1-5">
                    <h4 class="body-text-1 u-bold">Private channel</h4>
                    <h5 class="body-text-2 u-bold u-color-text-offline">#acme-corp-appwrite</h5>
                    <p class="text u-margin-block-start-8 u-trim-1">
                        Visit your dedicated Discord channel to chat with our team of engineers.
                    </p>
                </div>
            </div>
            <Button secondary fullWidth>
                <span class="text">Message us on Discord</span>
                <span class="icon-external-link"></span>
            </Button>
        </div>
    </Card>
    <Card isTile>
        <h4 class="body-text-1 u-bold">Private channel</h4>
        <div class="card u-margin-block-start-16">
            <div class="u-flex u-flex-vertical u-main-center u-cross-center u-gap-8">
                <h5 class="body-text-2 u-bold u-text-center">No events scheduled</h5>
                <p class="text u-text-center">Please check back later</p>
            </div>
        </div>
    </Card>
</div>
