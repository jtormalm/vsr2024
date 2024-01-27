<script lang="ts">
	import { RadioGroup, RadioItem, type ToastSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';

	export let data;

	let { supabase } = data;
	$: ({ supabase } = data);

	const toastStore = getToastStore();
	let selected: 'kvalet' | 'vsr' = 'vsr';
	let selectedMatch = 1;

	$: console.log(data);

	const submitChanges = async (player: (typeof data.players)[number]) => {
		const { data, error } = await supabase.from('player').update(player).eq('id', player.id);

		if (error) {
			const t: ToastSettings = {
				message: error.message + ' Kontakta oss',
				background: 'variant-filled-warning'
			};
			toastStore.trigger(t);
		}

		const t = {
			message: 'Ändringar sparade',
			background: 'variant-filled-primary'
		};
		toastStore.trigger(t);
	};

	const createFirstRound = async () => {
		// ask the user if they're sure
		const confirmMessage =
			'Är du säker på att du vill skapa första rundan? Alla tidigare resultat kommer att raderas';
		if (!confirm(confirmMessage)) return;

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
		for (let i = 0; i < pairs.length; i++) {
			const matchId = i + 1; // Assuming match IDs are 1-indexed
			const { faster, slower } = pairs[i];

			const { data: updateData, error } = await data.supabase
				.from('match')
				.update({ p1: faster, p2: slower, winner: 'NONE' })
				.eq('id', matchId);

			if (error) {
				const t = {
					message: `Problem med match ${matchId}: ${error.message} Kontakta oss`,
					background: 'variant-filled-warning'
				};
				toastStore.trigger(t);
				return;
			}
		}

		const t = {
			message: 'Första rundan skapad',
			background: 'variant-filled-primary'
		};
		toastStore.trigger(t);
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

	let winnerId: number;

	$: currentMatch = data.matches.find((m) => m.id === selectedMatch) ?? data.matches[0];

	const setWinner = async (matchId: number, winnerId: number) => {
		const match = getMatch(matchId);
		if (!match) return;
		const winner = match.p1 === winnerId ? 'P1' : 'P2';

		const { error } = await supabase.from('match').update({ winner }).eq('id', matchId);

		if (error) {
			printError(error);
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
	};

	const clearData = async () => {
		const confirmMessage = 'Är du säker på att du vill rensa alla matcher?';
		if (!confirm(confirmMessage)) return;

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

			return;
		}

		const t = {
			message: 'Alla matcher rensade',
			background: 'variant-filled-primary'
		};
		toastStore.trigger(t);
	};
</script>

<svelte:head>
	<title>VSR Admin</title>
</svelte:head>

<div class="flex sm:p-4 p-2 w-screen text-white flex-col justify-center items-center">
	<div class="w-full text-center z-20 mt-4 mb-4 text-xl sm:text-2xl font-bold">VSR Admin</div>
	<div class="mb-4">
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
		<button on:click={clearData} class="btn m-4 mt-0 variant-filled-primary" type="button"
			>Rensa alla matcher</button
		>
		<label class="label">
			<span>Match</span>
			<select bind:value={selectedMatch} class="select">
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
					class="btn w-full variant-filled-primary"
					disabled={!currentMatch.p1 || !currentMatch.p2}
					type="button">Spara Vinnare</button
				>
			</div>
		</div>
	{:else}
		<button on:click={createFirstRound} class="btn m-4 mt-0 variant-filled-primary" type="button"
			>Skapa första rundan i VSR</button
		>
		<div class="h-full grid grid-cols-2 mb- sm:grid-cols-4 gap-4 sm:gap-8 overflow-y-scroll">
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
							class="input"
							type="number"
							placeholder="Bästa Tid"
							bind:value={player.best_time}
						/>
					</label>
					<button
						on:click={() => submitChanges(player)}
						class="btn variant-filled-primary"
						type="button">Spara Ändringar</button
					>
				</div>
			{/each}
		</div>
	{/if}
</div>
