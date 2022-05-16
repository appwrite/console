<script>
    function slide(direction) {
        let container = document.getElementById('tabs-list');
        let scrollCompleted = 0;
        let slideVar = setInterval(function () {
            if (direction == 'left') {
                container.scrollLeft -= 10;
            } else {
                container.scrollLeft += 10;
            }
            scrollCompleted += 10;
            if (scrollCompleted >= 100) {
                window.clearInterval(slideVar);
            }
        }, 10);
    }
</script>

<div class="tabs">
    <button
        class="tabs-button-scroll is-start"
        aria-label="Show items in start side"
        on:click={() => slide('left')}
        ><span class="icon-cheveron-left" aria-hidden="true" /></button>
    <button
        class="tabs-button-scroll is-end"
        aria-label="Show items in end side"
        on:click={() => slide('right')}
        ><span class="icon-cheveron-right" aria-hidden="true" /></button>
    <ul id="tabs-list" class="tabs-list scroll-shadow-horizontal">
        <slot />
    </ul>
</div>
