module.exports = {
  TYPE_DATA: [],
  EXISTING_ENTRIES: [
    {
      id: '1',
      title: 'Buch: Omi',
      subtitle: '',
      type: 'Lithographie',
      text:
      {
        Englisch: 'Technical Specifications: stone lithography handcolored 7,4 x 5,2 cm, 49 Pages',
        Deutsch: 'technische Angaben: Steinlithographie handcoloriert 7,4 x 5,2 cm, 49 Seiten',
        type: 'Beschreibung',
      },
      keywords: ['Schmerz', 'Leid'],
      data: {
        artist: ['Susanna Eva Gartmayer'],
      },
      shared: false,
      error: false,
    },
    {
      id: '2',
      title: 'Valie Export',
      type: 'Buch',
      text:
        {
          Englisch: 'Exhibitions:\nCnp, Centre national de la photographie, Paris, September - December 2003\nCAAC, Centro Andaluz de Arte Contemporáneo, Sevilla, January - April 2004\nMamco, Musée d’art moderne et contemporain, Geneva, May - August 2004\nCamden Arts Centre, London, September - November 2004\nSammlung Essl Privatstiftung, Klosterneuburg, Vienna, February - April 2005\n\nLanguage: EN, FR',
          Deutsch: 'Ausstellungen:\nCnp, Centre national de la photographie, Paris, September - Dezember 2003\nCAAC, Centro Andaluz de Arte Contemporáneo, Sevilla, Jänner - April 2004\nMamco, Musée d’art moderne et contemporain, Geneva, Mai - August 2004\nCamden Arts Centre, London, September - November 2004\nSammlung Essl Privatstiftung, Klosterneuburg, Wien, Februar - April 2005\n\nSprache: EN, FR',
          type: 'Beschreibung',
        },
      keywords: ['Performance', 'Photographie', 'Kunst im öffentlichen Raum'],
      data: {
        authors: ['VALIE EXPORT'],
        ISBN: '2-912415-77-2',
      },
    },
    {
      id: '3',
      title: 'Again a different title',
      type: 'Ausstellung',
      shared: true,
    },
    {
      id: '4',
      title: 'Allons-y!!',
      type: 'Bild',
    },
    {
      id: '5',
      title: 'Freshwater Sediment',
      subtitle: '',
      type: 'Publikation',
      text:
        {
          Englisch: 'Freshwater macrophytes stimulate rhizosphere-associated coupled nitrification-denitrification and are therefore likely to influence the community composition and abundance of rhizosphere-associated denitrifiers and nitrate reducers. Using the narG gene, which encodes the catalytic subunit of the membrane-bound nitrate reductase, as a molecular marker, the community composition and relative abundance of nitrate-reducing bacteria were compared in the rhizosphere of the freshwater macrophyte species Littorella uniflora and Myriophyllum alterniflorum to nitrate-reducing communities in unvegetated sediment. Microsensor analysis indicated a higher availability of oxygen in the rhizosphere compared to unvegetated sediment, with a stronger release of oxygen from the roots of L. uniflora compared to M. alterniflorum. Comparison of narG clone libraries between samples revealed a higher diversity of narG phylotypes in association with the macrophyte rhizospheres compared to unvegetated sediment. Quantitative PCR targeting narG- and 16S rRNA-encoding genes pointed to a selective enrichment of narG gene copies in the rhizosphere. The results suggested that the microenvironment of macrophyte rhizospheres, characterized by the release of oxygen and labile organic carbon from the root system, had a stimulating effect on the diversity and relative abundance of rhizosphere-associated nitrate reducers.',
          Deutsch: 'Süßwassermakrophyten stimulieren die mit der Rhizosphäre assoziierte gekoppelte Nitrifikations-Denitrifikation und beeinflussen daher wahrscheinlich die Zusammensetzung der Gemeinde und die Häufigkeit von Rhizosphären-assoziierten Denitrifizierungsmitteln und Nitratreduzierern. Unter Verwendung des narG-Gens, das die katalytische Untereinheit der membrangebundenen Nitratreduktase codiert, als molekularer Marker wurden die Zusammensetzung der Gemeinschaft und die relative Häufigkeit von Nitrat reduzierenden Bakterien in der Rhizosphäre der Süßwassermakrophyten-Spezies Littorella uniflora und Myriophyllum alterniflorum mit verglichen nitratreduzierende Gemeinden in nicht-vegetiertem Sediment. Die Mikrosensorenanalyse zeigte eine höhere Verfügbarkeit von Sauerstoff in der Rhizosphäre im Vergleich zu nicht-vegetiertem Sediment mit einer stärkeren Freisetzung von Sauerstoff aus den Wurzeln von L. uniflora im Vergleich zu M. alterniflorum. Der Vergleich der narG-Klonbibliotheken zwischen den Proben ergab eine höhere Diversität der narG-Phylotypen in Verbindung mit den Makrophyten-Rhizosphären im Vergleich zu nicht-vegetiertem Sediment. Quantitative PCR, die auf narG- und 16S-rRNA-kodierende Gene abzielen, wiesen auf eine selektive Anreicherung von narG-Genkopien in der Rhizosphäre hin. Die Ergebnisse legen nahe, dass die Mikroumgebung von Makrophyten-Rhizosphären, die durch die Freisetzung von Sauerstoff und labilem organischem Kohlenstoff aus dem Wurzelsystem gekennzeichnet sind, einen stimulierenden Effekt auf die Diversität und den relativen Anteil von Rhizosphären-assoziierten Nitratreduzierern hat.',
          type: 'Abstract',
        },
      keywords: ['Nitrification', 'Microbial Ecology', 'Freshwater Sediment'],
      data: {
        authors: ['Kofoed MV', 'Stief P', 'Hauzmayer S', 'Schramm A', 'Herrmann M.'],
        'erschienen in': 'Systems of Applied Microbiology',
        publisher: ['Elvisier'],
        editors: ['Rudolf Amann', 'Ramon Rosselló-Móra', 'Karl-Heinz Schleifer'],
        date: {
          from: new Date('2012-10'),
        },
        DOI: ' 10.1016/j.syapm.2012.08.005',
      },
      shared: false,
      error: false,
    },
  ],
  FORM_MAPPINGS: {
    common: [
      {
        name: 'title',
        type: 'autocomplete',
        size: 'half',
      },
      {
        name: 'subtitle',
        type: 'text',
        size: 'half',
      },
      {
        name: 'type',
        type: 'chips',
        mode: 'single',
        source: 'cv',
        unknown: false,
        size: 'full',
      },
      {
        name: 'text',
        type: 'multiline',
        size: 'full',
        lang: ['Englisch', 'Deutsch'],
        setType: true,
      },
      {
        name: 'keywords',
        type: 'chips',
        source: 'static',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'notes',
        type: 'multiline',
        size: 'full',
      },
    ],
    document: [
      {
        name: 'authors',
        type: 'chips',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'erschienen in',
        type: 'text',
        size: 'full',
      },
      {
        name: 'editors',
        type: 'chips',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'publisher',
        type: 'chips',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'city',
        type: 'autocomplete',
        size: 'half',
      },
      {
        name: 'date',
        type: 'date',
        size: 'half',
        dateType: 'single',
      },
      {
        name: 'ISBN',
        type: 'autocomplete',
        size: 'half',
      },
      {
        name: 'DOI',
        type: 'autocomplete',
        size: 'half',
      },
      {
        name: 'Participants',
        type: 'chips-below',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
    ],
    image: [
      {
        name: 'artist',
        type: 'chips',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'participants',
        type: 'chips-below',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'location',
        type: 'autocomplete',
        size: 'half',
      },
      {
        name: 'date',
        type: 'date',
        size: 'half',
        dateType: 'single',
      },
    ],
    film: [
      {
        name: 'director',
        type: 'chips',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'participants',
        type: 'chips-below',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'TV Station',
        type: 'text',
        size: 'half',
      },
      {
        name: 'city',
        type: 'autocomplete',
        size: 'half',
      },
      {
        name: 'date',
        type: 'date',
        size: 'half',
        dateType: 'single',
      },
    ],
    exhibition: [
      {
        name: 'artist',
        type: 'chips',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'curator',
        type: 'chips',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'participants',
        type: 'chips-below',
        source: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'date',
        type: 'date',
        size: 'half',
        dateType: 'range',
      },
      {
        name: 'opening',
        type: 'date',
        size: 'half',
        dateType: 'datetime',
      },
    ],
  },
  GENERAL_TYPES: ['document', 'image', 'film', 'audio', 'exhibition'],
  TYPE_MAPPINGS: {
    document: ['Buch', 'Publikation', 'Text', 'Monograph', 'Periodikum', 'Sammelband', 'Aufsatzsammlung', 'Interview', 'Zeitungsartikel', 'Kritik', 'Essay'],
    image: ['Bild', 'Fotografie', 'Gemälde', 'Zeichnung', 'Collage', 'Lithographie'],
    film: ['Fernsebericht', 'Dokumentation', 'Film', 'Spielfilm', 'Fernsehbeitrag', 'TV-Beitrag', 'Kurzfilm'],
    audio: ['Podcast', 'Radiointerview', 'Radiofeature', 'Audiobeitrag', 'Reportage', 'Hörspiel', 'Rundfunkausstrahlung'],
    exhibition: ['Ausstellung', 'Einzelausstellung', 'Gruppenausstellung'],
  },
};
