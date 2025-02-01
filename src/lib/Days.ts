export type EventDay = { time: string; text: string }[];

export const first_thursday = [
    { time: '18:30', text: 'Smygstarta VSR med en grym uppladdning på Cok Najs! Här har du chansen att smaka på årets VSR-öl och delta i ett temaenligt quiz för en chans att vinna förköp!' },

];

export const wednesday: EventDay = [
	{
		time: '19:00',
		text: 'Supertrevligt att värma upp inför helgens bravader! Det vankas musikquiz med finfina priser till vinnaren och Gabbe utlovar VSR-öl i mängder!'
	}
];

export const thursday: EventDay = [
	{ time: '08:00 - 14:00', text: 'Baljan blir till flammande Baljan - Under hela dagen kan ni köpa ett VSR-klägg och vara med i utlottningen av ett fint pris i form av en airfryer!' },
	{ time: '14:00', text: 'Torsdagskröken - KrökenKrew anordnar Torsdagskröken i sann VSR anda med extra god VSR-öl!' },
	{
		time: '22:00 - 03:00',
		text: 'Türrolleröjet i Kårallen - På med ovven/stassen och kom till Kårallen för att se Y-bandet och Svea Skivgarde! På tredje våningen hittar ni en bubbelbar och i grillen silent disco. Ni har även chansen att “Build your own potion” i amfi. Missa inte heller att svänga förbi Gasquen för att smaka årets VSR-burgare som Herman har kokat ihop! '
	}
];

export const friday: EventDay = [
	{
		time: '22:00',
		text: 'Tagga igång ordentligt inför lördagen med temakväll på Flamman!'
	}
];
export const saturday: EventDay = [
	{
		time: '10:00',
		text: 'Valla Saucer Rennen 2025 - Startar med lagmarsch från 09:30. Klockan 10.00 invigs ett snötäckt Vallamassiv och nordens största parallellsaucertävling startar! Högst upp i backen hittar ni Svea Skivgarde. På plats finns även Cok Najs, Nira Dynamics, Swedish Greyhound och Xamera!'
	},
	{
		time: '22:00 - 03:00',
		text: 'Efterkälken - Bege er till Kårallen för det ultimata slutet på denna helg, Efterkälken! Tungevaag intar scen kl 00:30. Likt torsdagen utlovas även mumsiga burgare och bubbelbar!'
	}
];

export const days: EventDay[] = [first_thursday, wednesday, thursday, friday, saturday];
