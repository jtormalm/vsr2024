<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let targetDate: Date;
	export let precision: 1 | 2 | 3 | 4 | 5 = 4;
	export let zeroPad: boolean = true; // New parameter to control zero-padding
	let className = '';
	export { className as class };

	let days = 0;
	let hours = 0;
	let minutes = 0;
	let seconds = 0;
	let milliseconds = 0;

	let interval: ReturnType<typeof setInterval>;
	let loaded = false;

	function calculateCountdown() {
		const now = new Date().getTime();
		const target = new Date(targetDate).getTime();
		const distance = target - now;

		if (distance < 0) {
			clearInterval(interval);
			dispatch('complete');
			return;
		}

		days = Math.floor(distance / (1000 * 60 * 60 * 24));
		hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		seconds = Math.floor((distance % (1000 * 60)) / 1000);
		milliseconds = Math.floor((distance % 1000) / 10); // Adjusted to 10s of milliseconds
	}

	function padNumber(num: number, length: number) {
		return num.toString().padStart(length, '0');
	}

	function formatCountdown() {
		const timeTerms = [
			`${zeroPad ? padNumber(days, 2) : days}d`,
			`${zeroPad ? padNumber(hours, 2) : hours}h`,
			`${zeroPad ? padNumber(minutes, 2) : minutes}m`,
			`${zeroPad ? padNumber(seconds, 2) : seconds}s`,
			`${zeroPad ? padNumber(milliseconds, 2) : milliseconds}ms` // Zero-padding applied
		];

		if (days > 0) {
			return timeTerms.slice(0, precision).join(' ');
		} else if (hours > 0) {
			return timeTerms.slice(1, precision + 1).join(' ');
		} else if (minutes > 0) {
			return timeTerms.slice(2, precision + 2).join(' ');
		} else {
			return timeTerms.slice(3, precision + 3).join(' ');
		}
	}

	let displayString = formatCountdown();

	onMount(() => {
		loaded = true;
		calculateCountdown();
		displayString = formatCountdown();

		interval = setInterval(() => {
			calculateCountdown();
			displayString = formatCountdown();
		}, 10);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

{#if loaded}
	<div class={className}>
		{displayString}
	</div>
{/if}
