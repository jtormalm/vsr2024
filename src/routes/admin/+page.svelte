<script lang="ts">
	import {
		RadioGroup,
		RadioItem,
		type ConicStop,
		type ToastSettings,
		ConicGradient
	} from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';

	export let data;

	let { supabase } = data;
	$: ({ supabase } = data);

	const toastStore = getToastStore();
	let selected: 'kvalet' | 'vsr' = 'vsr';
	let selectedMatch = 1;

	$: console.log(data);

	const submitChanges = async (player: (typeof data.players)[number]) => {
		if (requestActive) return;
		requestActive = true;

		const { data, error } = await supabase.from('player').update(player).eq('id', player.id);

		if (error) {
			const t: ToastSettings = {
				message: error.message + ' Kontakta oss',
				background: 'variant-filled-warning'
			};
			toastStore.trigger(t);
		} else {
			const t = {
				message: 'Ändringar sparade',
				background: 'variant-filled-primary'
			};
			toastStore.trigger(t);
		}
		await disableRequest();
	};

	const createFirstRound = async () => {
		// ask the user if they're sure
		const confirmMessage =
			'Är du säker på att du vill skapa första rundan? Alla tidigare resultat kommer att raderas';
		if (!confirm(confirmMessage)) return;

		if (requestActive) return;
		requestActive = true;

		const { error } = await supabase
			.from('match')
			.update({ p1: null, p2: null, winner: 'NONE' })
			.gt('id', 0);

		if (error) {
			console.error(error);
			const t: ToastSettings = {
				message: error.message + ' Kontakta oss',
				background: 'variant-filled-warning'
			};
			toastStore.trigger(t);
			await disableRequest();

			return;
		}

		const sortedPlayers = data.players.sort((a, b) => (a.best_time ?? 0) - (b.best_time ?? 0));

		// Create pairs: fastest with slowest, second fastest with second slowest, etc.
		const pairs = [];
		for (let i = 0; i < sortedPlayers.length / 2; i++) {
			pairs.push({
				faster: sortedPlayers[i].id,
				slower: sortedPlayers[sortedPlayers.length - 1 - i].id
			});
		}

		// Update the match table with the pairs
		const updatePromises = pairs.map((pair, i) => {
			const matchId = i + 1; // Assuming match IDs are 1-indexed
			const { faster, slower } = pair;

			return data.supabase
				.from('match')
				.update({ p1: faster, p2: slower, winner: 'NONE' })
				.eq('id', matchId)
				.then(({ data: updateData, error }) => {
					if (error) {
						const t = {
							message: `Problem med match ${matchId}: ${error.message} Kontakta oss`,
							background: 'variant-filled-warning'
						};
						toastStore.trigger(t);
						throw new Error(`Error updating match ${matchId}`);
					}
					return updateData; // or whatever you want to return
				});
		});

		try {
			const results = await Promise.all(updatePromises);
			// Process results if necessary
		} catch (error) {
			await disableRequest();
			// Handle error, maybe already handled in the mapping function
		}

		const t = {
			message: 'Första rundan skapad',
			background: 'variant-filled-primary'
		};
		toastStore.trigger(t);
		await disableRequest();
	};

	const getUser = (userId: number) => {
		return data.players.find((p) => p.id === userId);
	};

	const getMatch = (matchId: number) => {
		return data.matches.find((m) => m.id === matchId);
	};

	const printError = (error: any) => {
		console.error(error);
		const t: ToastSettings = {
			message: error.message + ' Kontakta oss',
			background: 'variant-filled-warning'
		};
		toastStore.trigger(t);
	};

	$: currentMatch = data.matches.find((m) => m.id === selectedMatch) ?? data.matches[0];

	let requestActive = false;

	let winnerId: number;
	const setWinner = async (matchId: number, winnerId: number) => {
		if (requestActive) return;
		requestActive = true;
		const match = getMatch(matchId);
		if (!match) return;
		const winner = match.p1 === winnerId ? 'P1' : 'P2';

		const { error } = await supabase.from('match').update({ winner }).eq('id', matchId);

		if (error) {
			printError(error);
			await disableRequest();
			return;
		}

		match.winner = winner;

		const otherMatch = data.matches.find(
			(m) => m.next_match_id === match.next_match_id && m.id !== match.id
		);
		const nextMatch = data.matches.find((m) => m.id === match.next_match_id);

		if (otherMatch && nextMatch) {
			const otherWinner = otherMatch.id > match.id ? 'P1' : 'P2';
			const { error } = await supabase
				.from('match')
				.update({ [otherWinner.toLowerCase()]: winnerId })
				.eq('id', nextMatch.id);
			if (error) {
				printError(error);
				await disableRequest();
				return;
			} else {
				nextMatch[otherWinner.toLowerCase()] = winnerId;
			}
		}

		const t = {
			message: 'Vinnare sparad',
			background: 'variant-filled-primary'
		};
		toastStore.trigger(t);
		await disableRequest();
	};

	const clearData = async () => {
		const confirmMessage = 'Är du säker på att du vill rensa alla matcher?';
		if (!confirm(confirmMessage)) return;

		if (requestActive) return;
		requestActive = true;

		const { error } = await supabase
			.from('match')
			.update({ p1: null, p2: null, winner: 'NONE', start_time: null })
			.gt('id', 0);

		if (error) {
			console.error(error);
			const t: ToastSettings = {
				message: error.message + ' Kontakta oss',
				background: 'variant-filled-warning'
			};
			toastStore.trigger(t);
			await disableRequest();
			return;
		}

		const t = {
			message: 'Alla matcher rensade',
			background: 'variant-filled-primary'
		};
		toastStore.trigger(t);
		await disableRequest();
	};

	const disableRequest = async () => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		requestActive = false;
	};

	const setStartTime = async (matchId: number) => {
		if (requestActive) return;
		requestActive = true;

		const { error } = await supabase
			.from('match')
			.update({ start_time: currentMatch.start_time })
			.eq('id', matchId);

		if (error) {
			printError(error);
			await disableRequest();
			return;
		}

		const t = {
			message: 'Starttid sparad',
			background: 'variant-filled-primary'
		};
		toastStore.trigger(t);
		await disableRequest();
	};

	const deepEqual = (object1, object2) => {
		if (object1 === object2) {
			return true;
		}

		if (
			object1 === null ||
			typeof object1 !== 'object' ||
			object2 === null ||
			typeof object2 !== 'object'
		) {
			return false;
		}

		const keys1 = Object.keys(object1);
		const keys2 = Object.keys(object2);

		if (keys1.length !== keys2.length) {
			return false;
		}

		for (const key of keys1) {
			if (!keys2.includes(key) || !deepEqual(object1[key], object2[key])) {
				return false;
			}
		}

		return true;
	};

	data.supabase
		.channel('player')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public'
			},
			async (payload) => {
				if (payload.eventType != 'UPDATE') return;

				const { data: players } = await data.supabase.from('player').select('*');

				if (deepEqual(players, data.players)) return;

				data.players = players ?? [];
			}
		)
		.subscribe();

	// do the same but for matches
	data.supabase
		.channel('match')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public'
			},
			async (payload) => {
				const { data: matches } = await data.supabase.from('match').select('*');

				if (deepEqual(matches, data.matches)) return;

				data.matches = matches ?? [];
			}
		)
		.subscribe();

	// let playerStartTimes: [string, string][];

	// $: playerStartTimes = data.players.map((p) => [p.id.toString(), p.start_time ?? '00:00'])
