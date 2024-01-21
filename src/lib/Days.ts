export type EventDay = { time: string; text: string }[];

export const wednesday: EventDay = [
    { time: "19:00", text: "Smygstarta helgen med taggpub på Flamman! Här kan du smaka VSR ölen för första gången! Misslyckades du med att få en biljett på biljettsläppet kommer några biljetter och andra priser tävlas ut." },
    ];

    export const thursday: EventDay = [
        { time: "08:00", text: "The Red Keep i Baljan - Kaffe och utlottning av biljetter och priser." },
        { time: "14:00", text: "Torsdagskröken - Öl för studenter från kl 14, med VSR öl i kröken." },
        { time: "22:00", text: "Türrolleröjet i Kårallen - Forte! spelar, Reyn uppträder kl 01:00. Premiär för VSR-burgare, VSR öl tillgängligt." },
    ];
    

    export const friday: EventDay = [
        { time: "15:00", text: "Fredagspub - Brandon Boys serverar VSR öl och annat gott! Perfekt tillfälle att ta en återställare och ladda om inför kvällens festligheter!" },
        { time: "22:00", text: "Temakväll på Flamman - Häng med ner i underjorden för att tagga igång ordentligt inför morgondagens bravader!" },
    ];
    export const saturday: EventDay = [
        { time: "10:00", text: "Valla Saucer Rennen 2024 - Start med Lagmarschen kl 9:30. Tävling på snötäckt vallamassiv med hemsnickrade saucrar. Dryck och mat tillgängligt, inklusive Flamman, Xamera, Nira, och Redbull. DJ från Valla Skivgarde. Klä för snö." },
        { time: "22:00", text: "Efterkälken - Fest i Kårallen för VSR 2024. Y-bandet kl 23:30, Albin Myers kl 01:00. Tredje våningen och Silent Disco i grillen." },
    ];
    
    

    
export const days: EventDay[] = [wednesday, thursday, friday, saturday];