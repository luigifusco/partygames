export type StoryLocale = 'en' | 'it';
export type StoryDialogueTranslations = Record<string, Partial<Record<number, readonly string[]>>>;

export const STORY_LOCALE_STORAGE_KEY = 'pp:locale';

const ITALIAN_STORY_DIALOGUE: StoryDialogueTranslations = {
  'oak-starters': {
    0: [
      "Ciao! Benvenuto nel mondo dei Pokémon!",
      "Mi chiamo Oak. La gente mi chiama il Professore Pokémon.",
      "Devi essere un nuovo allenatore. Ho qualcosa di speciale per te.",
    ],
    1: [
      "Ho preparato cinque squadre di Pokémon iniziali.",
      "Ogni squadra viene da una regione diversa.",
      "Scegli con saggezza — saranno i tuoi primi compagni!",
    ],
  },
  'cynthia-intro': {
    0: [
      "Oh — un nuovo allenatore. Professor Oak mi ha detto che forse saresti passato di qui. Mi chiamo Cynthia. Viaggio tra le regioni, studiando i miti che la gente ha dimenticato e quelli che ha ancora paura di ricordare.",
      "Prima che tu faccia un altro passo, vorrei dirti una cosa. Qualcosa che ogni allenatore dovrebbe sentire almeno una volta, da qualcuno che lo intende davvero.",
      "Il mondo su cui ti trovi è più antico di qualsiasi città o lega. Molto prima degli allenatori c'erano i Pokémon, e la terra stessa fu plasmata da loro — montagne sollevate, oceani placati, tempeste evocate e poi acquietate. Ogni regione che attraverserai ricorda una parte diversa di quella storia.",
    ],
    1: [
      "Persone e Pokémon camminano fianco a fianco da così tanto tempo che nessuno sa più chi abbia teso la mano per primo. Ma da qualche parte lungo il cammino, noi abbiamo imparato a chiedere il loro aiuto, e loro hanno imparato a fidarsi del fatto che ce ne saremmo presi cura.",
      "Questa è una lotta. Non uno scontro per provare chi è più forte. Una conversazione. Un momento in cui il tuo Pokémon ti mostra chi è, e tu gli mostri chi vuoi diventare.",
      "Vorrei avere quella conversazione con te. Una sola volta, perché tu ne capisca la forma. Vuoi lottare con me?",
    ],
    3: [
      "Grazie. È stata una buona conversazione — e migliore di quanto tu creda.",
      "Lo hai sentito? Il modo in cui il tuo Pokémon ti ha aspettato, poi si è fidato di te, poi si è mosso? In alcune vecchie storie quel sentimento ha un nome. La gente di Sinnoh lo chiamava *il filo*. Ogni volta che tu e un Pokémon condividete un momento — una vittoria, un salvataggio, persino solo una lunga camminata — un filo viene tessuto tra voi. Col tempo, quei fili si intrecciano in qualcosa che il mondo stesso può percepire.",
      "È questo il vero motivo per cui esistono gli allenatori. Non per collezionare Pokémon. Nemmeno per vincere. Ma per tessere.",
    ],
    4: [
      "Un consiglio pratico prima che io vada. Viaggiando, guadagnerai qualcosa che gli antichi registri chiamano Essence — il residuo di tutti quei momenti condivisi. Puoi scambiarla al Dreaming Market per provviste, per nuovi compagni non ancora nati nel mondo desto, e per i piccoli catalizzatori che aiutano un Pokémon a diventare ciò che è sempre stato destinato a diventare.",
      "Incontrerai anche altri allenatori che vorranno mettersi alla prova contro di te, e tornei in cui tutto il mondo starà a guardare. Non temere nulla di tutto questo. Il filo tra te e la tua squadra è già abbastanza forte.",
      "Vai, allora. Il mondo è pronto per te.",
    ],
  },
  'bug-catcher': {
    0: [
      "Ehi, aspetta — l'hai sentito anche tu, vero? Quel piccolo ronzio quando passa un Caterpie?",
      "Tutti gli altri dicono che gli insetti non hanno molto dentro. Io non ci credo. Penso che i loro fili siano solo più silenziosi — devi avvicinarti per sentirli.",
      "Lotta con me! Voglio dimostrare che anche le loro voci contano.",
    ],
    2: [
      "...Li hai sentiti anche tu, vero? Non solo i miei — i tuoi.",
      "Era tutto ciò che volevo. Grazie, allenatore. Continuerò ad ascoltare.",
    ],
  },
  'youngster-joey': {
    0: [
      "Ehi! Sei un vero allenatore, giusto? Devi lottare con me.",
      "Tutti ridono del mio Rattata. Ma lui è con me da prima ancora che sapessi cosa fosse un Pokémon — dormiva sul mio cuscino.",
      "Se il filo è reale, allora il nostro è il più forte che ci sia. Lascia che te lo dimostri!",
    ],
    2: [
      "Accidenti... va bene, d'accordo, ci hai battuti.",
      "Ma lo hai visto, vero? Ha lottato con tutto il cuore. Questo vale qualcosa.",
      "Per me resta sempre nella percentuale più alta.",
    ],
  },
  'n-bond-awakening': {
    0: [
      "...I tuoi Pokémon. Stanno dicendo qualcosa. Sì — riesco a sentirli. La maggior parte delle persone non può, ma io li ho sempre sentiti.",
      "Dimmi, allenatore: pensi che i tuoi Pokémon siano felici al tuo fianco?",
    ],
    1: [
      "Mi chiamano N. Viaggio per il mondo cercando la verità sui Pokémon e sugli esseri umani. Ho visto allenatori trattare i loro Pokémon come strumenti. Armi. Ma ne ho visti anche alcuni — come te — che forse sono davvero loro amici.",
      "Voglio sentirlo da me. Lotta con me, e lasciami ascoltare le voci dei tuoi Pokémon.",
    ],
    3: [
      "...L'ho sentito. I tuoi Pokémon si fidano di te. Quel legame non è qualcosa che insegni loro con l'allenamento. È qualcosa che guadagnate — insieme, col tempo.",
      "Ogni lotta che affronti al loro fianco, ogni momento che condividete, li avvicina a te. E mentre quel legame si approfondisce, i tuoi stessi Pokémon cambiano. Crescono. Diventano qualcosa di più.",
    ],
    5: [
      "Ci incontreremo ancora, allenatore. Il mondo è più grande di quanto immagini. Fino ad allora... ascolta i tuoi Pokémon. Hanno così tanto da dire.",
    ],
  },
  'may-rival': {
    0: [
      "Ehi! Tu sei l'allenatore di cui papà continua a parlare. Tipico.",
      "Mio padre gestisce la Palestra di Petalburg, quindi la gente si aspetta molto da me — ma non è per questo che sono qui fuori. Sono qui perché l'oceano al largo di Hoenn *canticchia*, e voglio sapere perché.",
      "Cynthia mi ha detto che saresti stato qualcuno contro cui mettermi alla prova. Pronto?",
    ],
    2: [
      "Whoa — ok, sei più bravo di quanto pensassi. Molto più bravo.",
      "Ho sentito il filo tirare quando ti sei mosso. Lo voglio anch'io.",
      "La prossima volta che ti vedrò, avrò la mia risposta. Promesso.",
    ],
  },
  'barry-rival': {
    0: [
      "Ehi ehi ehi! Tu sei quello che ha lottato con Cynthia, vero?! Non ci CREDO che abbia lottato con te prima che con me!",
      "Un giorno voglio diventare Campione. Tipo, entro la prossima settimana. So che tutti ridono, ma se continuo a muovermi, a lottare, il filo deve crescere, giusto?!",
      "Quindi — LOTTA! Subito! Niente scuse!",
    ],
    2: [
      "AAAH! Ho perso di nuovo! Va bene, va bene, VA BENE —",
      "Ma li hai visti? I miei ragazzi hanno lottato durissimo. È quella cosa del filo, giusto?? Era quella cosa?!",
      "Ok ok devo andare ad allenarmi. Mi multo da solo di diecimila per aver perso. CIAO!",
    ],
  },
  'n-styles-revealed': {
    0: [
      "Ci incontriamo di nuovo, allenatore. Te l'avevo detto.",
      "Ti ho osservato. Il legame con i tuoi Pokémon — è cresciuto. Ma ho notato anche qualcosa di curioso.",
    ],
    1: [
      "Ogni allenatore che ho incontrato lotta in modo diverso. Alcuni pianificano, alcuni attaccano, alcuni proteggono. I tuoi Pokémon non ascoltano solo le tue mosse — ascoltano *chi sei* in lotta.",
      "Dimmi... sai almeno che tipo di allenatore sei diventato? Mostramelo. Lotta ancora con me, e lascia parlare il tuo stile.",
    ],
    3: [
      "Sì... ora lo vedo. Hai una voce in lotta, anche se non l'hai mai sentita.",
      "D'ora in poi, quando mandi in campo un Pokémon, scegli anche come *tu* ti presenti. Il tuo stile plasma la loro determinazione. La loro determinazione plasma la lotta.",
    ],
    5: [
      "Alla prossima, allenatore. Sono curioso di vedere chi diventerai.",
    ],
  },
  'kanto-gyms': {
    0: ["Pronto per la vera sfida?", "Le Palestre di Kanto ti aspettano — e io sono di nuovo il tuo primo avversario!"],
    2: ["Sei davvero diventato più forte.", "La prossima è Cerulean City — Misty non ci andrà piano con te."],
    3: ["Quindi hai battuto Brock, eh?", "I miei Pokémon d'acqua ti rispediranno dritto a Pallet!"],
    5: ["Sei meglio di quanto pensassi.", "Vai a Vermilion — Lt. Surge ti sta aspettando."],
    6: ["Ehi, ragazzino! Pensi di avere quello che serve?", "Ti mostrerò la potenza scioccante dell'elettricità!"],
    8: ["Ah! Sei davvero qualcosa di speciale.", "La prossima Palestra è quella di Celadon — cerca di non farti incantare."],
    9: ["Benvenuto alla Palestra di Celadon.", "Non perderò questo incontro."],
    11: ["Oh! Concedo l'incontro.", "Sei elegante in lotta. Sabrina ti attende a Saffron."],
    12: ["Ho previsto il tuo arrivo.", "E ho previsto la tua sconfitta."],
    14: ["Prevedo grandi cose nel tuo futuro...", "Ti attende l'Elite Four."],
  },
  'johto-gyms': {
    0: ["I Capipalestra di Johto non sono facili da superare.", "Io, Falkner, sono il primo muro che devi infrangere."],
    2: ["Gli uccelli di mio padre non sono stati all'altezza.", "Prova Azalea Town adesso — Bugsy è tagliente."],
    3: ["I Pokémon di tipo Coleottero sono fraintesi.", "Permettimi di dimostrare il loro vero potere!"],
    5: ["Hmm! Sono dati che posso usare.", "Whitney è la prossima — ed è più dura di quanto sembri."],
    6: ["Questa volta non piangerò!", "Miltank, rotoliamo!"],
    8: ["W-waaah! Va bene, prendi la medaglia!", "Morty a Ecruteak ti farà prendere un bello spavento."],
    9: ["Benvenuto alla Palestra di Ecruteak.", "Vedo chiaramente la tua aura... ma tu riesci a vedere la mia?"],
    11: ["La tua luce brilla più di quanto immaginassi.", "Cianwood e Chuck sono i prossimi."],
    12: ["WAHAHAHA! Uno sfidante!", "Allena il corpo e i tuoi Pokémon ti seguiranno!"],
    14: ["Una lotta degna!", "La guardiana del faro di Olivine sarà la tua ultima prova."],
    15: ["Io... farò del mio meglio.", "Per favore, prendi la cosa sul serio."],
    17: ["Il legame con i tuoi Pokémon è bellissimo.", "Continua così!"],
  },
  'hoenn-gyms': {
    0: ["Benvenuto alla Palestra di Rustboro.", "Ti insegnerò che i tipi Roccia non vanno sottovalutati."],
    2: ["Eccellente... annotato.", "Brawly si allena a Dewford. Colpisce duro."],
    3: ["La grande onda sta arrivando, ragazzino!", "Mostrami il tuo spirito combattivo!"],
    5: ["Whoa! Cavalchi bene quell'onda.", "Wattson di Mauville avrà una bella carica per te."],
    6: ["Wahaha! Benvenuto, benvenuto!", "Le trappole della Palestra di Mauville ti daranno una scossa!"],
    8: ["Wahaha! Ora le scintille voleranno altrove.", "Lavaridge — e Flannery — bruciano come prossima sfida!"],
    9: ["Mio nonno ha costruito questa Palestra!", "Non deluderò la sua eredità — brucia!"],
    11: ["Io... ho imparato molto da te.", "Il leader di Petalburg è... beh, vedrai."],
    12: ["Dunque sei arrivato fin qui.", "Non ci andrò piano solo perché forse ci conosciamo."],
    14: ["Sono fiero di te.", "Winona di Fortree vola alto — fatti trovare pronto."],
    15: ["Sono Winona, esperta di tipi Volante.", "Vola con me — se riesci a tenere il passo!"],
    17: ["Voli più in alto di quanto immaginassi.", "I cieli di Hoenn ti danno il benvenuto, futuro Campione."],
  },
  'sinnoh-gyms': {
    0: ["Sono la Capopalestra di Veilstone, Maylene.", "Non trattenerti — io non lo farò!"],
    2: ["Colpisci duro. Rispetto.", "Crasher Wake farà un gran tuffo come prossima sfida — letteralmente."],
    3: ["Io sono Crasher Waaaaake!", "È ora di schiantarsi e schizzare, amico!"],
    5: ["Whoo-aah! Che bagno!", "Fantina di Hearthome ti incanterà fuori dalla Palestra."],
    6: ["Bonjour, mon challenger!", "I miei spettri ti danzeranno fino alla sconfitta!"],
    8: ["Magnifique! Hai danzato attraverso i miei spettri.", "Byron di Canalave — forte come l'acciaio — è il prossimo."],
    9: ["Wha-ha-ha! Uno sfidante robusto!", "L'acciaio non cederà facilmente!"],
    11: ["Hrm! Hai piegato il ferro.", "Snowpoint gela i cuori più duri — Candice ti aspetta."],
    12: ["Cia-ciao! Sono Candice!", "Concentrati, amico — il mio ghiaccio metterà alla prova il tuo spirito!"],
    14: ["Wow, sei davvero concentrato!", "Volkner di Sunyshore è l'ultima Palestra — e la più luminosa."],
    15: ["...Finalmente, uno sfidante che vale il mio tempo.", "Illumina la Palestra!"],
    17: ["Hai acceso qualcosa in me.", "Vai — la Lega Pokémon ti sta chiamando."],
  },
  'unova-gyms': {
    0: ["Benvenuto al ristorante della Palestra di Striaton.", "Specialità del giorno: una lotta con i Capipalestra Tripli!"],
    2: ["Tocca a me! È ora di accendere tutto!", "Preparati a sentire il calore!"],
    4: ["I miei eleganti Pokémon d'acqua ti ripuliranno per bene.", "Cominciamo?"],
    6: ["Benvenuto, caro, al Museo di Nacrene.", "È tempo di un progetto di ricerca — su di te!"],
    8: ["L'ispirazione arriva quando lotto.", "Creiamo insieme un capolavoro!"],
    10: ["Benvenuto nella mia Palestra elettrizzante, sfidante modello.", "Regaliamo uno spettacolo al pubblico!"],
    12: ["Ora sì che sei uno sfidante solido!", "Lascia che ti mostri com'è una vera scossa di terra!"],
    14: ["Benvenuto alla Palestra di Mistralton, la pista!", "Pronto a librarti? I miei uccelli ti porteranno in volo!"],
    16: ["Hmph. Il freddo rivela ogni debolezza.", "Lascia che geli il tuo spirito."],
    18: ["Opelucid ha atteso a lungo uno sfidante degno.", "Mostrami il fuoco di un vero allenatore di draghi!"],
    20: ["Meraviglioso!", "La Lega Pokémon di Unova ti attende, futuro Campione."],
  },
  'n-reawakening': {
    0: [
      "Ora porti delle medaglie. Lo capisco da lontano — dal modo in cui i Pokémon incontrano il tuo sguardo prima della tua mano.",
      "Mi raggiungerai in una radura che conosco? Quella con le betulle bianche, fuori dalla vecchia strada. Vorrei mostrarti qualcosa di quieto — prima che inizi la parte più dura del tuo viaggio.",
      "Ho ripensato, ancora, a una cosa che imparai dalla mia Zorua quando avevo sei anni. Una volta si allontanò da me. Per tre giorni interi. Sedetti nella neve e non la chiamai. Tornò perché voleva farlo, e in tutta la mia vita non ho mai stretto nulla con tanta forza quanto strinsi lei quella sera.",
      "È questa la prova, vero? Non se un Pokémon resta. Ma se qualcosa di lui torna.",
    ],
    1: [
      "Voglio proporti un esperimento. Un dono, se lo vincerai — e ti servirà, per ciò che verrà dopo le Palestre.",
      "Quando un allenatore frantuma un compagno, molti pensano che quella sia la fine. Una manciata di polvere, un piccolo dolore, e il mondo dimentica.",
      "La generazione di mia nonna sapeva di più. Sapeva che ciò che resta di un Pokémon dopo la frantumazione non è niente. Lo chiamavano **Memory** — la forma che la sua specie lascia sul mondo. Portala con te abbastanza a lungo, e diventa pesante del desiderio di tornare.",
      "Esiste un rito per questo. Una quieta offerta sotto il cielo aperto. La Memory risponde — non lo stesso compagno, no; quello se n'è andato, e su questo non mentiamo — ma un *nuovo esemplare della stessa specie*, desto e tuo, attirato qui dal disegno di ciò che era.",
      "I miei maestri lo chiamavano **Reawakening**. Gli antichi re lo proibirono — non sopportavano sudditi che li scegliessero due volte.",
      "Lotta con me. Se vinci, te lo insegnerò. E mi fiderò di te perché lo porti nelle tempeste che vi attendono.",
    ],
    3: [
      "Ecco. *Ecco.* Grazie.",
      "Ho osservato i tuoi Pokémon durante quella lotta, e li ho osservati mentre guardavano *te*, e sono soddisfatto. Il filo regge.",
      "Il rito è tuo. Quando un compagno è già passato oltre — frantumato e disperso — resta solo la sua **Memory**: la forma che la sua specie lascia sul mondo. Porta quella Memory in un luogo quieto. Ringraziala. Offrila alle stelle.",
      "Un nuovo esemplare della sua specie risponderà: natura fresca, potenziale fresco, muscoli freschi, nuove mosse apprese sotto la luna. Più rara è la famiglia, più Essence il rito ti chiederà; il mondo è prudente con i suoi esseri rari.",
    ],
    5: [
      "Vai ora. Là fuori ci sono persone che hanno dimenticato la differenza tra un legame e una bardatura — e presto ti metteranno alla prova su questo. Da qualche parte nella notte, una Memory aspetta di diventare di nuovo qualcuno.",
    ],
  },
  'team-rocket': {
    0: [
      "Ho ricevuto il tuo messaggio. E sì — sono di nuovo loro.",
      "Silph Co. ha smesso di rispondere al telefono due giorni fa. Officer Jenny ha trovato un sigillo sul retro delle porte dell'atrio. Una R rossa, cucita nella carta da parati come se fosse sempre stata lì.",
      "Team Rocket non se n'è mai andato davvero, capisci. Ha solo imparato ad aspettare. L'unica persona che potrebbe richiamarlo è colui che l'ha costruito.",
      "Non ti chiederò di entrare. Ti dirò solo ciò che Cynthia mi disse una volta, la prima volta che mi trovai davanti a una porta così. Un Pokémon addestrato è un dono piccolo e strano. Team Rocket è fatto dalle persone che hanno imparato a rubare quel dono. Non dimenticare quale di queste cose sei tu.",
    ],
    1: ["Ehi, ragazzino! Non sei sulla lista dei visitatori.", "Consegnaci i tuoi Pokémon e la chiameremo una bella passeggiata. Altrimenti il mio Koffing potrà salutarti."],
    3: ["Tsk — colpo fortunato. Il capo aveva detto che sarebbe arrivato un moccioso.", "Ti faranno risalire al decimo piano adesso, vero? Bene. Risparmiami la salita."],
    4: ["Sei tu quello che ci rovina la serata, eh?", "Team Rocket paga in contanti freddi e sentimenti ancora più freddi. Fidati — è il miglior lavoro che una ragazza possa avere a Kanto adesso."],
    6: ["...ok, va bene, sei bravo.", "Petrel è il prossimo. È... strano. Fingi solo di non accorgertene."],
    7: [
      "Ahh, quindi questo è il ragazzino famoso. Più giovane di quanto immaginassi. Bocca più tagliente, però — mi hai guardato come se ti dovessi qualcosa.",
      "Faccio imitazioni, sai. Piccolo hobby. Vuoi sentirmi fare il capo? *'Mi sei d'intralcio.'* Da brividi, vero? Mi esercito da anni.",
      "Basta riscaldamento. Vediamo come te la cavi con un vero razzo invece che con i petardi di sotto.",
    ],
    9: ["Va bene, va bene. Questa la vinci tu. Andrò a esercitarmi con una nuova voce.", "Proton è sulle scale. Non scherzare con lui. Non sa cosa siano gli scherzi."],
    10: ["Quindi sei tu quello che non smette di muoversi.", "Non ho nulla da dirti. Chi parla dà a chi ascolta qualcosa da usare. Io uso soltanto.", "I tuoi Pokémon non verranno restituiti. Qui nulla viene restituito."],
    12: ["...", "Vai, allora. La prossima porta è aperta. Non spreco fiato due volte."],
    13: [
      "Be'. Guardati — hai scalato tutto il nostro edificio in un pomeriggio.",
      "Mi ricordi qualcuno, in realtà. Un ragazzo che conoscevo. Era molto dolce, molto *rumoroso*, e già morto quando aveva sedici anni.",
      "Il problema dei bambini come lui, e come te, è che pensate che avere ragione sia uno scudo. Non lo è. È un pezzo di vetro molto bello.",
    ],
    15: ["...Ti ho giudicato male. Non vetro, allora. Qualcosa con più spigoli.", "Vai. Archer è in fondo al corridoio. È l'unico tra noi che al capo piace davvero. Fai attenzione a come ti poni davanti a lui."],
    16: [
      "Allenatore. Devi essere stanco. Per favore — siediti, se vuoi. Te lo sei guadagnato.",
      "Sono Archer. Sono la mano che ha riunito Team Rocket. Ariana mi chiama quello che *crede* in lui, e suppongo abbia ragione. Qualcuno doveva farlo.",
      "Non mi stai antipatico. Non credo che tu stia antipatico nemmeno a Giovanni. Sei semplicemente l'ultima serratura su una porta che apriamo da anni. Le serrature non vogliono essere scomode. Lo sono e basta.",
    ],
    18: ["...Scomodo, allora. Mi sbagliavo.", "Il capo aspetta. Mi ha chiesto di lasciarti passare se fossi arrivato fin qui. Diceva sempre che voleva incontrare il ragazzo di persona."],
    19: [
      "Dunque — tu sei il bambino.",
      "Ti ho osservato attraverso le telecamere di ogni piano. Ti muovi bene. I tuoi Pokémon si muovono meglio. È raro.",
      "Capisci cosa ho fatto per tutta la vita? Ho preso le creature più forti di questo continente e le ho rese utili. *Utili* — è l'unica parola onesta per ciò che un Pokémon è per una persona. Tutto il resto è decorazione.",
    ],
    20: ["Cynthia insegna ai bambini fili e conversazioni. Professor Oak scrive saggi sull'amicizia. Li rispetto. Davvero. Sono la vernice all'esterno di una macchina molto costosa.", "Io sono la macchina.", "Mostrami la tua macchina, allora. Vediamo quale funziona meglio."],
    22: [
      "...",
      "Ho sentito quell'ultimo colpo. Non nel mio Pokémon. In me. Che strano.",
      "Forse mi sono sbagliato su una cosa. Una macchina non sussulta quando perde. Tu — e le piccole creature ostinate dietro di te — avete sussultato *insieme*.",
      "Prendi l'edificio. Prendi la compagnia. Prendi la R sulla porta. Ho finito con loro. Non sono mai bastati.",
    ],
    23: [
      "L'ho sentito dall'altra parte della regione. Tutta la torre Silph che si scioglieva in silenzio.",
      "Ricordi cosa ti dissi all'incrocio? Che una lotta è una conversazione?",
      "Lui ne ha appena avuta una. Passerà il resto della vita a decidere se fosse con te, o con la parte di sé che ha abbandonato molto tempo fa. In ogni caso — alla fine non riguardava *il potere*.",
      "Vai a casa, allenatore. Oggi hai fatto una cosa rara.",
    ],
  },
  'aqua-magma': {
    0: [
      "Hai scelto una brutta settimana per finire il circuito delle Palestre. O una buona, dipende da quanto sei coraggioso.",
      "Team Aqua ha preso la baia dei sottomarini a Slateport. Team Magma ha preso il vulcano di Mt. Chimney. Entrambi inseguono la stessa coppia di Pokémon antichi, dai due estremi di una storia molto vecchia.",
      "La cosa peggiore non è che una delle due squadre sia crudele. È che *entrambe pensano di essere quella gentile*. Archie vuole che il mare copra il mondo perché la gente smetta di ferire l'oceano. Maxie vuole che la terra inghiotta il mare perché la gente smetta di annegare nelle tempeste.",
      "Nessuno dei due sta ascoltando Hoenn stessa. Mi serve qualcuno che *sappia* ascoltare. Andrai?",
    ],
    1: ["Ehi! Niente gente di terra asciutta oltre questo punto.", "Archie è occupato a *salvare il mondo*, e tu sei nella nostra scia."],
    3: ["Grr — va bene. Vai a cercare Shelly. Vediamo quanto le piaci."],
    4: [
      "Sei il ragazzino di cui i Capipalestra non smettevano di parlare. Più piccolo di quanto immaginassi.",
      "Sarò breve. Il mare è stato una discarica per cent'anni. Ogni corallo che apro ha una sigaretta dentro. Ogni pesce che marchio ha una storia che non dovrebbe avere.",
      "Archie spazzerà via tutto questo. E sì, ci costerà alcune cose. Cose di terra. Cose *tue*. È così che si paga un debito.",
    ],
    6: ["...D'accordo. D'accordo.", "Matt sta sorvegliando il sottomarino. Non lasciarti spaventare — è soprattutto gomiti."],
    7: ["WOOO! Sì! Finalmente qualcuno si è fatto vivo! Mi sono allenato per questo!", "Archie dice di lottare con intelligenza. Archie dice di pensare prima. Archie dice che parlo troppo forte.", "Archie non è qui adesso, vero? ANDIAMO, ragazzino!"],
    9: ["Ah! AHAHA! Oh, cavolo, mi hai *preso*! È stato fantastico!", "Vai dal capo. Digli che Matt ha detto che gli piacerai. Non è vero, ma diglielo lo stesso."],
    10: [
      "Sei venuto fin quaggiù solo per discutere con me? Lo rispetto, ragazzo. Davvero.",
      "Ascolta. Ho passato tutta la vita sull'acqua. So com'è il suono di un mare che muore. Ogni anno è più silenzioso. Non ci sono più canti di balene nel golfo. Nessun Wailord che risponde. Le vecchie acque stanno *morendo di fame*.",
      "Non sono un uomo cattivo. Sono solo l'unico che ha smesso di fingere.",
    ],
    11: ["La tua maestra Cynthia direbbe che non sto ascoltando. Si sbaglia. Ho ascoltato per tutta la vita. Semplicemente non mi piace la risposta che ho ricevuto.", "Allora facciamo una delle sue *conversazioni*. Tu e io. Più forte che puoi."],
    13: ["...", "Lotti come fa l'oceano. Non contro di me — *intorno* a me. Prendendo ciò che è debole e lasciando il resto.", "Bene. Vai a fermare anche Maxie, se puoi ancora. E dopo — vieni a cercarmi. C'è una spiaggia a Pacifidlog su cui non cammino da anni. Vorrei vederla con qualcuno che non vuole niente."],
    14: ["Niente estranei sulla montagna!", "Maxie sta perforando fino alla vena di magma. Nulla ci fermerà — non un moccioso di mare, e di certo non tu."],
    16: ["Sparisci una buona volta! Courtney si occuperà di te!"],
    17: ["Bersaglio. Acquisito.", "Sono Courtney. Sono una ricercatrice. Non provo rabbia. Provo solo *schema*.", "Lo schema dice: c'è troppo oceano. Lo schema dice: la terra deve aumentare. Lo schema dice: gli ostacoli vengono rimossi. Tu sei un ostacolo. Non è personale."],
    19: ["Schema regolato. Ostacolo resta. Ostacolo è... interessante.", "Procedi. Tabitha sorveglia la caldera."],
    20: [
      "Sei arrivato più lontano di qualsiasi allenatore sia mai arrivato nei ranghi di Magma. Congratulazioni.",
      "Non intendo lasciarti raggiungere Maxie. Non perché tu mi stia antipatico — ti conosco appena — ma perché è l'unica persona nella mia vita che mi abbia mai fatto sentire *utile*, e gli devo tutto.",
      "Un uomo che ti salva dall'essere nulla incendierà il mondo per te se glielo chiedi. Questo è il segreto che nessuno all'università vuole stampare.",
    ],
    22: ["...Hai vinto. Sono finito. Ti chiedo solo che, qualunque cosa tu gli dica dopo, gliela dica *con dolcezza*. Lui ci ama. Ama solo un po' di più la montagna."],
    23: [
      "Ah. Tu. Mi chiedevo se ti avrebbero mandato i Capipalestra, o se Archie ti avrebbe convinto prima della sua versione.",
      "Guardati attorno, allenatore. La caldera è calda. La montagna è sveglia. Sai quante persone annegano ogni anno a Hoenn? Settecentoventinove, all'ultimo conteggio. Sai quante bruciano?",
      "Sette. L'acqua ha sempre ucciso più di noi del fuoco. Non sono un fanatico. Sono uno *statistico*.",
    ],
    24: ["Archie crede che annegare il mondo lentamente sarebbe più gentile che lasciare che la natura lo anneghi a pezzi. È sentimentale. Magma sarebbe rapido. Magma sarebbe definitivo. Magma sarebbe, alla fine fredda, *misericordioso*.", "Non ti convincerò. Non credo che me lo permetteresti. Quindi — lascia che discutano i miei Pokémon. Lo dicono sempre meglio di me."],
    26: ["...", "I miei numeri erano puliti. Il mio ragionamento era solido. Eppure tu mi hai appena... *confutato*, con niente più che una manciata di Pokémon ordinari che per caso si tenevano ancora per mano.", "C'è una variabile che non ho considerato. Dovrò ricominciare.", "Vai. Di' ad Archie che anche lui aveva torto. Forse, se abbiamo torto entrambi insieme, possiamo smettere di urlare."],
    27: ["Hai acquietato entrambi i vulcani. Uno di roccia. Uno di uomini.", "Hoenn respira meglio stanotte di quanto abbia fatto in un decennio. E la cosa buffa — nessuno di quei due mentiva. Raccontavano entrambi una storia vera, con un finale sbagliato.", "Cynthia mi ha scritto la settimana scorsa. Diceva che eri il primo allenatore incontrato da molto tempo i cui Pokémon avrebbero *perso* per te prima di lasciarti. Allora non capivo cosa intendesse. Ora sì."],
  },
  'team-rocket-revival': {
    0: ["Sta succedendo di nuovo. Ma non come ti aspetteresti.", "Tre anni dopo Silph. La Torre Radio di Goldenrod sta trasmettendo di notte un vecchio segnale disturbato su una sottobanda. Kurt ad Azalea dice che i suoi Slowpoke si mettono in fila quando comincia. Le code non ricrescono per giorni.", "Questo non è Giovanni. È nascosto, se è vivo. È qualcuno che si sforza molto di essere lui. Stai attento, allenatore. Una copia di un cattivo a volte è peggio dell'originale — le copie hanno qualcosa da dimostrare."],
    1: ["Sono venuto perché il segnale fa male.", "Io sento i Pokémon come tu senti la musica. E stanotte, nella banda bassa, li sento venire *accordati*. Costretti in una tonalità in cui non sono nati. È la cosa peggiore che abbia provato da quando ero bambino.", "Non posso combattere le persone che l'hanno costruito. Non sono... più quel tipo di persona. Ma tu sei un allenatore, e i Pokémon al tuo fianco ti hanno scelto liberamente. Accompagnami su per la torre. Ti dirò cosa sento a ogni piano."],
    2: ["Ah, un fan? Il capo ha detto che avremmo avuto il solito ragazzino curioso.", "Hai sentito anche tu la trasmissione, scommetto. È orecchiabile, vero? Non importa. Tu non sali."],
    4: ["Lo Zubat alla cintura di quel recluta — le sue orecchie sanguinano. Il segnale li spinge oltre la loro portata.", "Continua a salire. Il prossimo piano è più forte."],
    5: ["Hai portato un *tipo* coi capelli verdi su una torre radio? Eh. Appuntamento strano.", "Team Rocket è tornato, ragazzino. Giovanni o non Giovanni. Le idee non hanno bisogno di un volto."],
    7: ["Be', ciao di nuovo. Ti ricordi di me? Torre Silph, nono piano, quello con la *voce*.", "*Ehm.* '...Non ho bisogno di eroi. Ho bisogno di potere. E tu sei sulla mia strada.' Funziona ancora? Sii sincero.", "Gestisco tutta questa operazione da mesi. Le reclute pensano che io *sia* lui. Perfino Archer ci è cascato una volta. È un uomo con gli occhi chiusi e le orecchie aperte — il miglior tipo di seguace."],
    9: ["Ok, ok. Evidentemente le lezioni di voce non bastavano.", "Sali pure. I veri credenti aspettano."],
    10: ["Di nuovo tu.", "La volta scorsa non ti ho detto nulla. Stavolta dirò una cosa — il segnale è stata una mia idea. I Pokémon ascoltano la stessa frequenza che le balene usano per chiamare casa attraverso l'oceano. A quanto pare puoi chiamarli altrove con quella. Ovunque altrove.", "Immagina cosa potrebbe fare un ragazzo come te con un esercito che arriva quando fischi."],
    12: ["Stava per vendere quell'idea ai governi. Ha già un compratore.", "Ancora un piano. In cima alla torre vive il trasmettitore. Ariana non si muoverà da lì. Crede che Giovanni stia tornando, e gli ha costruito un pulpito."],
    13: ["Tu sei il bambino che ha finito il mio capo. Ti ho pensato ogni notte da allora.", "Sai cosa significa amare un uomo che ti ha resa qualcuno? Prima di Giovanni non ero niente — una cameriera di Celadon con un brutto carattere e un taglio di capelli economico. Mi guardò per dieci secondi e disse: 'Tu guiderai il mio reparto pubblicità.' E lo feci. Ed ero *brava*.", "Dopo che lo hai battuto è rimasto in silenzio. Non sapevamo cosa fare. Così abbiamo costruito questo — un segnale che lo chiama a casa. Se i Pokémon possono sentirlo, forse anche lui può. Forse si ricorderà di noi."],
    15: ["...Non avrebbe mai funzionato, vero.", "Non arriverà. Non sarebbe mai arrivato. Archer — Archer continuava a dire 'solo un'altra trasmissione.' Io ero quella che versava da bere. L'ho sentito piangere una volta. Ho finto di no.", "Vai. Spegni la torre. Spegni noi."],
    16: ["Allenatore. Mi ricordo di te.", "Alla Silph ti dissi che le serrature non vogliono essere scomode. Ho pensato a quella frase per anni. Mi sbagliavo. Le serrature *vogliono* essere scomode. È proprio il senso di una serratura. È ciò che eravamo.", "Senza di lui, ho dovuto scegliere cosa amare. Ho scelto la sua *forma*. Una voce. Un segnale. Una trasmissione. L'ho insegnata a ogni Pokémon in questo edificio. L'ho chiamata *lui*.", "E poi sei tornato. E ho capito — l'unica persona al mondo che può distinguere una copia dall'originale è chi una volta ha sconfitto l'originale."],
    17: ["Un'ultima lotta, allora. Non per lui. Per la serratura. Così almeno stavolta la porta si chiuderà pulita."],
    19: ["...", "Buonanotte, allenatore. Il segnale è spento. I Pokémon fuori hanno smesso di camminare. Puoi sentire di nuovo i grilli — io non li sentivo da sei mesi.", "Se mai lo vedrai — digli che la sua compagnia era buona. Digli che la sua gente ha aspettato. E digli... che abbiamo finito di aspettare."],
    20: ["Il cielo è quieto. Gli uccelli volano nella direzione sbagliata — stanno ricordando dov'è il sud. Ci vorrà qualche ora.", "Grazie per aver fatto ciò che io non potevo. Ho passato così tanto tempo ad arrabbiarmi con gli *uomini* che dimentico che alcuni di loro stanno già soffrendo, e costruiscono i propri mostri con quel dolore.", "Torna a casa lentamente. Tieni le mani dei tuoi Pokémon. Il filo ha retto stanotte, ed è stato grazie a te."],
  },
  'team-galactic': {
    0: ["Sono tornata a Sinnoh perché ho sentito il cielo inclinarsi.", "Non lo troverai ancora su nessun giornale. Un uomo di nome Cyrus, che possiede metà di Veilstone, compra da dieci anni manufatti legati a Dialga e Palkia. In silenzio. Legalmente. Attraverso trentuno società di comodo.", "La settimana scorsa una sua dipendente — una ricercatrice dai capelli grigi di nome Charon — ha depositato il brevetto di una macchina chiamata 'Catena Rossa.' La descrizione dice che risuona con *il tessuto della realtà.* Dice anche, in una nota, che lo scopo previsto è 'riavviare' quel tessuto.", "Non sono una detective, allenatore. Ma sono molto spaventata. Cammineresti con me?"],
    1: ["Affari di Galactic. Circola.", "Il capo sta costruendo un mondo migliore. Il tuo 'mondo' è d'intralcio."],
    3: ["Fortunato. I Comandanti sono su ogni piano sopra di te. Su uno di loro la fortuna ti finirà."],
    4: ["Be', ciao! Non dirmelo — tu sei *l'allenatore*! Quello di cui tutti spettegolano!", "Vuoi sapere un segreto divertente? Sono l'addetta al morale di Galactic. Il mio vero lavoro è far sentire meglio tutti qui per il fatto che stiamo per cancellare l'universo. Li tiro su in mensa. Faccio karaoke. Sono *così brava*.", "Cyrus non sorride. Ha detto che la missione non ne aveva bisogno. Io non ero d'accordo. Sorrido il *doppio*, così la media torna giusta."],
    6: ["Uff! Ok! Be'! Ho perso, vero!", "Non sentirti in colpa, allenatore. Perdo contro Cyrus a scacchi ogni mercoledì. Ci sono abituata.", "Jupiter è sull'ascensore. Non ti sorriderà. È il suo lavoro."],
    7: ["Tu sei l'ostacolo menzionato da Mars. Più piccolo di quanto suggerisse il suo rapporto.", "Sono Jupiter. Gestisco la sicurezza interna. I miei Pokémon e io abbiamo una regola: non perdiamo contro gli ostacoli.", "Cyrus dice che l'emozione è rumore. Non sono d'accordo con tutto ciò che dice — mi piace vincere, per esempio — ma su questo sì. Dovresti provare a zittirti qualche volta. È molto efficiente."],
    9: ["...Ho perso. Che strano. Dovrò ricalibrare.", "Saturn è nel laboratorio interno. È lui che ha *costruito* ciò che stiamo per avviare. Parlagli, se puoi. Lui ascolta. Non ho mai capito perché."],
    10: ["Allenatore. Ti prego — ho due minuti. La Catena Rossa si sta caricando. Voglio usarli con attenzione.", "Sono stato il primo dipendente di Cyrus. Sono io che ho scritto le specifiche della Catena. Ho pensato ogni giorno per un anno se fosse giusto finirla.", "Non è crudele. Lo capisci? Non è arrabbiato. Ha semplicemente deciso che ogni cosa brutta mai accaduta a un essere vivente in questo universo accade *perché* quell'essere può sentire. Rimuovi il sentimento, e la sofferenza finisce con esso.", "Penso che abbia torto. Penso che abbia meravigliosamente, terribilmente torto. Ma lotterò comunque con te, perché me lo ha chiesto, e non ho ancora trovato il momento in cui rifiutarglielo."],
    12: ["...Quello è il momento, allora. Quello che stavo aspettando.", "Passa oltre. Spegnerò l'anello esterno. Guarderò il mio Toxicroak bere acqua per la prima volta in una settimana. Ricorderò a cosa serve un Pokémon.", "È nella camera interna. Non griderà. Non grida mai."],
    13: ["Tu sei il bambino portato dalla Campionessa.", "Non ti odio. Non odio nessuno. Ho passato l'infanzia a guardare i miei genitori odiarsi attraverso il tavolo da pranzo, e a nove anni ho deciso che l'odio è solo un sentimento in cerca di una scusa.", "Tutti i sentimenti lo sono. Amore, paura, dolore, gioia — sono scuse che il cervello inventa per giustificare altro di sé. Togli al cervello il permesso di sentire, e togli a tutti la scusa per rovinare ogni cosa."],
    14: ["La tua maestra Cynthia ti ha detto che la terra è tenuta insieme dal filo. Sono d'accordo con lei. Penso solo che il filo sia la fonte del nodo, non la cura.", "Dialga, Palkia. Tempo, spazio. Chiederò loro un mondo senza alcun filo. Un foglio pulito e quieto. Nessuno soffrirà. Nessuno amerà. Sono la stessa parola, allenatore, scritta con due caratteri diversi.", "Mi rendo conto che non sarai d'accordo con me. Il disaccordo è esso stesso un sentimento. Mostrami quanto ne hai costruito — e io ti mostrerò quanto poco valeva."],
    16: ["...", "I miei Pokémon non si rialzano. Mi stanno guardando. Non li ho mai visti guardarmi prima.", "Qualcosa nel modello è sbagliato. Forse il filo *non* è il nodo. Forse è ciò che impedisce all'universo di diventare un nodo.", "Io... ho bisogno di tempo. Ho bisogno di pensare. Ho bisogno di *silenzio*, che è l'unica emozione che sia mai stato disposto ad ammettere. Permesso."],
    17: ["...Ho guardato tutto dal monitor. Non credo di aver respirato.", "Mi ha restituito le mie parole, l'hai sentito? Ha preso il filo e lo ha chiamato nodo. Per un momento ho pensato — *e se avesse ragione? E se avessi insegnato questo ai bambini per dieci anni e fossi io la sciocca?*", "E poi i tuoi Pokémon si sono alzati. E ti hanno guardato. E ho saputo la risposta. L'ho visto *accadere*, e l'ho saputo.", "Il filo è ciò che impedisce all'universo di diventare un nodo. Aveva la geometria al rovescio. È un sollievo per cui berrò tè per anni."],
    18: ["Grazie per essere venuto quando ti ho chiamato. Pochissime persone lo avrebbero fatto. Ancora meno avrebbero vinto.", "Vai a casa. Percorri la strada del lago — i Pokémon lì usciranno a incontrarti stanotte. Lo hanno sentito anche loro. Sono sempre i primi a sentirlo."],
  },
  'team-plasma': {
    0: ["Non sarei venuto per questo, se avessi potuto evitarlo.", "Conosci l'altra metà della mia storia, allenatore. Mi hai visto agli incroci, ai fiumi, ai margini delle foreste dove sentivo i miei Pokémon dissentire da me. Sei stato molto paziente.", "C'è una persona con cui non parlo da quando l'ho lasciato. Mi ha cresciuto. Mi ha vestito con una corona di cui non vedevo l'interno. Mi ha messo attorno dei saggi come una gabbia di uomini ragionevoli, e mi ha insegnato che ogni frase che dicevo era anche sua.", "Il suo nome è Ghetsis. Sta ancora trasmettendo. Ha ancora seguaci. E c'è una mente fredda chiamata Colress che prova i loro Pokémon in un laboratorio fuori Opelucid, per vedere se può farli obbedire senza *nulla* di ciò che chiamavamo legame. Non posso affrontarne nessuno da solo. Ti prego."],
    1: ["Alt, allenatore! Plasma esige la liberazione di tutti i Pokémon!", "...anche specificamente quelli nelle tue tasche. Consegnali e la chiameremo liberazione."],
    3: ["Tsk — bene, tieniti i tuoi amici rubati. I saggi ti sistemeranno."],
    4: ["Dunque. L'*allenatore scelto* da N. Ho sentito il Signore parlare di te. Non gli piaci.", "Sono uno dei sette. Ero con lui prima che tu nascessi. Ho aiutato a scrivere i discorsi che hanno cresciuto quel ragazzo come un fiore da serra — alto, bello, fragile e inutile fuori dal vetro.", "Tu gli hai tolto il vetro. Per questo non ti perdonerò, e non perderò."],
    6: ["...Hai rotto il mio ghiaccio con la stessa facilità con cui hai rotto lui. Prevedibile.", "Vai. Rood ti aspetta. Era uno di noi. Non lo è più. Destino da traditore."],
    7: ["Allenatore — aspetta. Non sono qui per fermarti.", "Ero uno dei sette saggi. Ho servito Ghetsis per trentun anni. Ho insegnato a N a leggere il canto dei Pokémon dalla culla. Ho anche visto l'uomo di cui mi fidavo trasformare il mio studente in un burattino e dirgli che era un'incoronazione.", "Ho lasciato Plasma due anni fa. Ho preso i Pokémon che il Signore aveva dimenticato — quelli che chiamava 'simbolici' — e li sto restituendo alla natura, un fiume alla volta. Questa è la mia penitenza.", "Non posso fermare Ghetsis da solo. Ma posso metterti alla prova. Se meriti ancora di stare davanti a lui, i miei Pokémon te lo diranno. Se non lo meriti — meglio impararlo ora, da me, che dopo, da lui."],
    9: ["...Meriti di stare davanti a lui. Vai.", "Un'altra cosa — l'uomo freddo, Colress, non è Plasma. Non davvero. È uno scienziato, e la sua moneta è la *curiosità*. Sarà nella prossima camera. Vuole confrontarti con il ragazzo che chiama N. Accontentalo, o no. Ma non sottovalutarlo — è l'unico in quell'edificio che non mente."],
    10: ["Ah! L'*altro* allenatore. Eccellente. Eccellente.", "Sono Colress. Ho passato buona parte della carriera a testare l'ipotesi che la forza di un Pokémon sia esattamente pari alla forza del suo legame con l'allenatore, ponderata dalla forza di volontà dell'allenatore e divisa per il numero di volte in cui l'allenatore lo ha deluso in pubblico.", "È un'equazione disordinata. I tuoi dati, però — i tuoi dati sono *notevoli*. Ho seguito le tue lotte dai registri della lega. La deviazione standard della tua squadra è quasi nulla. Il che è, perdonami, *bellissimo*.", "Non mi importa di Ghetsis. Mi importa del grafico. Prestami altri cinque punti dati, se vuoi."],
    12: ["*Ahh.* Meraviglioso. Il coefficiente è pulito. Scriverò di questa lotta per il prossimo decennio.", "Ti devo un favore. Quando aprirai la prossima porta, Ghetsis tenterà di far colpire te dal suo Hydreigon prima che tu finisca la prima frase. Ho *sottilmente* scollegato il proiettore che voleva usare per intimidirti. Odia lavorare senza proiettore. Divertiti."],
    13: ["È dall'altra parte di quella porta. Lo sento camminare avanti e indietro. Lo fa quando le luci si spengono — lo ha sempre fatto.", "Allenatore. Devo chiederti qualcosa di difficile. Ho passato sei mesi a guardarti costruire una squadra che discute con te. Pokémon che rifiutano mosse che scegli, che ti fulminano con lo sguardo quando li curi, che ti amano *nonostante* te. È ciò che ho sempre voluto, e non ho mai osato creare.", "Ti dirà che il legame è una bugia. Ti dirà che io sono suo. Ti dirà che ciò che hai è uno spettacolo di burattini e che lui è l'unico ad aver mai tolto i guanti.", "Ti prego — non ascoltarlo. È un uomo molto persuasivo. Ha fatto di me un *re* senza che lo sapessi. Non farà lo stesso con te. Non oggi. Vai."],
    14: ["Dunque. L'*altro* bambino.", "N parlava di te nelle rare occasioni in cui riuscivo a costringerlo a parlare. Parlava con un calore che non avevo mai sentito in lui, e fu — lo ammetto — profondamente scomodo.", "Tu sei il motivo per cui il mio regno non è avvenuto. Avevo tutto. Un ragazzo di cui possedevo la lingua. Sette saggi pronti ad annuire. Un continente che aveva dimenticato cosa significasse dire *no*. E poi tu sei entrato in una radura con un Oshawott stanco e gli hai chiesto, *'Chi sei?'* Come se fosse una cosa a cui gli era permesso rispondere."],
    15: ["Non ripeterò i suoi argomenti davanti a te. Non sono d'accordo con loro. Non lo sono mai stato. Plasma era il *mio* strumento; la filosofia era un guinzaglio. Ho usato il linguaggio della liberazione per costruire la gabbia più stretta che Unova avesse mai visto, e il mio ragazzo l'ha indossata per dieci anni ringraziandomi ogni mattina.", "I legami, allenatore, sono *bardature*. Ciò che chiami amore tra te e i tuoi Pokémon è soltanto la corda più morbida mai inventata. Lo so perché l'ho tirata, ed è sempre venuta.", "Avanti, allora. Tira la tua. Vediamo se si spezza di netto o se servono alcuni tentativi."],
    17: ["...", "Il mio Hydreigon non si alza. Lei mi sta *guardando*. Non mi ha mai guardato prima. La possiedo da undici anni.", "Una bardatura non guarda indietro il suo cavaliere. Una bardatura è una *bardatura*. A meno che non fosse qualcos'altro, per tutto il tempo, e io abbia semplicemente fallito nel notarlo.", "No. No. Rifiuto questa conclusione. Ho lavorato troppo duramente. Prenditi mio figlio, se devi — già non è più mio. Prenditi la mia squadra. Prenditi la mia torre. Non prenderò il pensiero di essermi sbagliato."],
    18: ["Se n'è andato. È uscito dalla porta sul retro continuando a dirsi di aver vinto.", "Va bene così. Le persone come lui escono sempre dalla porta sul retro. La porta principale è dove il resto di noi dice buonanotte.", "Allenatore — non credo che piangerò, e non credo nemmeno che mi sentirò orgoglioso, ed è una cosa strana e quieta da provare dopo dieci anni in cui ti dicono di sentire esattamente in un solo modo.", "Grazie. Per la cosa che non è né orgoglio né dolore. Per il luogo quieto nel mezzo, dove un ragazzo può essere semplicemente una persona per la prima volta."],
    19: ["Ho guardato questa da Sinnoh. Steven era seduto accanto a me. Nessuno dei due parlava.", "Ora hai chiuso ogni anello lasciato aperto dalla scorsa generazione di cattivi. Rocket. Aqua. Magma. Galactic. Plasma. Ognuno pensava di aver trovato l'unico modo corretto di tenere un Pokémon. Ognuno aveva torto, e ognuno aveva torto in una forma interessante diversa.", "Ciò che hai tu, allenatore, è l'unica risposta corretta. È: *tu non li tieni*. Stai accanto a loro. Chiedi loro delle cose. Loro rispondono. È abbastanza.", "È sempre stato abbastanza. Dovevi essere tu, da sempre, a dimostrarlo."],
  },
  'kanto-e4': {
    0: ["L'Elite Four ti attende.", "Solo i più forti possono passare."],
    1: ["Benvenuto, sfidante.", "Io, Lorelei dell'Elite Four, ti congelerò sul posto."],
    3: ["Hwa-haa!", "Sono Bruno. I miei Pokémon lottatori ti schiacceranno!"],
    5: ["Oak ha parlato di te, ragazzo.", "Vediamo se sopravvivi ai miei spettri!"],
    7: ["Sono Lance, il Maestro dei Draghi.", "Mostrami di che pasta sei fatto!"],
    9: ["Sei davvero degno.", "Ma c'è ancora uno sfidante..."],
    10: ["Yo! Da quanto tempo!", "Sono l'allenatore più forte di Kanto. Non dimenticarlo!"],
    12: ["Tsk... be', non sei male.", "Tornerò più forte. Contaci."],
  },
  'johto-e4': {
    0: ["Benvenuto, io sono Will.", "Mi sono allenato in tutto il mondo. I miei Pokémon psichici sono imbattibili!"],
    2: ["Fwahahaha!", "I veleni di un ninja saranno la tua rovina!"],
    4: ["Ci incontriamo di nuovo.", "I miei pugni sono più taglienti che mai!"],
    6: ["Sono Karen dell'Elite Four.", "Preferisco i Pokémon che mi piacciono personalmente — i sentimenti forti creano Pokémon forti."],
    8: ["Benvenuto nella stanza del Campione.", "Sono Lance, l'allenatore di draghi. Questa volta non si perde!"],
    10: ["Tu... hai sconfitto perfino me.", "Sei il nuovo Campione di Johto."],
  },
  'hoenn-e4': {
    0: ["Ehi, hai fegato.", "Sono Sidney — il tipo Buio è il mio campo, e non gioco pulito."],
    2: ["Ciao! Sono Phoebe.", "Mi sono allenata con gli spiriti sul Mt. Pyre. Non mi hanno mai lasciata andare del tutto..."],
    4: ["Benvenuto.", "I miei Pokémon Ghiaccio si sono congelati di passione il giorno in cui ti hanno incontrato."],
    6: ["Sono Drake, dell'Elite Four.", "Cavalcare draghi richiede coraggio. Mostrami il tuo!"],
    8: ["Benvenuto, sfidante.", "Sono Steven, il Campione di Hoenn. Che le nostre pietre si scontrino!"],
    10: ["Una lotta davvero abbagliante.", "Hoenn ha un nuovo Campione."],
  },
  'sinnoh-e4': {
    0: ["Benvenuto alla Lega Pokémon.", "Sono Aaron — i tipi Coleottero sono molto più forti di quanto la gente pensi!"],
    2: ["Be', salve, giovanotto!", "Nonna Bertha ti insegnerà quanto può essere forte la terra."],
    4: ["Pronto a infiammarti?", "I miei tipi Fuoco ti bruceranno fino a ridurti in cenere!"],
    6: ["Un momento, per favore — lasciami finire questo paragrafo.", "Ora... cominciamo?"],
    8: ["Sono Cynthia, la Campionessa di Sinnoh.", "Non perdo mai alla leggera. Porta tutto ciò che hai!"],
    10: ["Che lotta emozionante...", "Sei davvero un Campione. Sinnoh è tua."],
  },
  'unova-e4': {
    0: ["Tu... sei un'ispirazione per il mio prossimo romanzo.", "Lascia che i miei tipi Spettro infestino la pagina!"],
    2: ["Hyaaaah!", "Ti mostrerò la forza di un vero artista marziale!"],
    4: ["La vita è un serio gioco d'azzardo.", "Ti va di puntare su questo incontro?"],
    6: ["Mi sono svegliata dal mio sonno per te.", "Mostrami una lotta degna del sogno."],
    8: ["Hahaha! Che corsa incredibile!", "Sono Alder, il Campione di Unova. Godiamocela!"],
    10: ["Una lotta davvero ardente!", "Ora sei il Campione di Unova. Porta il titolo con orgoglio."],
  },
  'red-challenge': {
    0: ["Hai battuto l'Elite Four in due regioni...", "Ma Red è su un altro livello.", "Non parla. Lotta e basta."],
    2: ["..."],
  },
  'cynthia-rematch': {
    0: ["Mi sono allenata dalla nostra ultima lotta.", "Questa volta niente trattenersi."],
    2: ["Magnifico... Sei davvero l'allenatore più forte che abbia mai affrontato."],
  },
  'n-finale': {
    0: ["Sei venuto. Speravo che lo facessi.", "Ricordi cosa ti dissi all'inizio? Del filo — quella piccola linea di sentimento filata tra un allenatore e un Pokémon con ogni momento condiviso?", "Il tuo è diventato una corda. Più spessa di qualsiasi cosa il mondo abbia visto da molto tempo. E lui se n'è accorto.", "N ha passato tutti questi mesi a viaggiare dietro di te, ascoltando. E da qualche parte là fuori, i Pokémon più antichi del mondo — quelli che sono il filo stesso — hanno iniziato a rispondergli.", "Ti aspetta lungo il sentiero. Non fingerò che sia solo un'altra lotta. Vai con prudenza."],
    1: ["Sei venuto. Grazie.", "Ti ho osservato dal margine di ogni città, ogni Palestra, ogni Lega. Ho sentito i tuoi Pokémon diventare più forti, più felici, più fieri. Li ho sentiti amarti.", "Eppure non sono ancora sicuro. Non ancora. Perché ho anche sentito — in voci più antiche, voci che cantavano prima che il primo essere umano parlasse — domande a cui nessuno vivo ha risposto. Le farò attraverso tre lotte. Tre domande, tre squadre. Se riuscirai a tenere il tuo filo contro tutte e tre, crederò a ciò a cui voglio credere."],
    2: ["La prima domanda — la più semplice. *Ciò che provate è reale, o è solo ciò che li hai addestrati a provare?* Il mio compagno la farà per me. Non avere paura."],
    4: ["...Una verità non basta. Un orecchio addestrato può scambiare un buon imitatore per una voce vera.", "La seconda domanda, allora. *Il mondo che sogni di condividere con loro — lo sceglierebbero, se potessero parlare?* Mostrami cosa vorresti che volessero."],
    6: ["...Penso di stare sorridendo. Non me lo aspettavo.", "Un'ultima domanda. La più antica. Nessuno di noi ha una risposta — ma voglio vedere cosa succede quando la chiediamo insieme. *Se il filo potesse essere reciso, e i tuoi Pokémon scegliessero comunque di restare — lo farebbero?*", "Kyurem è il silenzio su cui il tuo filo è teso. I kami sono venuti perché il cielo sta ascoltando. Lotta con me un'ultima volta."],
    8: ["...Ha retto. Perfino contro Kyurem, ha retto.", "Sono rimasti con te. Non perché tu glielo abbia ordinato. Perché hanno scelto di farlo. Era questo che dovevo sapere. È l'unica risposta che abbia mai voluto. Grazie, allenatore. Davvero."],
    9: ["Li libererò di nuovo nel vento, nella tempesta e nei luoghi profondi da cui provengono. Non dovrebbero appartenere a nessuno — men che meno a me.", "E poi andrò da qualche parte di quieto. Voglio ascoltare di nuovo, davvero, senza domande in testa per una volta. Se mai sentirai una vocina che non riconosci, sulla strada o in sogno — potrebbe essere uno dei miei, di passaggio. Salutala per me.", "Prima di andare — un altro dono. O forse un promemoria.", "Il filo non diventa più forte solo in lotta. Cresce quando *giocate*. Quando ridete con loro, quando lanci una mela e la prendono al volo guardandoti come se avessi compiuto un miracolo. Guardavo i bambini farlo, e ne capivo meno di quanto avrei dovuto.", "Prova. Porta uno di loro in un posto soleggiato, un posto che non sia una lotta. Sentirai il filo vibrare. È bello."],
    10: ["L'ho sentito dall'incrocio. L'ha sentito tutto il cielo.", "Hai tenuto il filo contro il silenzio stesso. Capisci cosa significa?", "Significa che oggi il mondo è un po' più intrecciato di ieri. Grazie a te. Grazie a loro.", "Grazie per aver percorso la lunga strada. Ora — vai dove vuoi andare. Il sentiero è tuo."],
  },
};

function getBrowserLocale(): StoryLocale {
  if (typeof navigator === 'undefined') return 'en';
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((language) => language.toLowerCase().startsWith('it')) ? 'it' : 'en';
}

export function getStoryLocale(): StoryLocale {
  try {
    const override = typeof localStorage !== 'undefined' ? localStorage.getItem(STORY_LOCALE_STORAGE_KEY) : null;
    if (override === 'en' || override === 'it') return override;
  } catch {
    // Ignore storage access failures and fall back to the browser locale.
  }
  return getBrowserLocale();
}

export function getStoryDialogueLines(
  storylineId: string,
  stepIndex: number,
  englishLines: readonly string[],
  locale: StoryLocale = getStoryLocale(),
): readonly string[] {
  if (locale !== 'it') return englishLines;

  const translatedLines = ITALIAN_STORY_DIALOGUE[storylineId]?.[stepIndex];
  return translatedLines && translatedLines.length === englishLines.length ? translatedLines : englishLines;
}
