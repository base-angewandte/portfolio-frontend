module.exports = {
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
            source: 'http://localhost:8200/autosuggest/v1/person/',
            field_format: 'half',
          },
        },
        subtitle: {
          type: 'string',
          title: 'subtitle',
          'x-attrs': {
            placeholder: 'Specify a title',
            field_type: 'text',
            order: 2,
            field_format: 'half',
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
        texts: {
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
