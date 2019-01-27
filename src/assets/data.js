module.exports = {
  TYPE_DATA: [],
  EXISTING_ENTRIES: [
    {
      id: '1',
      title: 'Buch: Omi',
      subtitle: '',
      type: 'Lithographie',
      text: [
        {
          type: 'Beschreibung',
          text: [
            {
              text: 'Technical Specifications: stone lithography handcolored 7,4 x 5,2 cm, 49 Pages',
              language: 'english',
            },
            {
              text: 'technische Angaben: Steinlithographie handcoloriert 7,4 x 5,2 cm, 49 Seiten',
              language: 'german',
            },
          ],
        },
      ],
      keywords: ['Schmerz', 'Leid'],
      data: {
        artist: [{
          uuid: '1',
          artist: 'Susanna Eva Gartmayer',
        }],
      },
      shared: false,
      error: false,
      linked: [{
        id: '2',
        title: 'VALIE EXPORT',
      }],
    },
    {
      id: '2',
      title: 'Valie Export',
      type: 'Buch',
      text: [
        {
          type: 'Beschreibung',
          text: [
            {
              text: 'Exhibitions:\nCnp, Centre national de la photographie, Paris, September - December 2003\nCAAC, Centro Andaluz de Arte Contemporáneo, Sevilla, January - April 2004\nMamco, Musée d’art moderne et contemporain, Geneva, May - August 2004\nCamden Arts Centre, London, September - November 2004\nSammlung Essl Privatstiftung, Klosterneuburg, Vienna, February - April 2005\n\nLanguage: EN, FR',
              language: 'english',
            },
            {
              text: 'Ausstellungen:\nCnp, Centre national de la photographie, Paris, September - Dezember 2003\nCAAC, Centro Andaluz de Arte Contemporáneo, Sevilla, Jänner - April 2004\nMamco, Musée d’art moderne et contemporain, Geneva, Mai - August 2004\nCamden Arts Centre, London, September - November 2004\nSammlung Essl Privatstiftung, Klosterneuburg, Wien, Februar - April 2005\n\nSprache: EN, FR',
              language: 'german',
            },
          ],
        },
      ],
      keywords: ['Performance', 'Photographie', 'Kunst im öffentlichen Raum'],
      data: {
        authors: [{
          authors: 'VALIE EXPORT',
          uuid: 'xuyasdf',
        }],
        ISBN: '2-912415-77-2',
        erschienen_in: [
          {
            title: 'Poems',
            subtitle: 'A test',
          },
        ],
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
      files: [
        {
          filename: 'Allons-y!!!!!!!!!!!!!!!!!!!!!!!!',
          published: true,
          license: 'CC-BY',
          url: 'https://pm1.narvii.com/5723/17dbba1b3fea1be63dc2970ce3289c9cf27b925e_hq.jpg',
        },
      ],
    },
    {
      id: '5',
      title: 'Higher nitrate-reducer diversity in macrophyte-colonized compared to unvegetated freshwater sediment.',
      subtitle: '',
      type: 'Publikation',
      text: [
        {
          type: 'Beschreibung',
          text: [
            {
              text: 'Freshwater macrophytes stimulate rhizosphere-associated coupled nitrification-denitrification and are therefore likely to influence the community composition and abundance of rhizosphere-associated denitrifiers and nitrate reducers. Using the narG gene, which encodes the catalytic subunit of the membrane-bound nitrate reductase, as a molecular marker, the community composition and relative abundance of nitrate-reducing bacteria were compared in the rhizosphere of the freshwater macrophyte species Littorella uniflora and Myriophyllum alterniflorum to nitrate-reducing communities in unvegetated sediment. Microsensor analysis indicated a higher availability of oxygen in the rhizosphere compared to unvegetated sediment, with a stronger release of oxygen from the roots of L. uniflora compared to M. alterniflorum. Comparison of narG clone libraries between samples revealed a higher diversity of narG phylotypes in association with the macrophyte rhizospheres compared to unvegetated sediment. Quantitative PCR targeting narG- and 16S rRNA-encoding genes pointed to a selective enrichment of narG gene copies in the rhizosphere. The results suggested that the microenvironment of macrophyte rhizospheres, characterized by the release of oxygen and labile organic carbon from the root system, had a stimulating effect on the diversity and relative abundance of rhizosphere-associated nitrate reducers.',
              language: 'english',
            },
            {
              text: 'Süßwassermakrophyten stimulieren die mit der Rhizosphäre assoziierte gekoppelte Nitrifikations-Denitrifikation und beeinflussen daher wahrscheinlich die Zusammensetzung der Gemeinde und die Häufigkeit von Rhizosphären-assoziierten Denitrifizierungsmitteln und Nitratreduzierern. Unter Verwendung des narG-Gens, das die katalytische Untereinheit der membrangebundenen Nitratreduktase codiert, als molekularer Marker wurden die Zusammensetzung der Gemeinschaft und die relative Häufigkeit von Nitrat reduzierenden Bakterien in der Rhizosphäre der Süßwassermakrophyten-Spezies Littorella uniflora und Myriophyllum alterniflorum mit verglichen nitratreduzierende Gemeinden in nicht-vegetiertem Sediment. Die Mikrosensorenanalyse zeigte eine höhere Verfügbarkeit von Sauerstoff in der Rhizosphäre im Vergleich zu nicht-vegetiertem Sediment mit einer stärkeren Freisetzung von Sauerstoff aus den Wurzeln von L. uniflora im Vergleich zu M. alterniflorum. Der Vergleich der narG-Klonbibliotheken zwischen den Proben ergab eine höhere Diversität der narG-Phylotypen in Verbindung mit den Makrophyten-Rhizosphären im Vergleich zu nicht-vegetiertem Sediment. Quantitative PCR, die auf narG- und 16S-rRNA-kodierende Gene abzielen, wiesen auf eine selektive Anreicherung von narG-Genkopien in der Rhizosphäre hin. Die Ergebnisse legen nahe, dass die Mikroumgebung von Makrophyten-Rhizosphären, die durch die Freisetzung von Sauerstoff und labilem organischem Kohlenstoff aus dem Wurzelsystem gekennzeichnet sind, einen stimulierenden Effekt auf die Diversität und den relativen Anteil von Rhizosphären-assoziierten Nitratreduzierern hat.',
              language: 'german',
            },
          ],
        },
      ],
      keywords: ['Nitrification', 'Microbial Ecology', 'Freshwater Sediment'],
      data: {
        authors: [{
          commonname: 'Kofoed MV',
          uuid: '1',
        }, {
          commonname: 'Stief P',
          uuid: '2',
        }, {
          commonname: 'Hauzmayer S',
          uuid: '3',
        }, {
          commonname: 'Schramm A',
          uuid: '4',
        }, {
          commonname: 'Herrmann M.',
          uuid: '5',
        }],
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
    common: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          title: 'title',
          'x-attrs': {
            placeholder: 'Specify a title',
            field_type: 'autocomplete',
            order: 1,
          },
        },
        subtitle: {
          type: 'string',
          title: 'subtitle',
          'x-attrs': {
            placeholder: 'Specify a title',
            field_type: 'text',
            order: 2,
          },
        },
        type: {
          type: 'string',
          title: 'type',
          'x-attrs': {
            placeholder: 'Specify a title',
            field_type: 'chips',
            order: 3,
          },
        },
        text: {
          type: 'array',
          'x-attrs': {
            placeholder: 'Specify a title',
            field_type: 'multiline',
            order: 4,
          },
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                title: 'type',
              },
              text: {
                type: 'array',
                title: 'text',
                items: {
                  type: 'object',
                  properties: {
                    text: {
                      type: 'string',
                      title: 'text',
                    },
                    language: {
                      type: 'string',
                      title: 'language',
                    },
                  },
                  required: [
                    'language',
                    'text',
                  ],
                },
              },
            },
            additionalProperties: false,
          },
        },
        keywords: {
          type: 'array',
          title: 'keywords',
          'x-attrs': {
            placeholder: 'Specify a title',
            field_type: 'chips',
            order: 5,
          },
          items: {
            type: 'string',
          },
        },
        notes: {
          type: 'string',
          'x-attrs': {
            placeholder: 'Specify a title',
            field_type: 'multiline',
            order: 6,
          },
          title: 'notes',
        },
      },
    },


    /* [
      {
        name: 'title',
        dataType: String,
        type: 'autocomplete',
        size: 'half',
        source: '/data-api/fetchAutocomplete/title',
      },
      {
        name: 'subtitle',
        dataType: String,
        type: 'text',
        size: 'half',
      },
      {
        name: 'type',
        dataType: Array,
        type: 'chips',
        mode: 'single',
        sourceType: 'static',
        source: '/data-api/api/type',
        unknown: false,
        size: 'full',
      },
      {
        name: 'text',
        dataType: Object,
        type: 'multiline',
        size: 'full',
        lang: ['Englisch', 'Deutsch'],
        setType: true,
      },
      {
        name: 'keywords',
        dataType: Array,
        type: 'chips',
        sourceType: 'static',
        source: '/data-api/api/keywords',
        unknown: false,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'notes',
        dataType: String,
        type: 'multiline',
        size: 'full',
        setType: false,
      },
    ], */
    document:
      {
        type: 'object',
        properties: {
          authors: {
            type: 'array',
            order: 1,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'chips',
              source: '/data-api/fetchAutocomplete/authors',
            },
            items: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                },
                source_id: {
                  type: 'string',
                },
                commonname: {
                  type: 'string',
                },
                role: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          },
          editors: {
            type: 'array',
            order: 2,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'chips',
            },
            items: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                },
                source_id: {
                  type: 'string',
                },
                commonname: {
                  type: 'string',
                },
                role: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          },
          publisher: {
            type: 'array',
            order: 3,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'chips',
            },
            items: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                },
                source_id: {
                  type: 'string',
                },
                commonname: {
                  type: 'string',
                },
                role: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          },
          city: {
            type: 'array',
            order: 4,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'chips',
            },
            items: {
              type: 'object',
              properties: {
                country_name: {
                  type: 'string',
                },
                geoname_name: {
                  type: 'string',
                },
                longitude: {
                  type: 'string',
                },
                geoname_id: {
                  type: 'string',
                },
                latitude: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          },
          date: {
            type: 'object',
            order: 5,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'date',
            },
            properties: {
              from: {
                type: 'string',
              },
              to: {
                type: 'string',
              },
            },
            format: 'date',
          },
          isbn: {
            type: 'string',
            order: 6,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
          doi: {
            type: 'string',
            order: 7,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
          url: {
            type: 'string',
            order: 8,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
          published_in: {
            type: 'object',
            order: 9,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'label',
            },
            properties: {
              title: {
                type: 'string',
                order: 1,
                'x-attrs': {
                  placeholder: 'Specify a title',
                  field_type: 'text',
                },
              },
              subtitle: {
                type: 'string',
                order: 2,
                'x-attrs': {
                  placeholder: 'Specify a title',
                  field_type: 'text',
                },
              },
              authors: {
                type: 'array',
                order: 3,
                'x-attrs': {
                  placeholder: 'Specify a title',
                  field_type: 'chips',
                },
                items: {
                  type: 'object',
                  properties: {
                    source: {
                      type: 'string',
                    },
                    source_id: {
                      type: 'string',
                    },
                    commonname: {
                      type: 'string',
                    },
                    role: {
                      type: 'string',
                    },
                  },
                  additionalProperties: false,
                },
              },
              editors: {
                type: 'array',
                order: 4,
                'x-attrs': {
                  placeholder: 'Specify a title',
                  field_type: 'chips',
                },
                items: {
                  type: 'object',
                  properties: {
                    source: {
                      type: 'string',
                    },
                    source_id: {
                      type: 'string',
                    },
                    commonname: {
                      type: 'string',
                    },
                    role: {
                      type: 'string',
                    },
                  },
                  additionalProperties: false,
                },
              },
              publisher: {
                type: 'array',
                order: 5,
                'x-attrs': {
                  placeholder: 'Specify a title',
                  field_type: 'chips',
                },
                items: {
                  type: 'object',
                  properties: {
                    source: {
                      type: 'string',
                    },
                    source_id: {
                      type: 'string',
                    },
                    commonname: {
                      type: 'string',
                    },
                    role: {
                      type: 'string',
                    },
                  },
                  additionalProperties: false,
                },
              },
            },
            additionalProperties: false,
          },
          volume: {
            type: 'string',
            order: 10,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
          pages: {
            type: 'string',
            order: 11,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
          participants: {
            type: 'array',
            order: 12,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'chips-below',
            },
            items: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                },
                source_id: {
                  type: 'string',
                },
                commonname: {
                  type: 'string',
                },
                role: {
                  type: 'string',
                },
              },
              additionalProperties: false,
            },
          },
          language: {
            type: 'string',
            order: 13,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
          material: {
            type: 'string',
            order: 14,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
          format: {
            type: 'string',
            order: 15,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
          edition: {
            type: 'string',
            order: 17,
            'x-attrs': {
              placeholder: 'Specify a title',
              field_type: 'text',
            },
          },
        },
        additionalProperties: false,
      },
    /* [
      {
        name: 'authors',
        dataType: Array,
        type: 'chips',
        sourceType: 'dynamic',
        source: '/data-api/fetchAutocomplete/authors',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'editors',
        dataType: Array,
        type: 'chips',
        sourceType: 'dynamic',
        source: '/data-api/fetchAutocomplete/authors',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'publisher',
        dataType: Array,
        type: 'chips',
        sourceType: 'dynamic',
        source: '/data-api/fetchAutocomplete/authors',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'location',
        dataType: String,
        type: 'autocomplete',
        source: '/data-api/fetchAutocomplete/city',
        size: 'half',
      },
      {
        name: 'date',
        dataType: Object,
        type: 'date',
        size: 'half',
        dateType: 'single',
      },
      {
        name: 'ISBN',
        dataType: String,
        type: 'autocomplete',
        source: '/data-api/fetchAutocomplete/doi',
        size: 'half',
      },
      {
        name: 'DOI',
        attrs: [],
        dataType: String,
        type: 'autocomplete',
        source: '/data-api/fetchAutocomplete/doi',
        size: 'half',
      },
      {
        name: 'URL',
        dataType: String,
        type: 'autocomplete',
        source: '/data-api/fetchAutocomplete/doi',
        size: 'full',
      },
      {
        name: 'erschienen_in',
        dataType: String,
        type: 'label',
        source: '/data-api/fetchAutocomplete/journal',
        size: 'full',
        multiplyLabel: true,
      },
      [
        {
          name: 'title',
          dataType: String,
          type: 'autocomplete',
          size: 'half',
          source: '/data-api/fetchAutocomplete/title',
        },
        {
          name: 'subtitle',
          dataType: String,
          type: 'text',
          size: 'half',
        },
        {
          name: 'authors',
          dataType: Array,
          type: 'chips',
          sourceType: 'dynamic',
          source: '/data-api/fetchAutocomplete/authors',
          unknown: true,
          mode: 'multi',
          size: 'full',
        },
        {
          name: 'editors',
          dataType: Array,
          type: 'chips',
          sourceType: 'dynamic',
          source: '/data-api/fetchAutocomplete/authors',
          unknown: true,
          mode: 'multi',
          size: 'full',
        },
        {
          name: 'publisher',
          dataType: Array,
          type: 'chips',
          sourceType: 'dynamic',
          source: '/data-api/fetchAutocomplete/authors',
          unknown: true,
          mode: 'multi',
          size: 'full',
        },
      ],
      {
        name: 'Participants',
        dataType: Array,
        type: 'chips-below',
        sourceType: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
    ], */
    image: [
      {
        name: 'artist',
        dataType: Array,
        type: 'chips',
        sourceType: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'participants',
        dataType: Array,
        type: 'chips-below',
        sourceType: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'location',
        dataType: String,
        type: 'autocomplete',
        size: 'half',
      },
      {
        name: 'date',
        dataType: Object,
        type: 'date',
        size: 'half',
        dateType: 'single',
      },
    ],
    film: [
      {
        name: 'director',
        dataType: Array,
        type: 'chips',
        sourceType: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'participants',
        dataType: Array,
        type: 'chips-below',
        sourceType: 'dynamic',
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
        dataType: Array,
        type: 'chips',
        sourceType: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'curator',
        dataType: Array,
        type: 'chips',
        sourceType: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'participants',
        dataType: Array,
        type: 'chips-below',
        sourceType: 'dynamic',
        unknown: true,
        mode: 'multi',
        size: 'full',
      },
      {
        name: 'date',
        dataType: Object,
        type: 'date',
        size: 'half',
        dateType: 'range',
      },
      {
        name: 'opening',
        dataType: Object,
        type: 'date',
        size: 'half',
        dateType: 'datetime',
      },
      {
        name: 'location',
        dataType: String,
        type: 'text',
        size: 'half',
      },
      {
        name: 'location description',
        dataType: String,
        type: 'text',
        size: 'half',
      },
      {
        name: 'URL',
        dataType: String,
        type: 'text',
        size: 'full',
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
