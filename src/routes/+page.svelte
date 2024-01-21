<script lang="ts">
	import Countdown from '$lib/Countdown.svelte';
	import SaucerBackground from '$lib/SaucerBackground.svelte';
	import { ProgressBar, type ModalSettings } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { days } from '$lib/Days';

	import { getModalStore } from '@skeletonlabs/skeleton';
	import { cubicInOut } from 'svelte/easing';

	const modalStore = getModalStore();

	let scrollY: number = 0;
	let innerWidth: number;
	let innerHeight: number;
	let loaded = false;

	const textSizeBase = 180;
	let initialScale = 1;
	onMount(() => {
		initialScale = 0.75 * (innerWidth / textSizeBase);
		loaded = true;
	});

	let clock: HTMLDivElement;
	let clockOpacity = 0;

	$: {
		scrollY;
		if (clock) {
			let clockWidth = clock.getBoundingClientRect().width;
			clockOpacity = clockWidth / (innerWidth * 0.5);
		}
	}

	const openTicketModal = () => {
		const modal: ModalSettings = {
			type: 'component',
			component: 'tisdag'
		};
		modalStore.trigger(modal);
	};

	const dayTitles = {
		0: 'Taggpub på Flamman',
		1: 'Türrolleröjet på Kårallen',
		2: 'Temakväll på Flamman',
		3: 'Valla Saucer Rennen 2024'
	};

	const openDayModal = (day: 0 | 1 | 2 | 3) => {
		const dayData = days[day];
		const modal: ModalSettings = {
			type: 'component',
			component: 'day',
			meta: {
				events: dayData
			},
			title: dayTitles[day]
		};
		modalStore.trigger(modal);
	};
</script>

<svelte:window bind:scrollY bind:innerWidth bind:innerHeight />

<SaucerBackground />

{#if scrollY < 1500}
	<div
		transition:fade={{ easing: cubicInOut, duration: 150 }}
		class="fixed font-medium text-sm sm:text-base bottom-4 w-full text-center"
	>
		Skrolla ner
	</div>
{/if}

<div class="fixed w-full items-center gap-4 flex top-4 left-4">
	{Math.min(Math.max(Math.round((scrollY * 100) / 550), 0), 1000)}
	{#key scrollY}
		<ProgressBar class="w-full" label="Progress Bar" value={Math.max(0, scrollY)} max={5400} />
	{/key}
	<div class="mr-6">1000</div>
</div>

{#if scrollY < 3000 && loaded}
	<div class="fixed inset-0 overflow-hidden">
		<div class="absolute top-1/2 left-1/2">
			<div
				style="transform: translate(-50%, -50%) scale({scrollY > 500
					? 2 ** ((scrollY - 500) / 200) + initialScale - 1
					: initialScale}); 
                filter: brightness({Math.min(100, 40 + 0.12 * scrollY)}%);"
				class="transform-gpu select-none text-center font-bold"
			>
				Valla Saucer Rennen
			</div>
		</div>
	</div>
{/if}

{#if scrollY >= 2000 && scrollY < 5000}
	<div class="fixed z-10 inset-0 overflow-hidden">
		<div class="absolute top-1/2 left-1/2">
			<div
				bind:this={clock}
				style="transform: translate(-50%, -50%) scale({2 ** ((scrollY - 2500) / 300)});
                   transform-origin: center;
                  ;
                   "
				class="transform-gpu select-none stroke-white text-center font-bold"
			>
				<div style="opacity: {Math.min(0.5, clockOpacity)};" class="-mb-2">1-3.2.2024</div>
				<div style="opacity: {clockOpacity};">
					<Countdown targetDate={new Date('2024-02-01T10:00:00')} precision={5} />
				</div>
			</div>
		</div>
	</div>
{/if}

<div class="h-[5400px] flex justify-center"></div>

<div class="flex flex-col gap-8 items-center w-full justify-center sticky top-12 sm:top-16">
	<div class="grid grid-cols-3 place-items-center items-center gap-4 sm:gap-8 px-2 sm:w-1/2">
		<img class="h-full" src="/images/nira.svg" alt="Ericsson" />
		<img class="h-full" src="/images/coknajs.svg" alt="Microtec" />
		<img class="h-full" src="/images/korallen.svg" alt="Ericsson" />
	</div>
	<div class="px-2 sm:w-1/2 text-center font-medium text-2xl sm:text-3xl">
		Norra Europas Största <br /> Parallel Saucer Race
	</div>
	<div class="grid grid-cols-2 gap-4 w-full px-2 sm:px-0 font-medium sm:w-1/2">
		<button on:click={openTicketModal} class="btn w-full variant-filled-primary" type="button"
			>Biljettsläpp</button
		>
		<button on:click={() => openDayModal(0)} class="btn w-full variant-filled-primary" type="button"
			>Onsdag</button
		>
		<button on:click={() => openDayModal(1)} class="btn w-full variant-filled-primary" type="button"
			>Torsdag</button
		>
		<button on:click={() => openDayModal(2)} class="btn w-full variant-filled-primary" type="button"
			>Fredag</button
		>
		<button
			on:click={() => openDayModal(3)}
			class="btn w-full col-span-2 variant-filled-primary"
			type="button">LÖRDAG</button
		>
	</div>
	<div class="flex justify-center w-40 mt-16">
		<img class="" src="/images/y6.png" alt="YSex Logo" />
	</div>
</div>
<div class="h-[300px] sm:h-[400px] flex justify-center"></div>

<style>
	.translateNone {
		transform: translate3d(0, 0, 0);
		-webkit-transform: translate3d(0, 0, 0);
	}
</style>
