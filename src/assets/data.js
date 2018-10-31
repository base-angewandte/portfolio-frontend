module.exports = {
  TYPE_DATA: [],
  EXISTING_ENTRIES: [
    {
      id: '1',
      title: 'On a lovely Summers Day',
      subtitle: 'A Show',
      type: 'Bild',
      description:
      {
        English: 'Alles Neu',
        German: 'And so on',
        type: 'Ausstellungsankündigung',
      },
      keywords: ['Schmerz', 'Leid'],
      shared: true,
      error: true,
    },
    {
      id: '2',
      title: 'Oh this hot hot heat',
      type: 'Bild',
    },
    {
      id: '3',
      title: 'And then again a different title',
      type: 'Ausstellung',
      shared: true,
    },
    {
      id: '4',
      title: 'Allons-y!!',
      type: 'Bild',
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
        name: 'description',
        type: 'multiline',
        size: 'full',
        lang: ['English', 'German'],
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
        name: 'photographer',
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
    document: ['Publikation', 'Text', 'Monograph', 'Periodikum', 'Sammelband', 'Aufsatzsammlung', 'Interview', 'Zeitungsartikel', 'Kritik', 'Essay'],
    image: ['Bild', 'Fotografie', 'Gemälde', 'Zeichnung', 'Collage'],
    film: ['Fernsebericht', 'Dokumentation', 'Film', 'Spielfilm', 'Fernsehbeitrag', 'TV-Beitrag', 'Kurzfilm'],
    audio: ['Podcast', 'Radiointerview', 'Radiofeature', 'Audiobeitrag', 'Reportage', 'Hörspiel', 'Rundfunkausstrahlung'],
    exhibition: ['Ausstellung', 'Einzelausstellung', 'Gruppenausstellung'],
  },
};