</script>

<svelte:head>
	<title>VSR Admin</title>
</svelte:head>

<div class="flex sm:p-4 p-2 w-screen text-white flex-col justify-center items-center">
	<div class="w-full text-center z-20 mt-4 mb-4 text-xl sm:text-2xl font-bold">VSR Admin</div>
	<div class="mb-4">
		<RadioGroup disabled class="font-medium">
			<RadioItem
				disabled={requestActive}
				active="text-black bg-primary-400 "
				class="px-8"
				bind:group={selected}
				name="justify"
				value={'kvalet'}>Kvalet</RadioItem
			>
			<RadioItem
				disabled={requestActive}
				active="text-black bg-primary-400"
				class="px-8"
				bind:group={selected}
				name="justify"
				value={'vsr'}>VSR 2024</RadioItem
			>
		</RadioGroup>
	</div>

	{#if selected === 'vsr'}
		<button
			disabled={requestActive}
			on:click={clearData}
			class="btn m-4 mt-0 variant-filled-primary"
			type="button">Rensa alla matcher</button
		>
		<label class="label">
			<span>Match</span>
			<select disabled={requestActive} bind:value={selectedMatch} class="select">
				{#each data.matches.sort((a, b) => a.id - b.id) as match}
					<option value={match.id}>{match.name}</option>
				{/each}
			</select>
		</label>

		<div class="border rounded-md border-surface-600 p-4 mt-4 min-w-64">
			Välj Vinnare
			<div class="space-y-2 mt-2">
				{#if currentMatch.p1}
					<label class="flex items-center space-x-2">
						<input
							class="radio"
							type="radio"
							name="radio-direct"
							value={currentMatch.p1}
							bind:group={winnerId}
						/>
						<p>{getUser(currentMatch.p1)?.name}</p>
					</label>
				{/if}
				{#if currentMatch.p2}
					<label class="flex items-center space-x-2">
						<input
							class="radio"
							type="radio"
							name="radio-direct"
							value={currentMatch.p2}
							bind:group={winnerId}
						/>
						<p>{getUser(currentMatch.p2)?.name}</p>
					</label>
				{/if}
				<button
					on:click={() => setWinner(currentMatch.id, winnerId)}
					class="btn w-full !mb-4 variant-filled-primary"
					disabled={!currentMatch.p1 || !currentMatch.p2 || requestActive || !winnerId}
					type="button">Spara Vinnare</button
				>

				<label class="label">
					<input
						class="input"
						type="text"
						placeholder="Starttid"
						bind:value={currentMatch.start_time}
					/>
				</label>

				<button
					on:click={() => setStartTime(currentMatch.id)}
					class="btn w-full variant-filled-primary"
					disabled={requestActive}
					type="button">Spara Starttid</button
				>
			</div>
		</div>
	{:else}
		<button
			disabled={requestActive}
			on:click={createFirstRound}
			class="btn m-4 mt-0 variant-filled-primary"
			type="button">Skapa första rundan i VSR</button
		>
		<div class="h-full grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-8 overflow-y-scroll">
			{#each data.players.sort((a, b) => a.id - b.id) as player}
				<div class="rounded-lg w-full flex flex-col border-2 border-surface-600 p-2 gap-2">
					<!-- <div class="text-primary-500 p-2 font-bold">
						{player.name}
					</div> -->
					{player.id}

					<label class="label">
						<input class="input" type="text" placeholder="Namn" bind:value={player.name} />
					</label>

					<label class="label">
						<input
							maxlength="5"
							class="input"
							type="text"
							placeholder="Starttid"
							bind:value={player.start_time}
						/>
					</label>
					<!-- {@const a = console.log(player)} -->

					<label class="label">
						<input
							class="input"
							type="number"
							placeholder="Bästa Tid"
							bind:value={player.best_time}
						/>
					</label>
					<!-- <div class="w-full items-center flex gap-1">
						<select class="select" value={player.start_time?.split(':')[0] ?? '0'}>
							{#each Array.from(Array(24).keys()) as hour}
								{@const formatted = hour.toString().padStart(2, '0')}
								<option value={formatted}>{formatted}</option>
							{/each}
						</select>
						<span> : </span>
						<select class="select" value={player.start_time?.split(':')[1] ?? '0'}>
							{#each Array.from(Array(60).keys()) as minute}
								{@const formatted = minute.toString().padStart(2, '0')}
								<option value={formatted}>{formatted}</option>
							{/each}
						</select>
					</div> -->
					<button
						disabled={requestActive}
						on:click={() => submitChanges(player)}
						class="btn variant-filled-primary w-64"
						type="button"
					>
						{#if requestActive}
							Laddar...
						{:else}
							Spara Ändringar
						{/if}
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
