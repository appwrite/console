<script lang="ts">
    import { onMount } from 'svelte';
    import { Badge } from '@appwrite.io/pink-svelte';

    let displayText = 'BETA';
    let currentIndex = 0;
    const targetText = 'General Availability';
    const typingSpeed = 100;
    const deletingSpeed = 150;

    onMount(() => {
        startAnimation();
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

<Badge size="xs" variant="secondary" content={displayText} />
