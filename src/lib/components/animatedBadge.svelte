<script lang="ts">
    import { Badge } from '@appwrite.io/pink-svelte';

    let displayText = $state('BETA');
    let currentIndex = $state(0);
    let mounted = $state(false);
    const targetText = 'General Availability';
    const typingSpeed = 100;
    const deletingSpeed = 150;

    $effect(() => {
        if (!mounted) {
            mounted = true;
            startAnimation();
        }
    });

    function startAnimation() {
        deleteText();
    }

    function deleteText() {
        if (displayText.length > 0) {
            setTimeout(() => {
                displayText = displayText.slice(0, -1);
                deleteText();
            }, deletingSpeed);
        } else {
            typeText();
        }
    }

    function typeText() {
        if (currentIndex < targetText.length) {
            setTimeout(() => {
                displayText += targetText[currentIndex];
                currentIndex++;
                typeText();
            }, typingSpeed);
        }
    }
</script>

<Badge
    size="xs"
    variant="secondary"
    content={displayText}
    style="min-height: 1.5em; white-space: nowrap; padding: 0.25rem 1rem; align-items: center;" />
