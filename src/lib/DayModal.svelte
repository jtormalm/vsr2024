<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	import { getModalStore } from '@skeletonlabs/skeleton';

	// Props
	const modalStore = getModalStore();
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;
	let events: { time: string; text: string }[] = $modalStore[0].meta.events;

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<!-- <article>{$modalStore[0].body ?? '(body missing)'}</article> -->
		<article class="flex flex-col gap-4">
			{#each events as event}
				<div class="flex flex-col">
					<span class="text-primary-500 font-bold">{event.time}</span>
					<span>{event.text}</span>
				</div>
			{/each}
		</article>
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonPositive}" on:click={parent.onClose}>Stäng</button>
		</footer>
	</div>
{/if}
