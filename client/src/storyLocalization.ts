import type { StoryStep } from '@shared/story-data';

type StoryStepTranslation = {
  readonly infoTitle?: string;
  readonly lines?: readonly string[];
};

type StoryTranslationMap = Record<string, Record<number, StoryStepTranslation>>;

export const ITALIAN_STORY_TRANSLATIONS = {
  "oak-starters": {
    0: { lines: [
      "Ciao! Benvenuto nel mondo dei Pokémon!",
      "Il mio nome è Oak. La gente mi chiama il Professore Pokémon.",
      "Devi essere un nuovo allenatore. Ho qualcosa di speciale per te.",
    ] },
    1: { lines: [
      "Ho preparato cinque squadre di Pokémon iniziali.",
      "Ogni squadra viene da una regione diversa.",
      "Scegli con saggezza — saranno i tuoi primi compagni!",
    ] },
  },
  "cynthia-intro": {
    0: { lines: [
      "Oh — un nuovo allenatore. Il Professor Oak ha detto che forse saresti passato da qui. Il mio nome è Cynthia. Viaggio tra le regioni, studiando i miti che la gente ha dimenticato e quelli che ha ancora paura di ricordare.",
      "Prima che tu faccia un altro passo, vorrei dirti una cosa. Qualcosa che ogni allenatore dovrebbe sentire almeno una volta, da qualcuno che lo intende davvero.",
      "Il mondo in cui ti trovi è più antico di qualsiasi città o lega. Molto prima che esistessero gli allenatori, c'erano i Pokémon, e la terra stessa fu plasmata da loro — montagne sollevate, oceani placati, tempeste evocate e poi messe a riposo. Le regioni che attraverserai ricordano ciascuna una parte diversa di quella storia.",
    ] },
    1: { lines: [
      "Persone e Pokémon hanno camminato fianco a fianco così a lungo che nessuno è davvero sicuro di chi abbia teso la mano per primo. Ma a un certo punto abbiamo imparato a chiedere loro aiuto, e loro hanno imparato a fidarsi del fatto che in cambio ci saremmo presi cura di loro.",
      "Questo è ciò che è una lotta. Non uno scontro per dimostrare chi è più forte. Una conversazione. Un momento in cui il tuo Pokémon ti mostra chi è, e tu gli mostri chi vuoi diventare.",
      "Vorrei avere quella conversazione con te. Solo una volta, così capirai la sua forma. Vuoi lottare con me?",
    ] },
    3: { lines: [
      "Grazie. È stata una buona conversazione — e migliore di quanto tu creda.",
      "L'hai sentito? Il modo in cui il tuo Pokémon ti ha aspettato, poi si è fidato di te, poi si è mosso? Quel sentimento ha un nome in alcune delle antiche storie. La gente di Sinnoh lo chiamava *il filo*. Ogni volta che tu e un Pokémon condividete un momento — una vittoria, un salvataggio, anche solo una lunga passeggiata — un filo viene tessuto tra voi. Col tempo, quei fili si intrecciano in qualcosa che il mondo stesso può sentire.",
      "È questa la vera ragione per cui esistono gli allenatori. Non per collezionare Pokémon. Neppure per vincere. È per tessere.",
    ] },
    4: { lines: [
      "Un consiglio pratico prima che io vada. Viaggiando, guadagnerai qualcosa che gli antichi registri chiamano Essence — il residuo di tutti quei momenti condivisi. Puoi scambiarla al Dreaming Market per rifornimenti, per nuovi compagni non ancora nati nel mondo della veglia, e per i piccoli catalizzatori che aiutano un Pokémon a crescere in ciò che è sempre stato destinato a diventare.",
      "Incontrerai anche altri allenatori che vorranno mettersi alla prova contro di te, e tornei in cui il mondo intero starà a guardare. Non aver paura di nulla di tutto questo. Il filo tra te e la tua squadra è già abbastanza forte.",
      "Vai, allora. Il mondo è pronto per te.",
    ] },
    5: { infoTitle: "Il mondo si apre", lines: [
      "Lotte, Collezione, Pokédex, Shop — tutto sbloccato.",
      "Il tuo viaggio ha inizio.",
    ] },
  },
  "bug-catcher": {
    0: { lines: [
      "Ehi, aspetta — l'hai sentito anche tu, vero? Quel piccolo ronzio quando passa un Caterpie?",
      "Tutti gli altri dicono che gli insetti non hanno molto da dire. Io non ci credo. Penso che i loro fili siano solo più silenziosi — devi avvicinarti per sentirli.",
      "Lotta con me! Voglio dimostrare che anche le loro voci contano.",
    ] },
    2: { lines: [
      "...Li hai sentiti anche tu, vero? Non solo i miei — i tuoi.",
      "Era tutto ciò che volevo. Grazie, allenatore. Continuerò ad ascoltare.",
    ] },
  },
  "youngster-joey": {
    0: { lines: [
      "Ehi! Sei un vero allenatore, giusto? Devi lottare con me.",
      "Tutti ridono del mio Rattata. Ma lui è con me da prima ancora che sapessi cosa fosse un Pokémon — dormiva sul mio cuscino.",
      "Se il filo è reale, allora il nostro è il più forte di tutti. Lascia che te lo dimostri!",
    ] },
    2: { lines: [
      "Accidenti... okay, va bene, ci hai battuti.",
      "Ma l'hai visto, vero? Ha combattuto con tutto il cuore. Questo conta qualcosa.",
      "Per me resta nel top percentuale.",
    ] },
  },
  "n-bond-awakening": {
    0: { lines: [
      "...I tuoi Pokémon. Stanno dicendo qualcosa. Sì — riesco a sentirli. La maggior parte delle persone non può, ma io ci sono sempre riuscito.",
      "Dimmi, allenatore: pensi che i tuoi Pokémon siano felici al tuo fianco?",
    ] },
    1: { lines: [
      "Mi chiamano N. Viaggio per il mondo cercando la verità sui Pokémon e sulle persone. Ho visto allenatori trattare i loro Pokémon come strumenti. Armi. Ma ne ho visti anche alcuni — come te — che forse sono davvero loro amici.",
      "Voglio sentirlo da me. Lotta con me, e lasciami ascoltare le voci dei tuoi Pokémon.",
    ] },
    3: { lines: [
      "...L'ho sentito. I tuoi Pokémon si fidano di te. Quel legame non è qualcosa che insegni loro con l'allenamento. È qualcosa che guadagnate — insieme, col tempo.",
      "Ogni lotta che affronti al loro fianco, ogni momento che condividete, li avvicina a te. E mentre quel legame si approfondisce, i tuoi Pokémon stessi cambiano. Crescono. Diventano di più.",
    ] },
    4: { infoTitle: "Bond XP — sbloccata!", lines: [
      "I tuoi Pokémon ora ottengono Bond XP da ogni lotta.",
      "Legame più alto → evoluzione.",
    ] },
    5: { lines: [
      "Ci incontreremo di nuovo, allenatore. Il mondo è più grande di quanto immagini. Fino ad allora... ascolta i tuoi Pokémon. Hanno così tanto da dire.",
    ] },
  },
  "may-rival": {
    0: { lines: [
      "Ehi! Sei l'allenatore di cui papà continua a parlare. Tipico.",
      "Mio padre gestisce la Palestra di Petalburg, quindi la gente si aspetta molto da me — ma non è per questo che sono qui. Sono qui perché l'oceano al largo di Hoenn *ronza*, e voglio sapere perché.",
      "Cynthia mi ha detto che saresti stato qualcuno con cui mettermi alla prova. Pronto?",
    ] },
    2: { lines: [
      "Whoa — okay, sei più bravo di quanto pensassi. Molto più bravo.",
      "Ho sentito il filo tirare quando ti sei mosso. Lo voglio anch'io.",
      "La prossima volta che ti vedrò, avrò la mia risposta. Promesso.",
    ] },
  },
  "barry-rival": {
    0: { lines: [
      "Ehi ehi ehi! Sei quello con cui Cynthia ha lottato, vero?! Non posso CREDERE che abbia lottato con te prima che con me!",
      "Voglio diventare Campione un giorno. Tipo, entro la prossima settimana. So che tutti ridono, ma se continuo a muovermi, continuo a lottare, il filo deve crescere, giusto?!",
      "Quindi — LOTTA! Subito! Niente scuse!",
    ] },
    2: { lines: [
      "AAGH! Ho perso di nuovo! Va bene, va bene, VA BENE —",
      "Ma li hai visti? I miei ragazzi hanno combattuto così duramente. È quella cosa del filo, giusto?? Era quella?!",
      "Okay okay devo andare ad allenarmi. Mi multo da solo di diecimila per aver perso. CIAO!",
    ] },
  },
  "n-styles-revealed": {
    0: { lines: [
      "Ci incontriamo di nuovo, allenatore. Ti avevo detto che sarebbe successo.",
      "Ti ho osservato. Il tuo legame con i tuoi Pokémon — è cresciuto. Ma ho notato anche qualcosa di curioso.",
    ] },
    1: { lines: [
      "Ogni allenatore che ho incontrato combatte in modo diverso. Alcuni pianificano, alcuni attaccano, alcuni proteggono. I tuoi Pokémon non ascoltano solo le tue mosse — ascoltano *chi sei* in lotta.",
      "Dimmi... sai almeno che tipo di allenatore sei diventato? Mostramelo. Lotta di nuovo con me, e lascia che il tuo stile parli.",
    ] },
    3: { lines: [
      "Sì... ora lo vedo. Hai una voce in lotta, anche se non l'hai mai sentita.",
      "Da ora in poi, quando mandi in campo un Pokémon, scegli anche come *tu* ti presenti. Il tuo stile plasma la loro determinazione. La loro determinazione plasma la lotta.",
    ] },
    4: { infoTitle: "Battle Styles — sbloccati!", lines: [
      "Scegli uno stile di lotta per ogni Pokémon quando lo mandi in campo.",
      "Stili diversi, vibrazioni diverse. Trova quello che fa per te.",
    ] },
    5: { lines: [
      "Alla prossima, allenatore. Sono curioso di vedere chi diventerai.",
    ] },
  },
  "kanto-gyms": {
    0: { lines: ["Pronto per la vera sfida?", "Le Palestre di Kanto ti aspettano — e io sono di nuovo il tuo primo avversario!"] },
    2: { lines: ["Sei davvero diventato più forte.", "Cerulean City è la prossima — Misty non sarà tenera con te."] },
    3: { lines: ["Quindi hai battuto Brock, eh?", "I miei Pokémon d'acqua ti rispediranno dritto a Pallet!"] },
    5: { lines: ["Sei più bravo di quanto pensassi.", "Vai a Vermilion — Lt. Surge ti aspetta."] },
    6: { lines: ["Ehi, ragazzino! Pensi di avere quello che serve?", "Ti mostrerò la potenza scioccante dell'elettricità!"] },
    8: { lines: ["Ah! Sei davvero qualcosa di speciale.", "La Palestra di Celadon è la prossima — cerca di non farti incantare."] },
    9: { lines: ["Benvenuto alla Palestra di Celadon.", "Non perderò questo incontro."] },
    11: { lines: ["Oh! Concedo l'incontro.", "Sei elegante in lotta. Sabrina ti attende a Saffron."] },
    12: { lines: ["Ho previsto il tuo arrivo.", "E ho previsto la tua sconfitta."] },
    14: { lines: ["Prevedo grandi cose nel tuo futuro...", "I Superquattro ti attendono."] },
  },
  "johto-gyms": {
    0: { lines: ["I capipalestra di Johto non sono avversari da sottovalutare.", "Io, Falkner, sono il primo muro che devi abbattere."] },
    2: { lines: ["Gli uccelli di mio padre non sono stati alla tua altezza.", "Prova Azalea Town adesso — Bugsy è affilato."] },
    3: { lines: ["I Pokémon di tipo Coleottero sono fraintesi.", "Permettimi di dimostrare il loro vero potere!"] },
    5: { lines: ["Hmm! Questi sono dati che posso usare.", "Whitney è la prossima — ed è più dura di quanto sembri."] },
    6: { lines: ["Questa volta non piangerò!", "Miltank, rotoliamo!"] },
    8: { lines: ["U-waaah! Va bene, prendi la medaglia!", "Morty a Ecruteak ti farà prendere un bello spavento."] },
    9: { lines: ["Benvenuto alla Palestra di Ecruteak.", "Vedo chiaramente la tua aura... ma tu riesci a vedere la mia?"] },
    11: { lines: ["La tua luce brilla più di quanto immaginassi.", "Cianwood e Chuck sono i prossimi."] },
    12: { lines: ["WAHAHAHA! Uno sfidante!", "Allena il tuo corpo e i tuoi Pokémon ti seguiranno!"] },
    14: { lines: ["Una lotta degna!", "La guardiana del faro di Olivine è la tua ultima prova."] },
    15: { lines: ["Io... farò del mio meglio.", "Per favore, prendi sul serio questa sfida."] },
    17: { lines: ["Il tuo legame con i tuoi Pokémon è bellissimo.", "Continua così!"] },
  },
  "hoenn-gyms": {
    0: { lines: ["Benvenuto alla Palestra di Rustboro.", "Ti insegnerò che i tipi Roccia non vanno sottovalutati."] },
    2: { lines: ["Eccellente... annotato.", "Brawly si allena a Dewford. Colpisce duro."] },
    3: { lines: ["Sta arrivando l'onda grande, ragazzo!", "Mostrami il tuo spirito combattivo!"] },
    5: { lines: ["Whoa! Cavalchi bene quell'onda.", "Wattson di Mauville avrà una vera carica per te."] },
    6: { lines: ["Wahaha! Benvenuto, benvenuto!", "Le trappole della Palestra di Mauville ti daranno una scossa!"] },
    8: { lines: ["Wahaha! Ora le scintille voleranno altrove.", "Lavaridge — e Flannery — bruciano dopo!"] },
    9: { lines: ["Mio nonno ha costruito questa Palestra!", "Non deluderò la sua eredità — brucia!"] },
    11: { lines: ["Io... ho imparato molto da te.", "Il leader di Petalburg è... beh, lo vedrai."] },
    12: { lines: ["Quindi sei arrivato fin qui.", "Non ci andrò piano solo perché forse ci conosciamo."] },
    14: { lines: ["Sono fiero di te.", "Winona di Fortree vola alto — fatti trovare pronto."] },
    15: { lines: ["Sono Winona, utilizzatrice del tipo Volante.", "Vola con me — se riesci a tenere il passo!"] },
    17: { lines: ["Voli più in alto di quanto immaginassi.", "I cieli di Hoenn ti danno il benvenuto, futuro Campione."] },
  },
  "sinnoh-gyms": {
    0: { lines: ["Sono la capopalestra di Veilstone, Maylene.", "Non trattenerti — io non lo farò!"] },
    2: { lines: ["Colpisci duro. Rispetto.", "Crasher Wake farà un gran tuffo dopo — letteralmente."] },
    3: { lines: ["Io sono Crasher Waaaaake!", "È ora di schiantarsi e schizzare, amico!"] },
    5: { lines: ["Whoo-aah! Che bagno!", "Fantina di Hearthome ti incanterà fuori dalla Palestra."] },
    6: { lines: ["Bonjour, mon challenger!", "I miei fantasmi danzeranno fino alla tua sconfitta!"] },
    8: { lines: ["Magnifique! Hai danzato attraverso i miei fantasmi.", "Byron di Canalave — forte come l'acciaio — è il prossimo."] },
    9: { lines: ["Wha-ha-ha! Uno sfidante robusto!", "L'acciaio non cede facilmente!"] },
    11: { lines: ["Hrm! Hai piegato il ferro.", "Snowpoint congela i cuori più duri — Candice ti attende."] },
    12: { lines: ["Ciao-ciao! Sono Candice!", "Concentrati, amico — il mio ghiaccio metterà alla prova il tuo spirito!"] },
    14: { lines: ["Wow, sei davvero concentrato!", "Volkner di Sunyshore è l'ultima Palestra — e la più brillante."] },
    15: { lines: ["...Finalmente, uno sfidante degno del mio tempo.", "Illumina la Palestra!"] },
    17: { lines: ["Hai acceso qualcosa in me.", "Vai — la Lega Pokémon ti sta chiamando."] },
  },
  "unova-gyms": {
    0: { lines: ["Benvenuto al ristorante della Palestra di Striaton.", "Specialità del giorno: una lotta con i tre capipalestra!"] },
    2: { lines: ["Tocca a me! È ora di accendere il fuoco!", "Preparati a sentire il calore!"] },
    4: { lines: ["I miei eleganti Pokémon d'acqua ti risciacqueranno via.", "Cominciamo?"] },
    6: { lines: ["Benvenuto, caro, al Museo di Nacrene.", "È ora di un progetto di ricerca — su di te!"] },
    8: { lines: ["L'ispirazione colpisce quando lotto.", "Creiamo un capolavoro insieme!"] },
    10: { lines: ["Benvenuto nella mia Palestra elettrizzante, sfidante modello.", "Regaliamo uno spettacolo al pubblico!"] },
    12: { lines: ["Ora sì che sei uno sfidante solido!", "Lascia che ti mostri com'è una vera scossa di terra!"] },
    14: { lines: ["Benvenuto alla Palestra di Mistralton, la pista!", "Pronto a librarti? I miei uccelli ti porteranno in volo!"] },
    16: { lines: ["Hmph. Il freddo rivela ogni debolezza.", "Lascia che raffreddi il tuo spirito."] },
    18: { lines: ["A lungo Opelucid ha atteso uno sfidante degno.", "Mostrami il fuoco di un vero allenatore di draghi!"] },
    20: { lines: ["Meraviglioso!", "La Lega Pokémon di Unova ti attende, futuro Campione."] },
  },
  "n-reawakening": {
    0: { lines: [
      "Ora hai delle medaglie con te. Lo capisco da lontano — dal modo in cui i Pokémon incontrano il tuo sguardo prima di incontrare la tua mano.",
      "Mi raggiungeresti in una radura che conosco? Quella con le betulle bianche, fuori dalla vecchia strada. Vorrei mostrarti qualcosa di silenzioso — prima che cominci la parte più dura del tuo viaggio.",
      "Ho pensato di nuovo a una cosa che imparai dalla mia Zorua quando avevo sei anni. Una volta si allontanò da me. Per tre giorni interi. Rimasi seduto nella neve e non la chiamai. Tornò perché lo voleva, e non ho mai, in vita mia, stretto qualcosa tanto forte quanto strinsi lei quella sera.",
      "È questa la prova, non è vero? Non se un Pokémon resta. Se qualcosa di lui ritorna.",
    ] },
    1: { lines: [
      "Voglio proporre un esperimento. Un dono, se lo vincerai — e ti servirà, per ciò che verrà dopo le Palestre.",
      "Quando un allenatore frantuma un compagno, la maggior parte delle persone pensa che sia la fine. Una manciata di polvere, un piccolo dolore, e il mondo dimentica.",
      "La generazione di mia nonna sapeva meglio. Sapeva che ciò che resta di un Pokémon dopo la frantumazione non è il nulla. Lo chiamavano una **Memory** — la forma che la sua specie lascia sul mondo. Portala con te abbastanza a lungo, e diventa pesante per il desiderio di tornare.",
      "Esiste un rito per questo. Un'offerta silenziosa sotto il cielo aperto. La Memory risponde — non lo stesso compagno, no; quello è andato, e non mentiamo su questo — ma un *nuovo essere della stessa specie*, sveglio e tuo, attirato qui dal disegno di colui che era.",
      "I miei maestri lo chiamavano **Reawakening**. Gli antichi re lo proibirono — non sopportavano sudditi che li scegliessero due volte.",
      "Lotta con me. Se vinci, te lo insegnerò. E mi fiderò di te nel portarlo dentro le tempeste che ti attendono.",
    ] },
    3: { lines: [
      "Ecco. *Ecco.* Grazie.",
      "Ho osservato i tuoi Pokémon durante quella lotta, e ho osservato loro mentre guardavano *te*, e sono soddisfatto. Il filo regge.",
      "Il rito è tuo. Quando un compagno è già passato oltre — frantumato e disperso — resta solo la sua **Memory**: la forma che la sua specie lascia sul mondo. Porta quella Memory in un luogo tranquillo. Ringraziala. Offrila alle stelle.",
      "Un nuovo essere della sua specie risponderà: natura nuova, potenziale nuovo, muscoli freschi, nuove mosse imparate sotto la luna. Più forte è la famiglia, più Essence il rito ti chiede; il mondo è prudente con le sue creature rare.",
    ] },
    4: { infoTitle: "Reawakening — sbloccato!", lines: [
      "Frantuma un Pokémon per lasciare una Memory — trova le tue Memories nella schermata Items.",
      "Tocca una Memory e spendi Essence per il Reawakening: un nuovo esemplare di quella specie, con natura, abilità, IVs e mosse nuove.",
      "Le famiglie più rare chiedono più Essence. Il rito è paziente.",
    ] },
    5: { lines: [
      "Vai ora. Là fuori ci sono persone che hanno dimenticato la differenza tra un legame e un'imbracatura — e presto ti metteranno alla prova su questo. Da qualche parte nella notte, una Memory aspetta di diventare di nuovo qualcuno.",
    ] },
  },
  "team-rocket": {
    0: { lines: [
      "Ho ricevuto il tuo messaggio. E sì — sono di nuovo loro.",
      "Silph Co. ha smesso di rispondere al telefono due giorni fa. L'Agente Jenny ha trovato un sigillo sul retro delle porte dell'atrio. Una R rossa, cucita nella carta da parati come se fosse sempre stata lì.",
      "Team Rocket non se n'è mai davvero andato, capisci. Ha solo imparato ad aspettare. L'unica persona che potrebbe richiamarlo è quella che l'ha costruito.",
      "Non ti chiederò di entrare. Ti dirò solo ciò che Cynthia mi disse una volta, la prima volta che mi trovai davanti a una porta come questa. Un Pokémon addestrato è un piccolo, strano dono. Team Rocket è la gente che ha imparato a rubare quel dono. Non dimenticare quale di queste cose sei tu.",
    ] },
    1: { lines: ["Ehi, ragazzino! Non sei nella lista visitatori.", "Consegnaci i tuoi Pokémon e la chiameremo una bella passeggiata. Altrimenti il mio Koffing viene a salutarti."] },
    3: { lines: ["Tch — colpo fortunato. Il capo aveva detto che sarebbe arrivato un moccioso.", "Ora rimbalzi fino al decimo piano, giusto? Bene. Risparmiami la salita."] },
    4: { lines: ["Sei tu quello che sta rovinando la nostra serata, eh?", "Team Rocket paga in contanti freddi e sentimenti ancora più freddi. Fidati — è il miglior lavoro che una ragazza possa avere a Kanto adesso."] },
    6: { lines: ["...okay, va bene, sei bravo.", "Petrel è il prossimo. È... strano. Fingi solo di non accorgertene."] },
    7: { lines: [
      "Ahh, quindi questo è il famoso ragazzino. Più giovane di quanto immaginassi. Con uno sguardo più cattivo, però — mi hai guardato in faccia come se ti dovessi qualcosa.",
      "Faccio imitazioni, sai. Piccolo hobby. Vuoi sentirmi fare il capo? *'Sei sulla mia strada.'* Da brividi, vero? Mi esercito da anni.",
      "Basta riscaldamento. Vediamo come te la cavi con un vero razzo invece che con i petardi al piano di sotto.",
    ] },
    9: { lines: ["Va bene, va bene. Questa la vinci tu. Andrò a esercitarmi con una nuova voce.", "Proton è sulle scale. Non scherzare con lui. Non sa cosa siano le battute."] },
    10: { lines: ["Quindi sei tu quello che non smette di muoversi.", "Non ho niente da dirti. Le persone che parlano danno a chi ascolta qualcosa da usare. Io uso soltanto.", "I tuoi Pokémon non verranno restituiti. Qui nulla viene restituito."] },
    12: { lines: ["...", "Vai, allora. La prossima porta è aperta. Non spreco fiato due volte."] },
    13: { lines: ["Be'. Guardati — hai scalato tutto il nostro edificio in un pomeriggio.", "Mi ricordi qualcuno, in realtà. Un ragazzo che conoscevo. Era molto dolce, molto *rumoroso*, e già morto quando aveva sedici anni.", "Il problema dei bambini come lui, e come te, è che pensate che avere ragione sia uno scudo. Non lo è. È un pezzo di vetro molto carino."] },
    15: { lines: ["...Ti ho giudicato male. Non vetro, allora. Qualcosa con più spigoli.", "Vai. Archer è in fondo al corridoio. È l'unico tra noi che al capo piace davvero. Fai attenzione a come ti metti davanti a lui."] },
    16: { lines: ["Allenatore. Devi essere stanco. Per favore — siediti, se vuoi. Te lo sei meritato.", "Sono Archer. Sono la mano che ha rimesso insieme Team Rocket. Ariana mi chiama quello che *crede* in lui, e suppongo abbia ragione. Qualcuno doveva farlo.", "Tu non mi dispiaci. Non penso che dispiaccia neanche a Giovanni. Sei semplicemente l'ultima serratura su una porta che apriamo da anni. Le serrature non intendono essere scomode. Lo sono e basta."] },
    18: { lines: ["...Scomoda, allora. Mi sbagliavo.", "Il capo sta aspettando. Mi ha chiesto di lasciarti passare se fossi arrivato fin qui. Ha sempre detto di voler incontrare quel ragazzino di persona."] },
    19: { lines: ["Dunque — tu sei il bambino.", "Ti ho osservato dalle telecamere di ogni piano. Ti muovi bene. I tuoi Pokémon si muovono meglio. È raro.", "Capisci a cosa ho dedicato la mia vita? Ho preso le creature più forti di questo continente e le ho rese utili. *Utili* — questa è l'unica parola onesta per ciò che un Pokémon è per una persona. Tutto il resto è decorazione."] },
    20: { lines: ["Cynthia insegna ai bambini fili e conversazioni. Il Professor Oak scrive articoli sull'amicizia. Li rispetto. Davvero. Sono la vernice all'esterno di una macchina molto costosa.", "Io sono la macchina.", "Mostrami la tua macchina, allora. Vediamo quale funziona meglio."] },
    22: { lines: ["...", "Ho sentito quell'ultimo colpo. Non nel mio Pokémon. In me. Che strano.", "Forse mi sono sbagliato su una cosa. Una macchina non sussulta quando perde. Tu — e le piccole, testarde creature dietro di te — avete sussultato *insieme*.", "Prendi l'edificio. Prendi l'azienda. Prendi la R sulla porta. Io ho chiuso con loro. Non sono mai bastati."] },
    23: { lines: ["L'ho sentito dall'altra parte della regione. L'intera torre Silph che si scioglieva in silenzio.", "Ricordi cosa ti dissi al crocevia? Che una lotta è una conversazione?", "Lui ne ha appena avuta una. Passerà il resto della vita a cercare di decidere se sia stata con te, o con la parte di sé a cui ha rinunciato tanto tempo fa. In ogni caso — alla fine non riguardava il *potere*.", "Vai a casa, allenatore. Hai fatto una cosa rara oggi." ] },
  },
  "aqua-magma": {
    0: { lines: ["Hai scelto una brutta settimana per finire il circuito delle Palestre. O una buona, dipende da quanto sei coraggioso.", "Team Aqua ha preso la baia dei sottomarini a Slateport. Team Magma ha preso il vulcano a Mt. Chimney. Entrambi inseguono la stessa coppia di Pokémon antichi, dai due estremi di una storia molto vecchia.", "La cosa peggiore non è che una delle due squadre sia crudele. È che *entrambe pensano di essere quella gentile*. Archie vuole che il mare copra il mondo così la gente smetterà di ferire l'oceano. Maxie vuole che la terra inghiotta il mare così la gente smetterà di annegare nelle tempeste.", "Nessuno dei due sta ascoltando Hoenn stessa. Ho bisogno di qualcuno che *lo farà*. Andrai?" ] },
    1: { lines: ["Oi! Nessun terricolo oltre questo punto.", "Archie è occupato a *salvare il mondo*, e tu sei nella nostra scia."] },
    3: { lines: ["Grr — va bene. Vai a trovare Shelly. Vediamo quanto le piaci."] },
    4: { lines: ["Sei il ragazzino di cui i capipalestra non smettevano di parlare. Più piccolo di quanto immaginassi.", "La faccio breve. Il mare è stato una discarica per cent'anni. Ogni corallo che apro ha una sigaretta dentro. Ogni pesce che marco ha una storia che non dovrebbe avere.", "Archie spazzerà via tutto questo. E sì, ci costerà alcune cose. Cose di terra. Cose *tue*. È così che si paga un debito."] },
    6: { lines: ["...Va bene. Va bene.", "Matt sorveglia il sottomarino. Non lasciarti spaventare — è soprattutto gomiti."] },
    7: { lines: ["WOOO! Sì! Finalmente si è fatto vivo qualcuno! È per questo che mi sono allenato!", "Archie dice di combattere con intelligenza. Archie dice di pensare prima. Archie dice che parlo troppo forte.", "Archie non è qui adesso, vero? ANDIAMO, ragazzino!"] },
    9: { lines: ["Ah! HAHA! Oh cavolo, mi hai *preso*! È stato grandioso!", "Vai dal capo. Digli che Matt ha detto che gli piacerai. Non gli piacerai, ma diglielo comunque."] },
    10: { lines: ["Sei venuto fin quaggiù solo per discutere con me? Lo rispetto, ragazzino. Davvero.", "Ascolta. Ho passato tutta la vita sull'acqua. So che suono ha un mare morente. Ogni anno è più silenzioso. Niente canto di balene nel golfo. Nessun Wailord che risponde. Le vecchie acque stanno *morendo di fame*.", "Non sono un uomo cattivo. Sono solo l'unico che ha smesso di fingere."] },
    11: { lines: ["La tua maestra Cynthia direbbe che non sto ascoltando. Si sbaglia. Ho ascoltato per tutta la vita. È solo che non mi piace la risposta che ho ricevuto.", "Allora facciamo una delle sue *conversazioni*. Tu e io. Più forte che puoi."] },
    13: { lines: ["...", "Combatti come fa l'oceano. Non contro di me — *intorno* a me. Prendendo ciò che è debole e lasciando il resto.", "Bene. Vai a fermare anche Maxie, se puoi ancora. E dopo — vieni a cercarmi. C'è una spiaggia a Pacifidlog su cui non cammino da anni. Mi piacerebbe vederla con qualcuno che non vuole niente."] },
    14: { lines: ["Nessun estraneo sulla montagna!", "Maxie sta perforando fino alla vena di magma. Niente ci fermerà — non un moccioso di mare, e sicuramente non tu."] },
    16: { lines: ["Levati dai piedi! Courtney si occuperà di te!"] },
    17: { lines: ["Bersaglio. Acquisito.", "Sono Courtney. Sono una ricercatrice. Non provo rabbia. Provo solo *schema*.", "Lo schema dice: c'è troppo oceano. Lo schema dice: la terra deve aumentare. Lo schema dice: gli ostacoli vengono rimossi. Tu sei un ostacolo. Non è personale."] },
    19: { lines: ["Schema corretto. L'ostacolo resta. L'ostacolo è... interessante.", "Procedi. Tabitha sorveglia la caldera."] },
    20: { lines: ["Sei arrivato più lontano di qualsiasi allenatore abbia mai fatto attraverso i ranghi di Magma. Congratulazioni.", "Non intendo lasciarti raggiungere Maxie. Non perché tu mi stia antipatico — ti conosco appena — ma perché è l'unica persona nella mia vita che mi abbia mai fatto sentire *utile*, e gli devo tutto.", "Un uomo che ti salva dall'essere nulla darà fuoco al mondo per te, se glielo chiedi. Questo è il segreto che nessuno all'università vuole stampare."] },
    22: { lines: ["...Hai vinto. Ho finito. Ti chiedo soltanto che, qualunque cosa gli dirai ora, tu la dica *con dolcezza*. Lui ci ama davvero. Ama solo la montagna un po' di più."] },
    23: { lines: ["Ah. Tu. Mi chiedevo se ti avrebbero mandato i capipalestra, o se Archie ti avrebbe convinto prima della sua versione.", "Guardati intorno, allenatore. La caldera è calda. La montagna è sveglia. Sai quante persone annegano ogni anno a Hoenn? Settecentoventinove, all'ultimo conteggio. Sai quante bruciano?", "Sette. L'acqua ha sempre ucciso più di noi del fuoco. Non sono un fanatico. Sono uno *statistico*."] },
    24: { lines: ["Archie crede che se annega il mondo lentamente, sarà più gentile che se la natura lo annega a pezzi. È sentimentale. Magma sarebbe rapido. Magma sarebbe definitivo. Magma sarebbe, alla fredda fine, *misericordioso*.", "Non ti convincerò. Non credo che me lo lasceresti fare. Quindi — lascia che siano i miei Pokémon a discutere. Lo dicono sempre meglio di me."] },
    26: { lines: ["...", "I miei numeri erano puliti. Il mio ragionamento era solido. Eppure tu mi hai appena... *confutato*, con nient'altro che una manciata di Pokémon ordinari che per caso si tenevano ancora per mano.", "C'è una variabile di cui non ho tenuto conto. Dovrò ricominciare.", "Vai. Di' ad Archie che anche lui aveva torto. Forse, se abbiamo torto entrambi insieme, possiamo smettere di urlare."] },
    27: { lines: ["Hai quietato entrambi i vulcani. Uno di roccia. Uno di uomini.", "Hoenn respira più facilmente stasera di quanto abbia fatto in un decennio. E la cosa buffa — nessuno di quei due stava mentendo. Stavano entrambi raccontando una storia vera, con un brutto finale.", "Cynthia mi ha scritto la settimana scorsa. Ha detto che eri il primo allenatore che incontrava da molto tempo i cui Pokémon avrebbero *perso* per te prima di lasciarti. Allora non capivo cosa intendesse. Ora sì."] },
  },
  "team-rocket-revival": {
    0: { lines: ["Sta succedendo di nuovo. Ma non come ti aspetteresti.", "Tre anni dopo Silph. La Torre Radio di Goldenrod ha trasmesso di notte un vecchio segnale disturbato su una sotto-banda. Kurt ad Azalea dice che i suoi slowpokes si mettono in fila quando comincia a suonare. Le code non ricrescono per giorni.", "Questo non è Giovanni. Lui è nascosto, se è vivo. È qualcuno che si sforza moltissimo di essere lui. Fa' attenzione, allenatore. Una copia di un cattivo a volte è peggio dell'originale — le copie hanno qualcosa da dimostrare."] },
    1: { lines: ["Sono venuto perché il segnale fa male.", "Io sento i Pokémon come tu senti la musica. E stanotte, nella banda bassa, li sento venire *accordati*. Costretti in una tonalità in cui non sono nati. È la cosa peggiore che abbia provato da quando ero bambino.", "Non posso combattere le persone che l'hanno costruito. Non sono più... quel tipo di persona. Ma tu sei un allenatore, e i Pokémon al tuo fianco ti hanno scelto liberamente. Accompagnami su per la torre. Ti dirò cosa sento a ogni piano."] },
    2: { lines: ["Ah, un fan? Il capo ha detto che avremmo avuto il solito ragazzino curioso.", "Anche tu hai sentito la trasmissione, scommetto. È orecchiabile, vero? Non importa. Non salirai."] },
    4: { lines: ["Lo Zubat alla cintura di quella recluta — gli sanguinano le orecchie. Il segnale li spinge oltre la loro portata.", "Continua a salire. Il piano successivo è più forte."] },
    5: { lines: ["Hai portato un *tipo* coi capelli verdi su una torre radio? Huh. Appuntamento strano.", "Team Rocket è tornato, ragazzino. Giovanni o non Giovanni. Le idee non hanno bisogno di un volto."] },
    7: { lines: ["Be', ciao di nuovo. Ti ricordi di me? Torre Silph, nono piano, quello con la *voce*.", "*Ehm.* '...Non ho bisogno di eroi. Ho bisogno di potere. E tu sei sulla mia strada.' Ce l'ho ancora? Sii sincero.", "Sto gestendo tutta questa operazione da mesi. Le reclute pensano che io *sia* lui. Archer ci è cascato persino una volta. Quello è un uomo con gli occhi chiusi e le orecchie aperte — il miglior tipo di seguace."] },
    9: { lines: ["Okay, okay. Le lezioni di voce chiaramente non sono bastate.", "Sali pure. I veri credenti stanno aspettando."] },
    10: { lines: ["Di nuovo tu.", "L'altra volta non ti dissi nulla. Questa volta dirò una cosa — il segnale è stata una mia idea. I Pokémon ascoltano la stessa frequenza che le balene usano per chiamare casa attraverso un oceano. A quanto pare, con essa puoi chiamarli altrove. Ovunque.", "Immagina cosa potrebbe fare un ragazzo come te con un esercito che arriva quando fischi."] },
    12: { lines: ["Stava per vendere quell'idea ai governi. Ha già un acquirente.", "Un piano ancora. Il tetto della torre è dove vive il trasmettitore. Ariana non si sposterà da lì. Crede che Giovanni stia tornando, e gli ha costruito un pulpito."] },
    13: { lines: ["Sei il bambino che ha finito il mio capo. Ho pensato a te ogni notte da allora.", "Sai cosa significa amare un uomo che ti ha resa qualcuno? Prima di Giovanni, io ero nulla — una cameriera di Celadon con un brutto carattere e un taglio di capelli economico. Mi guardò per dieci secondi e disse: 'Dirigerai il mio reparto pubblicità.' E lo feci. Ed ero *brava*.", "Dopo che lo hai battuto è diventato silenzioso. Non sapevamo cosa fare. Così abbiamo costruito questo — un segnale che lo chiama a casa. Se i Pokémon possono sentirlo, forse può farlo anche lui. Forse si ricorderà di noi."] },
    15: { lines: ["...Non avrebbe mai funzionato, vero.", "Non verrà. Non sarebbe mai venuto. Archer — Archer continuava a dire 'solo un'altra trasmissione.' Ero io a versare i drink. L'ho sentito piangere una volta. Ho fatto finta di non sentirlo.", "Vai. Spegni la torre. Spegni noi."] },
    16: { lines: ["Allenatore. Mi ricordo di te.", "Alla Silph ti dissi che le serrature non intendono essere scomode. Ho pensato a quella frase per anni. Mi sbagliavo. Le serrature *intendono* essere scomode. È questo il punto di una serratura. È questo che eravamo noi.", "Senza di lui, ho dovuto scegliere cosa amare. Ho scelto la sua *forma*. Una voce. Un segnale. Una trasmissione. L'ho insegnata a ogni Pokémon in questo edificio. L'ho chiamata *lui*.", "E poi sei tornato. E ho capito — l'unica persona al mondo che può distinguere una copia dall'originale è la persona che un tempo ha sconfitto l'originale."] },
    17: { lines: ["Un'ultima lotta, allora. Non per lui. Per la serratura. Così almeno questa volta la porta si chiude pulita."] },
    19: { lines: ["...", "Buonanotte, allenatore. Il segnale è spento. I Pokémon fuori hanno smesso di camminare. Puoi sentire di nuovo i grilli — io non li sentivo da sei mesi.", "Se mai lo vedrai — digli che la sua compagnia era buona. Digli che la sua gente ha aspettato. E digli... abbiamo finito di aspettare."] },
    20: { lines: ["Il cielo è quieto. Gli uccelli volano nella direzione sbagliata — stanno ricordando dov'è il sud. Ci metteranno qualche ora.", "Grazie per aver fatto ciò che io non potevo. Ho passato così tanto tempo ad arrabbiarmi con gli *uomini* che dimentico che alcuni di loro soffrono già, e ne fanno i loro mostri.", "Torna a casa lentamente. Tieni per mano i tuoi Pokémon. Il filo ha retto stanotte, ed è stato grazie a te."] },
  },
  "team-galactic": {
    0: { lines: ["Sono tornata a Sinnoh perché ho sentito il cielo inclinarsi.", "Non lo troverai ancora su nessun giornale. Un uomo di nome Cyrus, che possiede metà di Veilstone, compra da dieci anni manufatti legati a Dialga e Palkia. In silenzio. Legalmente. Attraverso trentuno società di comodo.", "La settimana scorsa una sua dipendente — una ricercatrice dai capelli grigi di nome Charon — ha depositato il brevetto per una macchina chiamata 'Red Chain.' La descrizione dice che risuona con *il tessuto della realtà.* Dice anche, in una nota, che lo scopo previsto è 'riavviare' quel tessuto.", "Non sono una detective, allenatore. Ma sono molto spaventata. Cammineresti con me?"] },
    1: { lines: ["Affari Galassia. Circolare.", "Il capo sta costruendo un mondo migliore. Il tuo 'mondo' è d'intralcio."] },
    3: { lines: ["Fortunato. I Comandanti sono a ogni piano sopra. Esaurirai la fortuna con uno di loro."] },
    4: { lines: ["Be', ciao! Non dirmelo — sei *l'allenatore*! Quello di cui la gente spettegola!", "Vuoi sapere un segreto divertente? Sono l'addetta al morale di Galassia. Il mio vero lavoro è far sentire meglio tutti qui riguardo al fatto che cancelleremo l'universo. Li tiro su in mensa. Faccio karaoke. Sono *così brava*.", "Cyrus non sorride. Ha detto che la missione non ne aveva bisogno. Io non ero d'accordo. Sorrido il *doppio* così la media torna giusta."] },
    6: { lines: ["Oof! Okay! Be'! Ho perso, vero!", "Non sentirti in colpa, allenatore. Perdo a scacchi contro Cyrus ogni mercoledì. Ci sono abituata.", "Jupiter è su con l'ascensore. Non ti sorriderà. È il suo lavoro."] },
    7: { lines: ["Tu sei l'ostacolo di cui parlava Mars. Più piccolo di quanto suggerisse il suo rapporto.", "Sono Jupiter. Gestisco la sicurezza interna. I miei Pokémon e io abbiamo una regola: non perdiamo contro gli ostacoli.", "Cyrus dice che l'emozione è rumore. Non sono d'accordo con tutto ciò che dice — mi piace vincere, per esempio — ma su questo concordo. Dovresti provare a silenziarti qualche volta. È molto efficiente."] },
    9: { lines: ["...Ho perso. Che strano. Dovrò ricalibrare.", "Saturn è nel laboratorio interno. È lui che ha *costruito* ciò che stiamo per avviare. Parla con lui, se puoi. Ascolta. Non ho mai capito perché."] },
    10: { lines: ["Allenatore. Per favore — ho due minuti. La Red Chain si sta innescando. Voglio usarli con cura.", "Sono stato il primo dipendente di Cyrus. Sono stato io a scrivere la specifica della Chain. Ho pensato ogni giorno per un anno se fosse giusto completarla.", "Non è crudele. Lo capisci? Non è arrabbiato. Ha semplicemente deciso che ogni brutta cosa mai accaduta a una creatura vivente in questo universo accade *perché* quella creatura può sentire. Rimuovi il sentire, e la sofferenza finisce con esso.", "Penso che si sbagli. Penso che si sbagli in modo bellissimo e terribile. Ma ti combatterò comunque, perché me lo ha chiesto, e non ho ancora trovato il momento in cui rifiutarglielo."] },
    12: { lines: ["...Quello è il momento, allora. Quello che aspettavo.", "Vai oltre me. Spegnerò l'anello esterno. Guarderò il mio Toxicroak bere acqua per la prima volta in una settimana. Ricorderò a cosa serve un Pokémon.", "È nella camera interna. Non urlerà. Non urla mai."] },
    13: { lines: ["Tu sei il bambino che la Campionessa ha portato.", "Non ti odio. Non odio nessuno. Ho passato l'infanzia a guardare i miei genitori odiarsi da un lato all'altro del tavolo da pranzo, e quando avevo nove anni ho deciso che l'odio è semplicemente un sentimento in cerca di una scusa.", "Tutti i sentimenti lo sono. Amore, paura, lutto, gioia — sono scuse che il cervello inventa per giustificare altro di sé. Togli al cervello il permesso di sentire, e togli a tutti la scusa per rovinare tutto."] },
    14: { lines: ["La tua maestra Cynthia ti ha detto che la terra è tenuta insieme dal filo. Sono d'accordo con lei. Penso semplicemente che il filo sia la fonte del nodo, non la cura.", "Dialga, Palkia. Tempo, spazio. Chiederò loro un mondo senza alcun filo. Un foglio pulito e quieto. Nessuno soffrirà. Nessuno amerà. Sono la stessa parola, allenatore, scritta con due caratteri diversi.", "Mi rendo conto che non sarai d'accordo con me. Il disaccordo è esso stesso un sentimento. Mostrami quanto ne hai costruito — e io ti mostrerò quanto poco valeva."] },
    16: { lines: ["...", "I miei Pokémon non si stanno rialzando. Mi stanno guardando. Non li avevo mai visti guardarmi prima.", "Qualcosa nel modello è sbagliato. Forse il filo *non* è il nodo. Forse è ciò che impedisce all'universo di diventare un nodo.", "Io... ho bisogno di tempo. Ho bisogno di pensiero. Ho bisogno di *silenzio*, che è l'unica emozione che io sia mai stato disposto ad ammettere. Con permesso."] },
    17: { lines: ["...Ho visto tutto dal monitor. Credo di non aver respirato.", "Mi ha rimandato indietro le mie parole, l'hai sentito? Ha preso il filo e lo ha chiamato nodo. Per un momento ho pensato — *e se avesse ragione? E se insegnassi questo ai bambini da dieci anni e fossi stata io la sciocca?*", "E poi i tuoi Pokémon si sono rialzati. E ti hanno guardato. E ho saputo la risposta. L'ho vista *accadere*, e l'ho saputo.", "Il filo è ciò che impedisce all'universo di diventare un nodo. Aveva la geometria al rovescio. È un sollievo su cui berrò tè per anni."] },
    18: { lines: ["Grazie per essere venuto quando ti ho chiamato. Pochissime persone lo avrebbero fatto. Ancora meno avrebbero vinto.", "Vai a casa. Cammina sulla strada del lago — i Pokémon lì usciranno a incontrarti stanotte. Lo hanno sentito anche loro. Lo sentono sempre per primi."] },
  },
  "team-plasma": {
    0: { lines: ["Non sarei venuto per questo se avessi potuto evitarlo.", "Conosci l'altra metà della mia storia, allenatore. Mi hai visto ai crocevia, ai fiumi, al margine delle foreste dove potevo sentire i miei Pokémon non essere d'accordo con me. Sei stato molto paziente.", "C'è una persona con cui non parlo da quando l'ho lasciata. Mi ha cresciuto. Mi ha vestito con una corona di cui non vedevo l'interno. Mi ha messo attorno dei saggi come una gabbia di uomini ragionevoli, e mi ha insegnato che ogni frase che dicevo era anche sua.", "Il suo nome è Ghetsis. Sta ancora trasmettendo. Ha ancora seguaci. E c'è una mente fredda chiamata Colress che testa i loro Pokémon in un laboratorio fuori Opelucid, per vedere se può farli obbedire senza *nulla* di ciò che chiamavamo legame. Non posso affrontarli da solo. Per favore."] },
    1: { lines: ["Alt, allenatore! Plasma esige la liberazione di tutti i Pokémon!", "...anche specificamente quelli nelle tue tasche. Consegnali e la chiameremo liberazione."] },
    3: { lines: ["Tch — va bene, tieniti i tuoi amici rubati. I saggi ti sistemeranno."] },
    4: { lines: ["Dunque. L'*allenatore scelto* da N. Ho sentito il Signore parlare di te. Non gli piaci.", "Sono uno dei sette. Ero con lui prima che tu nascessi. Ho aiutato a scrivere i discorsi che hanno cresciuto quel ragazzo come un fiore in serra — alto, bellissimo, fragile e inutile fuori dal vetro.", "Tu gli hai tolto il vetro. Per questo non ti perdonerò, e non perderò."] },
    6: { lines: ["...Hai spezzato il mio ghiaccio con la stessa facilità con cui hai spezzato lui. Prevedibile.", "Vai. Rood sta aspettando. Era uno di noi. Ora non lo è più. Destino da traditore."] },
    7: { lines: ["Allenatore — aspetta. Non sono qui per fermarti.", "Ero uno dei sette saggi. Ho servito Ghetsis per trentuno anni. Ho insegnato a N a leggere il canto dei Pokémon dalla culla. Ho anche guardato l'uomo di cui mi fidavo trasformare il mio studente in un burattino e dirgli che era un'incoronazione.", "Ho lasciato Plasma due anni fa. Ho preso i Pokémon che il Signore aveva dimenticato — quelli che chiamava 'simbolici' — e li sto restituendo alla natura, un fiume alla volta. Questa è la mia penitenza.", "Non posso fermare Ghetsis da solo. Ma posso metterti alla prova. Se meriti ancora di stare davanti a lui, i miei Pokémon te lo diranno. Se non lo meriti — meglio impararlo ora, da me, che dopo, da lui."] },
    9: { lines: ["...Meriti di stare davanti a lui. Vai.", "Un'altra cosa — l'uomo freddo, Colress, non è Plasma. Non davvero. È uno scienziato, e la sua valuta è la *curiosità*. Sarà nella prossima camera. Desidera confrontarti con il ragazzo che chiama N. Accontentalo, o no. Ma non sottovalutarlo — è l'unico in quell'edificio che non mente."] },
    10: { lines: ["Ah! L'*altro* allenatore. Eccellente. Eccellente.", "Sono Colress. Ho passato gran parte della mia carriera a testare l'ipotesi che la forza di un Pokémon sia precisamente uguale alla forza del suo legame con il suo allenatore, ponderata per la forza di volontà dell'allenatore e divisa per il numero di volte in cui l'allenatore li ha delusi in pubblico.", "È un'equazione disordinata. I tuoi dati, tuttavia — i tuoi dati sono *notevoli*. Ho seguito le tue lotte dai registri della lega. La deviazione standard della tua squadra è incredibilmente bassa. Cioè, perdonami, *bellissimo*.", "Non mi importa di Ghetsis. Mi importa del grafico. Prestami altri cinque punti dati, se vuoi."] },
    12: { lines: ["*Ahh.* Meraviglioso. Il coefficiente è pulito. Scriverò di questa lotta per il prossimo decennio.", "Ti devo un favore. Quando aprirai la prossima porta, Ghetsis tenterà di far colpire il suo Hydreigon prima che tu finisca la prima frase. Ho *discretamente* scollegato il proiettore che voleva usare per intimidirti. Odia lavorare senza il suo proiettore. Divertiti."] },
    13: { lines: ["È dall'altra parte di quella porta. Lo sento camminare avanti e indietro. Lo fa quando le luci si spengono — lo ha sempre fatto.", "Allenatore. Devo chiederti qualcosa di difficile. Ho passato sei mesi a guardarti costruire una squadra che discute con te. Pokémon che rifiutano le mosse che scegli, che ti fulminano con lo sguardo quando li curi, che ti amano *nonostante* te. È ciò che ho sempre desiderato, e che non ho mai osato creare.", "Lui ti dirà che il legame è una bugia. Ti dirà che io sono suo. Ti dirà che quello che hai è uno spettacolo di burattini e che lui è l'unico che abbia mai tolto i guanti.", "Per favore — non ascoltarlo. È un uomo molto persuasivo. Ha fatto di me un *re* senza che io lo sapessi. Non lo farà con te. Non oggi. Vai."] },
    14: { lines: ["Dunque. L'*altro* bambino.", "N parlava di te nelle rare occasioni in cui riuscivo a costringerlo a parlare. Ne parlava con un calore che non avevo mai sentito in lui, ed era — lo ammetto — profondamente scomodo.", "Sei la ragione per cui il mio regno non è accaduto. Avevo tutto. Un ragazzo di cui possedevo la lingua. Sette saggi ad annuire. Un continente che aveva dimenticato cosa significasse dire *no*. E poi sei entrato in una radura con un Oshawott stanco e gli hai chiesto, *'Chi sei?'* Come se fosse qualcosa a cui gli fosse permesso rispondere."] },
    15: { lines: ["Non ripeterò i suoi argomenti a te. Non sono d'accordo con essi. Non lo sono mai stato. Plasma era il *mio* strumento; la filosofia era un guinzaglio. Ho usato il linguaggio della liberazione per costruire la gabbia più stretta che Unova abbia mai visto, e il mio ragazzo l'ha indossata per dieci anni ringraziandomi ogni mattina.", "I legami, allenatore, sono *imbracature*. Quella cosa che chiami amore tra te e i tuoi Pokémon è semplicemente la corda più morbida mai inventata. Lo so perché l'ho tirata, ed è sempre venuta.", "Vieni, allora. Tira la tua. Vediamo se si spezza di netto o se servono alcuni tentativi."] },
    17: { lines: ["...", "Il mio Hydreigon non si alza. Mi sta *guardando*. Non mi aveva mai guardato prima. L'ho posseduta per undici anni.", "Un'imbracatura non guarda indietro il suo cavaliere. Un'imbracatura è un'*imbracatura*. A meno che non fosse qualcos'altro, per tutto questo tempo, e io semplicemente non me ne sia accorto.", "No. No. Rifiuto questa conclusione. Ho lavorato troppo. Prendi mio figlio se devi — non è già più mio. Prendi la mia squadra. Prendi la mia torre. Non prenderò il pensiero di essermi sbagliato."] },
    18: { lines: ["Se n'è andato. È uscito dalla porta sul retro dicendosi ancora di aver vinto.", "Va bene così. Le persone come lui escono sempre dalla porta sul retro. La porta principale è dove il resto di noi dice buonanotte.", "Allenatore — non credo che piangerò, e non credo che mi sentirò orgoglioso, ed è una cosa strana e quieta da provare dopo dieci anni passati a sentirsi dire di provare esattamente una cosa sola.", "Grazie. Per la cosa che non è né orgoglio né lutto. Per il luogo quieto in mezzo, dove un ragazzo può semplicemente essere una persona per la prima volta."] },
    19: { lines: ["Ho seguito questa da Sinnoh. Steven era seduto accanto a me. Nessuno di noi ha parlato.", "Ora hai chiuso ogni anello che l'ultima generazione di cattivi aveva lasciato aperto. Rocket. Aqua. Magma. Galactic. Plasma. Ognuno di loro pensava di aver trovato l'unico modo corretto di tenere un Pokémon. Ognuno si sbagliava, e ognuno si sbagliava in una forma diversa e interessante.", "Ciò che hai, allenatore, è l'unica risposta corretta. È: *tu non li tieni*. Stai accanto a loro. Chiedi loro delle cose. Loro rispondono. Questo basta.", "È sempre bastato. Eri sempre destinato a essere tu a dimostrarlo."] },
  },
  "kanto-e4": {
    0: { lines: ["I Superquattro ti attendono.", "Solo i più forti possono passare."] },
    1: { lines: ["Benvenuto, sfidante.", "Io, Lorelei dei Superquattro, ti congelerò sul posto."] },
    3: { lines: ["Hwa-haa!", "Sono Bruno. I miei Pokémon lottatori ti schiacceranno!"] },
    5: { lines: ["Oak ha parlato di te, ragazzo.", "Vediamo se riesci a sopravvivere ai miei fantasmi!"] },
    7: { lines: ["Sono Lance, il Maestro dei Draghi.", "Mostrami di che pasta sei fatto!"] },
    9: { lines: ["Sei davvero degno.", "Ma c'è ancora uno sfidante..."] },
    10: { lines: ["Yo! Da quanto tempo!", "Sono l'allenatore più forte di Kanto. Non dimenticarlo!"] },
    12: { lines: ["Tch... be', non sei male.", "Tornerò più forte. Contaci."] },
  },
  "johto-e4": {
    0: { lines: ["Benvenuto, io sono Will.", "Mi sono allenato in tutto il mondo. I miei Pokémon psichici sono imbattibili!"] },
    2: { lines: ["Fwahahaha!", "I veleni di un ninja saranno la tua rovina!"] },
    4: { lines: ["Ci incontriamo di nuovo.", "I miei pugni sono più affilati che mai!"] },
    6: { lines: ["Sono Karen dei Superquattro.", "Preferisco i Pokémon che mi piacciono personalmente — sentimenti forti rendono forti i Pokémon."] },
    8: { lines: ["Benvenuto nella stanza del Campione.", "Sono Lance, l'allenatore di draghi. Questa volta non perderò!"] },
    10: { lines: ["Tu... hai sconfitto persino me.", "Sei il nuovo Campione di Johto."] },
  },
  "hoenn-e4": {
    0: { lines: ["Ehi, hai fegato.", "Sono Sidney — il tipo Buio è il mio nome, e non gioco pulito."] },
    2: { lines: ["Ciao! Sono Phoebe.", "Mi sono allenata con gli spiriti su Mt. Pyre. Non mi hanno mai lasciata del tutto andare..."] },
    4: { lines: ["Benvenuto.", "I miei Pokémon Ghiaccio si sono congelati di passione il giorno in cui ti hanno incontrato."] },
    6: { lines: ["Sono Drake, dei Superquattro.", "Cavalcare draghi richiede coraggio. Mostrami il tuo!"] },
    8: { lines: ["Benvenuto, sfidante.", "Sono Steven, il Campione di Hoenn. Che le nostre pietre si scontrino!"] },
    10: { lines: ["Una lotta davvero abbagliante.", "Hoenn ha un nuovo Campione."] },
  },
  "sinnoh-e4": {
    0: { lines: ["Benvenuto alla Lega Pokémon.", "Sono Aaron — i tipi Coleottero sono molto più forti di quanto la gente pensi!"] },
    2: { lines: ["Be', ciao, giovanotto!", "Nonna Bertha ti insegnerà quanto può essere forte la terra."] },
    4: { lines: ["Sei pronto a infiammarti?", "I miei tipi Fuoco ti bruceranno fino a ridurti in cenere!"] },
    6: { lines: ["Un momento, per favore — lasciami finire questo paragrafo.", "Ora... cominciamo?"] },
    8: { lines: ["Sono Cynthia, la Campionessa di Sinnoh.", "Non perdo mai alla leggera. Porta tutto ciò che hai!"] },
    10: { lines: ["Che lotta emozionante...", "Sei davvero un Campione. Sinnoh è tua."] },
  },
  "unova-e4": {
    0: { lines: ["Tu... sei un'ispirazione per il mio prossimo romanzo.", "Lascia che i miei tipi Spettro infestino la pagina!"] },
    2: { lines: ["Hyaaaah!", "Ti mostrerò la forza di un vero artista marziale!"] },
    4: { lines: ["La vita è un serio gioco d'azzardo.", "Ti va di scommettere su questo incontro?"] },
    6: { lines: ["Mi sono risvegliata dal mio sonno per te.", "Mostrami una lotta degna del sogno."] },
    8: { lines: ["Hahaha! Che corsa incredibile!", "Sono Alder, il Campione di Unova. Godiamocela!"] },
    10: { lines: ["Una lotta davvero ardente!", "Ora sei il Campione di Unova. Porta il titolo con orgoglio."] },
  },
  "red-challenge": {
    0: { lines: ["Hai battuto i Superquattro in due regioni...", "Ma Red è su un altro livello.", "Non parla. Lotta e basta."] },
    2: { lines: ["..."] },
  },
  "cynthia-rematch": {
    0: { lines: ["Mi sono allenata dalla nostra ultima lotta.", "Questa volta niente trattenersi."] },
    2: { lines: ["Magnifico... Sei davvero l'allenatore più forte che abbia mai affrontato."] },
  },
  "n-finale": {
    0: { lines: ["Sei venuto. Speravo che lo facessi.", "Ricordi cosa ti dissi, all'inizio? Del filo — quella piccola linea di sentimento tessuta tra un allenatore e un Pokémon con ogni momento condiviso?", "Il tuo è diventato una corda. Più spessa di qualsiasi cosa il mondo abbia visto da molto tempo. E lui se ne è accorto.", "N ha passato tutti questi mesi a viaggiare dietro di te, ascoltando. E da qualche parte là fuori, i Pokémon più antichi del mondo — quelli che sono il filo stesso — hanno cominciato a rispondergli.", "Ti aspetta lungo il sentiero. Non fingerò che sia solo un'altra lotta. Va' con cautela."] },
    1: { lines: ["Sei venuto. Grazie.", "Ti ho osservato dal margine di ogni città, di ogni Palestra, di ogni Lega. Ho sentito i tuoi Pokémon diventare più rumorosi, più felici, più orgogliosi. Li ho sentiti amarti.", "Eppure non sono sicuro. Non ancora. Perché ho sentito anche — in voci più antiche, in voci che cantavano prima che il primo umano parlasse — domande a cui nessun vivente ha risposto. Le porrò attraverso tre lotte. Tre domande, tre squadre. Se riuscirai a tenere il tuo filo contro tutte e tre, crederò a ciò a cui voglio credere."] },
    2: { lines: ["La prima domanda — la più semplice. *Ciò che provi è reale, o è solo ciò che hai addestrato loro a provare?* Il mio compagno la chiederà per me. Non avere paura."] },
    4: { lines: ["...Una verità non basta. Un orecchio allenato può scambiare una buona imitazione per una voce reale.", "La seconda domanda, allora. *Il mondo che sogni di condividere con loro — lo sceglierebbero, se potessero parlare?* Mostrami cosa vorresti che volessero."] },
    6: { lines: ["...Credo di star sorridendo. Non me lo aspettavo.", "Un'ultima domanda. La più antica. Nessuno di noi due ha una risposta — ma voglio vedere cosa succede quando la poniamo insieme. *Se il filo potesse essere tagliato, e i tuoi Pokémon scegliessero comunque di restare — lo farebbero?*", "Kyurem è il silenzio su cui il tuo filo è teso. I kami sono venuti perché il cielo sta ascoltando. Combatti con me un'ultima volta."] },
    8: { lines: ["...Ha retto. Persino contro Kyurem, ha retto.", "Sono rimasti con te. Non perché tu glielo abbia comandato. Perché hanno scelto di farlo. Era questo che dovevo sapere. È l'unica risposta che abbia mai voluto. Grazie, allenatore. Davvero."] },
    9: { lines: ["Li libererò di nuovo al vento, alla tempesta e ai luoghi profondi da cui sono venuti. Non dovrebbero appartenere a nessuno — meno che mai a me.", "E poi andrò in un posto tranquillo. Voglio ascoltare di nuovo, per bene, senza domande in testa per una volta. Se mai sentirai una piccola voce che non riconosci, sulla strada o in sogno — potrebbe essere uno dei miei, di passaggio. Salutala da parte mia.", "Prima di andare — un altro dono. O forse un promemoria.", "Il Dreaming Market aprirà per te i suoi scaffali più profondi. TMs, strumenti tenuti, piccoli utensili per allenatori che hanno già dimostrato di non scambiare gli strumenti per legami.", "Il filo non diventa più forte solo in lotta. Cresce quando *giochi*. Quando ridi con loro, quando lanci una mela e loro la prendono al volo e ti guardano come se avessi compiuto un miracolo. Guardavo i bambini farlo, e capivo meno di quanto avrei dovuto.", "Provalo. Porta uno di loro in un posto soleggiato, un posto che non sia una lotta. Sentirai il filo ronzare. È bello."] },
    10: { lines: ["L'ho sentito dal crocevia. Tutto il cielo lo ha sentito.", "Hai tenuto il filo contro il silenzio stesso. Capisci cosa significa?", "Significa che il mondo oggi è un po' più tessuto di quanto fosse ieri. Grazie a te. Grazie a loro.", "Grazie per aver percorso la lunga strada. Ora — vai dove desideri andare. Il sentiero è tuo."] },
    11: { infoTitle: "Shop & Minigames sbloccati", lines: ["Nel tuo menu sono apparse due nuove sezioni: **Shop** e **Minigames**.", "Lo Shop vende TMs e strumenti tenuti — utensili potenti, con prezzi per allenatori che hanno raggiunto la fine della strada di N.", "Scegli un Pokémon e gioca con lui. Il tuo punteggio fa guadagnare a quel Pokémon Bond XP — un altro modo per aiutarlo a crescere, senza mai scegliere una mossa.", "Il primo è **Apple Catch**. Prendi le mele, evita le rocce e vedi quanto vicino riesci a portarlo alle nuvole."] },
    12: { infoTitle: "Il filo, intatto", lines: ["Hai raggiunto la fine della storia.", "Tutto ciò che viene dopo — ogni lotta, ogni pack, ogni passeggiata quieta — è tuo da tessere."] },
  },
} as const satisfies StoryTranslationMap;

const ITALIAN_STORY_TRANSLATION_MAP: StoryTranslationMap = ITALIAN_STORY_TRANSLATIONS;

export interface LocalizedStoryStepText {
  readonly infoTitle?: string;
  readonly lines: string[];
}

function getBrowserStoryLocale(): string {
  if (typeof navigator === 'undefined') return '';
  return (navigator.languages?.[0] || navigator.language || '').toLowerCase();
}

export function shouldUseItalianStoryText(): boolean {
  return getBrowserStoryLocale().startsWith('it');
}

export function getLocalizedStoryStepText(storylineId: string, stepIndex: number, step: StoryStep): LocalizedStoryStepText {
  const originalLines = step.lines ?? [];
  if (!shouldUseItalianStoryText()) {
    return { infoTitle: step.infoTitle, lines: [...originalLines] };
  }

  const translation = ITALIAN_STORY_TRANSLATION_MAP[storylineId]?.[stepIndex];
  const translatedLines = translation?.lines;
  const lines = originalLines.map((line, index) => translatedLines?.[index] ?? line);

  return {
    infoTitle: translation?.infoTitle ?? step.infoTitle,
    lines,
  };
}
