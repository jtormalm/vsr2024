<script lang="ts">
	import { VSRViewer } from '$lib/VSRViewer.tsx';

	import { matches } from '$lib/matches';
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	let innerHeight: number;
	let innerWidth: number;

	let clientHeight: number;
	let clientWidth: number;

	let loaded = false;

	onMount(() => {
		loaded = true;
	});

	let selected = 'vsr';

	let textHeight = 0;
	let radioHeight = 0;

	const teams = [
		'Amors Pilar',
		'Bönder N Brothers',
		'D-sek LTH 1',
		'D-sek LTH 2',
		'D-sek LTH 3',
		'Dart, fast man kan dö',
		'Hepatet D (A-lag)',
		'Hepatet D (B-lag)',
		'Inre Frid',
		'Myselsen',
		'Norra Solbergas eminenta herrförening',
		'Null Pointers',
		'Orumakers',
		'Team Gamnacke',
		'UU miljöaktivister',
		'D-Dagen',
		'CLWankers',
		'DKM',
		'KTHockey',
		'BeDÖMDt',
		'BrödKaka',
		'Dedart6',
		'Kollektiveriet',
		'Eilerts Pilarmar',
		'Fart',
		'Makers',
		'Fru under 18 söks åt Mehmet',
		'Wendin ska bli gulad',
		'Datasimparna',
		'SMurfarna',
		'PIL-verkeriet',
		'Innovativt Pilskande'
	];
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div class="flex sm:p-4 p-2 w-screen text-white flex-col justify-center items-center">
	<div
		bind:clientHeight={textHeight}
		class="w-full text-center z-20 mt-4 mb-4 text-xl sm:text-2xl font-bold"
	>
		Valla Saucer Rennen 2024
	</div>
	<div class="mb-4" bind:clientHeight={radioHeight}>
		<RadioGroup class="font-medium">
			<RadioItem
				active="text-black bg-primary-400"
				class="px-8"
				bind:group={selected}
				name="justify"
				value={'kvalet'}>Kvalet</RadioItem
			>
			<RadioItem
				active="text-black bg-primary-400"
				class="px-8"
				bind:group={selected}
				name="justify"
				value={'vsr'}>VSR 2024</RadioItem
			>
		</RadioGroup>
	</div>

	{#if selected === 'vsr'}
		<div
			class="rounded-xl h-full w-full items-center flex justify-center"
			bind:clientHeight
			bind:clientWidth
		>
			{#if loaded}
				<react:VSRViewer
					{matches}
					width={innerWidth}
					height={innerHeight - radioHeight - textHeight - 48 - 32}
				/>
			{/if}
		</div>
	{:else}
		<div class="h-full grid grid-cols-2 mb- sm:grid-cols-4 gap-4 sm:gap-8 overflow-y-scroll">
			{#each teams as team}
				<div class="rounded-lg w-full flex flex-col border-2 border-surface-600">
					<div class="text-primary-500 p-2 font-bold">
						{team}
					</div>
					<hr />
					<div class="text-surface-300 p-2">
						{Math.round(Math.random() * 100000) / 1000}s
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
