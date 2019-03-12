/* eslint-disable */
import axios from 'axios'
import qs from 'qs'
let domain = ''
export const getDomain = () => {
  return domain
}
export const setDomain = ($domain) => {
  domain = $domain
}
export const request = (method, url, body, queryParameters, form, config) => {
  method = method.toLowerCase()
  let keys = Object.keys(queryParameters)
  let queryUrl = url
  if (keys.length > 0) {
    queryUrl = url + '?' + qs.stringify(queryParameters)
  }
  // let queryUrl = url+(keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  if (body) {
    return axios[method](queryUrl, body, config)
  } else if (method === 'get') {
    return axios[method](queryUrl, {
      params: form
    }, config)
  } else {
    return axios[method](queryUrl, qs.stringify(form), config)
  }
}
/*==========================================================
 *                    The Skosmos REST API is a read-only interface to the data stored on the vocabulary server. The URL namespace is the base URL of the Skosmos instance followed by `/rest/v1/`. 

Most methods return the data as UTF-8 encoded JSON-LD, served using the `application/json` MIME type. The data consists of a single JSON object which includes JSON-LD context information (in the `@context` field) and one or more fields which contain the actual data. Some methods (`data`) return other formats (RDF/XML, Turtle, RDF/JSON) with the appropriate MIME type.

The API supports Cross-Origin Resource Sharing by setting the Access-Control-Allow-Origin HTTP header to `"*"` for all requests.

The API supports the JSONP convention of appending a callback parameter to any URL. The returned data will then be wrapped in a JavaScript function call using the function name provided as the callback parameter value. JSONP wrapped data will be served using the `application/javascript` MIME type.

 ==========================================================*/
/**
 * Available vocabularies
 * request: getVocabularies
 * url: getVocabulariesURL
 * method: getVocabularies_TYPE
 * raw_url: getVocabularies_RAW_URL
 * @param lang - language of labels, e.g. "en" or "fi"
 */
export const getVocabularies = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/vocabularies'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters['lang'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: lang'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getVocabularies_RAW_URL = function() {
  return '/vocabularies'
}
export const getVocabularies_TYPE = function() {
  return 'get'
}
export const getVocabulariesURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/vocabularies'
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Search concepts and collections by query term
 * request: getSearch
 * url: getSearchURL
 * method: getSearch_TYPE
 * raw_url: getSearch_RAW_URL
 * @param query - the term to search for e.g. "cat*"
 * @param lang - language of labels to match, e.g. "en" or "fi"
 * @param labellang - language of labels to return, e.g. "en" or "fi"
 * @param vocab - vocabulary/vocabularies to limit search to, e.g. "yso" or "yso allars"
 * @param type - limit search to concepts of the given type(s), e.g. "skos:Concept".
 * @param parent - limit search to concepts which have the given concept (specified by URI) as parent in their transitive broader hierarchy
 * @param group - limit search to concepts in the given group (specified by URI)
 * @param maxhits - Maximum number of results to return. If not given, maxhits will default to 100. (default settable in config.inc)
 * @param offset - offset where to start in ther esult set, useful for paging the result. If not given, defaults to 0.
 * @param fields - space-separated list of extra fields to include in the results. e.g. "related" or "prefLabel" or any other skos property.
 * @param unique - boolean flag to indicate that each concept should be returned only once, instead of returning all the different ways it could match (for example both via prefLabel and altLabel).
 */
export const getSearch = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/search'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['query'] !== undefined) {
    queryParameters['query'] = parameters['query']
  }
  if (parameters['query'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: query'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters['labellang'] !== undefined) {
    queryParameters['labellang'] = parameters['labellang']
  }
  if (parameters['vocab'] !== undefined) {
    queryParameters['vocab'] = parameters['vocab']
  }
  if (parameters['type'] !== undefined) {
    queryParameters['type'] = parameters['type']
  }
  if (parameters['parent'] !== undefined) {
    queryParameters['parent'] = parameters['parent']
  }
  if (parameters['group'] !== undefined) {
    queryParameters['group'] = parameters['group']
  }
  if (parameters['maxhits'] !== undefined) {
    queryParameters['maxhits'] = parameters['maxhits']
  }
  if (parameters['offset'] !== undefined) {
    queryParameters['offset'] = parameters['offset']
  }
  if (parameters['fields'] !== undefined) {
    queryParameters['fields'] = parameters['fields']
  }
  if (parameters['unique'] !== undefined) {
    queryParameters['unique'] = parameters['unique']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getSearch_RAW_URL = function() {
  return '/search'
}
export const getSearch_TYPE = function() {
  return 'get'
}
export const getSearchURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/search'
  if (parameters['query'] !== undefined) {
    queryParameters['query'] = parameters['query']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters['labellang'] !== undefined) {
    queryParameters['labellang'] = parameters['labellang']
  }
  if (parameters['vocab'] !== undefined) {
    queryParameters['vocab'] = parameters['vocab']
  }
  if (parameters['type'] !== undefined) {
    queryParameters['type'] = parameters['type']
  }
  if (parameters['parent'] !== undefined) {
    queryParameters['parent'] = parameters['parent']
  }
  if (parameters['group'] !== undefined) {
    queryParameters['group'] = parameters['group']
  }
  if (parameters['maxhits'] !== undefined) {
    queryParameters['maxhits'] = parameters['maxhits']
  }
  if (parameters['offset'] !== undefined) {
    queryParameters['offset'] = parameters['offset']
  }
  if (parameters['fields'] !== undefined) {
    queryParameters['fields'] = parameters['fields']
  }
  if (parameters['unique'] !== undefined) {
    queryParameters['unique'] = parameters['unique']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * RDF data of the requested concept
 * request: getData
 * url: getDataURL
 * method: getData_TYPE
 * raw_url: getData_RAW_URL
 * @param uri - URI of the concept whose data to return
 * @param format - the MIME type of the serialization format, e.g. "text/turtle" or "application/rdf+xml"
 */
export const getData = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/data'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['format'] !== undefined) {
    queryParameters['format'] = parameters['format']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getData_RAW_URL = function() {
  return '/data'
}
export const getData_TYPE = function() {
  return 'get'
}
export const getDataURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/data'
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['format'] !== undefined) {
    queryParameters['format'] = parameters['format']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Information about the types (classes) of objects contained in all  vocabularies
 * request: getTypes
 * url: getTypesURL
 * method: getTypes_TYPE
 * raw_url: getTypes_RAW_URL
 * @param lang - language of labels, e.g. "en" or "fi"
 */
export const getTypes = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/types'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters['lang'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: lang'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getTypes_RAW_URL = function() {
  return '/types'
}
export const getTypes_TYPE = function() {
  return 'get'
}
export const getTypesURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/types'
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * General information about the vocabulary
 * request: getByVocid
 * url: getByVocidURL
 * method: getByVocid_TYPE
 * raw_url: getByVocid_RAW_URL
 * @param vocid - The Skosmos vocabulary id e.g. stw or yso
 * @param lang - language of labels, e.g. "en" or "fi"
 */
export const getByVocid = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocid_RAW_URL = function() {
  return '/{vocid}/'
}
export const getByVocid_TYPE = function() {
  return 'get'
}
export const getByVocidURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Information about the types (classes) of objects in the vocabulary
 * request: getByVocidTypes
 * url: getByVocidTypesURL
 * method: getByVocidTypes_TYPE
 * raw_url: getByVocidTypes_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param lang - language of labels, e.g. "en" or "fi"
 */
export const getByVocidTypes = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/types'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidTypes_RAW_URL = function() {
  return '/{vocid}/types'
}
export const getByVocidTypes_TYPE = function() {
  return 'get'
}
export const getByVocidTypesURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/types'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Top concepts of the vocabulary
 * request: getByVocidTopConcepts
 * url: getByVocidTopConceptsURL
 * method: getByVocidTopConcepts_TYPE
 * raw_url: getByVocidTopConcepts_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param lang - language of labels, e.g. "en" or "fi"
 * @param scheme - concept scheme whose top concepts to return. If not given, the default concept scheme of the vocabulary will be used.
 */
export const getByVocidTopConcepts = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/topConcepts'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters['scheme'] !== undefined) {
    queryParameters['scheme'] = parameters['scheme']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidTopConcepts_RAW_URL = function() {
  return '/{vocid}/topConcepts'
}
export const getByVocidTopConcepts_TYPE = function() {
  return 'get'
}
export const getByVocidTopConceptsURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/topConcepts'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters['scheme'] !== undefined) {
    queryParameters['scheme'] = parameters['scheme']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * RDF data of the whole vocabulary or a specific concept
 * request: getByVocidData
 * url: getByVocidDataURL
 * method: getByVocidData_TYPE
 * raw_url: getByVocidData_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param format - The MIME type of the serialization format, e.g "text/turtle" or "application/rdf+xml". If not specified, HTTP content negotiation (based on the Accept header) is used to determine a suitable serialization format from among the available ones.
 * @param uri - URI of the desired concept. When no uri parameter is given, the whole vocabulary is returned instead.
 */
export const getByVocidData = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/data'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['format'] !== undefined) {
    queryParameters['format'] = parameters['format']
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidData_RAW_URL = function() {
  return '/{vocid}/data'
}
export const getByVocidData_TYPE = function() {
  return 'get'
}
export const getByVocidDataURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/data'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['format'] !== undefined) {
    queryParameters['format'] = parameters['format']
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns a list of search results. The search is performed as a case-insensitive pattern, where an asterisk (*) may be used as wildcard. E.g. "cat*" may return results such as "CATCH-22" and "categorization". If decoded into RDF, the result is a vocabulary fragment expressed as SKOS.
 * request: getByVocidSearch
 * url: getByVocidSearchURL
 * method: getByVocidSearch_TYPE
 * raw_url: getByVocidSearch_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param query - the term to search for e.g. "cat*"
 * @param lang - language of labels to match, e.g. "en" or "fi"
 * @param type - limit search to concepts of the given type, e.g. "skos:Concept"; multiple types can be specified as a space-separated list
 * @param parent - limit search to concepts which have the given concept (specified by URI) as parent in their transitive broader hierarchy
 * @param group - limit search to concepts in the given group (specified by URI)
 * @param maxhits - Maximum number of results to return. If not given, maxhits will default to 100. (default settable in config.inc)
 * @param offset - offset where to start in ther esult set, useful for paging the result. If not given, defaults to 0.
 * @param fields - space-separated list of extra fields to include in the results. e.g. "related" or "prefLabel" or any other skos property.
 * @param unique - boolean flag to indicate that each concept should be returned only once, instead of returning all the different ways it could match (for example both via prefLabel and altLabel).
 */
export const getByVocidSearch = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/search'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['query'] !== undefined) {
    queryParameters['query'] = parameters['query']
  }
  if (parameters['query'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: query'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters['type'] !== undefined) {
    queryParameters['type'] = parameters['type']
  }
  if (parameters['parent'] !== undefined) {
    queryParameters['parent'] = parameters['parent']
  }
  if (parameters['group'] !== undefined) {
    queryParameters['group'] = parameters['group']
  }
  if (parameters['maxhits'] !== undefined) {
    queryParameters['maxhits'] = parameters['maxhits']
  }
  if (parameters['offset'] !== undefined) {
    queryParameters['offset'] = parameters['offset']
  }
  if (parameters['fields'] !== undefined) {
    queryParameters['fields'] = parameters['fields']
  }
  if (parameters['unique'] !== undefined) {
    queryParameters['unique'] = parameters['unique']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidSearch_RAW_URL = function() {
  return '/{vocid}/search'
}
export const getByVocidSearch_TYPE = function() {
  return 'get'
}
export const getByVocidSearchURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/search'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['query'] !== undefined) {
    queryParameters['query'] = parameters['query']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters['type'] !== undefined) {
    queryParameters['type'] = parameters['type']
  }
  if (parameters['parent'] !== undefined) {
    queryParameters['parent'] = parameters['parent']
  }
  if (parameters['group'] !== undefined) {
    queryParameters['group'] = parameters['group']
  }
  if (parameters['maxhits'] !== undefined) {
    queryParameters['maxhits'] = parameters['maxhits']
  }
  if (parameters['offset'] !== undefined) {
    queryParameters['offset'] = parameters['offset']
  }
  if (parameters['fields'] !== undefined) {
    queryParameters['fields'] = parameters['fields']
  }
  if (parameters['unique'] !== undefined) {
    queryParameters['unique'] = parameters['unique']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns the best matching concept(s) for the given label in JSON-LD format. In case the label matches several concepts with the same precedence, all of them are returned.
 * request: getByVocidLookup
 * url: getByVocidLookupURL
 * method: getByVocidLookup_TYPE
 * raw_url: getByVocidLookup_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param label - the label to look for, e.g. "cat" or "dog"
 * @param lang - search language, e.g. "en" or "fi"
 */
export const getByVocidLookup = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/lookup'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['label'] !== undefined) {
    queryParameters['label'] = parameters['label']
  }
  if (parameters['label'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: label'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidLookup_RAW_URL = function() {
  return '/{vocid}/lookup'
}
export const getByVocidLookup_TYPE = function() {
  return 'get'
}
export const getByVocidLookupURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/lookup'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['label'] !== undefined) {
    queryParameters['label'] = parameters['label']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Number of Concepts and Collections in the vocabulary
 * request: getByVocidVocabularyStatistics
 * url: getByVocidVocabularyStatisticsURL
 * method: getByVocidVocabularyStatistics_TYPE
 * raw_url: getByVocidVocabularyStatistics_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param lang - language of labels, e.g. "en" or "fi"
 */
export const getByVocidVocabularyStatistics = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/vocabularyStatistics'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidVocabularyStatistics_RAW_URL = function() {
  return '/{vocid}/vocabularyStatistics'
}
export const getByVocidVocabularyStatistics_TYPE = function() {
  return 'get'
}
export const getByVocidVocabularyStatisticsURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/vocabularyStatistics'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns a list of label (skos:prefLabel, skos:altLabel and skos:hiddenLabel) counts in all the different languages.
 * request: getByVocidLabelStatistics
 * url: getByVocidLabelStatisticsURL
 * method: getByVocidLabelStatistics_TYPE
 * raw_url: getByVocidLabelStatistics_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param lang - language of labels, e.g. "en" or "fi"
 */
export const getByVocidLabelStatistics = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/labelStatistics'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidLabelStatistics_RAW_URL = function() {
  return '/{vocid}/labelStatistics'
}
export const getByVocidLabelStatistics_TYPE = function() {
  return 'get'
}
export const getByVocidLabelStatisticsURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/labelStatistics'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Preferred label for the requested concept
 * request: getByVocidLabel
 * url: getByVocidLabelURL
 * method: getByVocidLabel_TYPE
 * raw_url: getByVocidLabel_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param uri - URI of the concept whose label to return
 * @param lang - search language, e.g. "en" or "fi"
 */
export const getByVocidLabel = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/label'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidLabel_RAW_URL = function() {
  return '/{vocid}/label'
}
export const getByVocidLabel_TYPE = function() {
  return 'get'
}
export const getByVocidLabelURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/label'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Broader concepts of the requested concept
 * request: getByVocidBroader
 * url: getByVocidBroaderURL
 * method: getByVocidBroader_TYPE
 * raw_url: getByVocidBroader_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param uri - URI of the concept whose broader concept to return
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidBroader = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/broader'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidBroader_RAW_URL = function() {
  return '/{vocid}/broader'
}
export const getByVocidBroader_TYPE = function() {
  return 'get'
}
export const getByVocidBroaderURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/broader'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Broader transitive hierarchy for the requested concept
 * request: getByVocidBroaderTransitive
 * url: getByVocidBroaderTransitiveURL
 * method: getByVocidBroaderTransitive_TYPE
 * raw_url: getByVocidBroaderTransitive_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param uri - URI of the concept whose broader transitive hierarchy to return
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidBroaderTransitive = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/broaderTransitive'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidBroaderTransitive_RAW_URL = function() {
  return '/{vocid}/broaderTransitive'
}
export const getByVocidBroaderTransitive_TYPE = function() {
  return 'get'
}
export const getByVocidBroaderTransitiveURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/broaderTransitive'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Narrower concepts of the requested concept
 * request: getByVocidNarrower
 * url: getByVocidNarrowerURL
 * method: getByVocidNarrower_TYPE
 * raw_url: getByVocidNarrower_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param uri - URI of the concept whose narrower concept to return
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidNarrower = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/narrower'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidNarrower_RAW_URL = function() {
  return '/{vocid}/narrower'
}
export const getByVocidNarrower_TYPE = function() {
  return 'get'
}
export const getByVocidNarrowerURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/narrower'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Narrower transitive hierarchy for the requested concept
 * request: getByVocidNarrowerTransitive
 * url: getByVocidNarrowerTransitiveURL
 * method: getByVocidNarrowerTransitive_TYPE
 * raw_url: getByVocidNarrowerTransitive_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param uri - URI of the concept whose narrower transitive hierarchy to return
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidNarrowerTransitive = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/narrowerTransitive'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidNarrowerTransitive_RAW_URL = function() {
  return '/{vocid}/narrowerTransitive'
}
export const getByVocidNarrowerTransitive_TYPE = function() {
  return 'get'
}
export const getByVocidNarrowerTransitiveURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/narrowerTransitive'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Related concepts of the requested concept
 * request: getByVocidRelated
 * url: getByVocidRelatedURL
 * method: getByVocidRelated_TYPE
 * raw_url: getByVocidRelated_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param uri - URI of the concept whose related concept to return
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidRelated = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/related'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidRelated_RAW_URL = function() {
  return '/{vocid}/related'
}
export const getByVocidRelated_TYPE = function() {
  return 'get'
}
export const getByVocidRelatedURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/related'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Narrower concepts of the requested concept
 * request: getByVocidChildren
 * url: getByVocidChildrenURL
 * method: getByVocidChildren_TYPE
 * raw_url: getByVocidChildren_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param uri - URI of the concept whose narrower concepts to return
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidChildren = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/children'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidChildren_RAW_URL = function() {
  return '/{vocid}/children'
}
export const getByVocidChildren_TYPE = function() {
  return 'get'
}
export const getByVocidChildrenURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/children'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Concept groups in the vocabulary
 * request: getByVocidGroups
 * url: getByVocidGroupsURL
 * method: getByVocidGroups_TYPE
 * raw_url: getByVocidGroups_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidGroups = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/groups'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidGroups_RAW_URL = function() {
  return '/{vocid}/groups'
}
export const getByVocidGroups_TYPE = function() {
  return 'get'
}
export const getByVocidGroupsURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/groups'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Members of the requested concept group
 * request: getByVocidGroupMembers
 * url: getByVocidGroupMembersURL
 * method: getByVocidGroupMembers_TYPE
 * raw_url: getByVocidGroupMembers_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidGroupMembers = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/groupMembers'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidGroupMembers_RAW_URL = function() {
  return '/{vocid}/groupMembers'
}
export const getByVocidGroupMembers_TYPE = function() {
  return 'get'
}
export const getByVocidGroupMembersURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/groupMembers'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Hierarchical context of the requested concept
 * request: getByVocidHierarchy
 * url: getByVocidHierarchyURL
 * method: getByVocidHierarchy_TYPE
 * raw_url: getByVocidHierarchy_RAW_URL
 * @param vocid - a Skosmos vocabulary identifier e.g. "stw" or "yso"
 * @param uri - URI of the concept whose hierarchical context to return
 * @param lang - label language, e.g. "en" or "fi"
 */
export const getByVocidHierarchy = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/{vocid}/hierarchy'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['vocid'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: vocid'))
  }
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['uri'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: uri'))
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const getByVocidHierarchy_RAW_URL = function() {
  return '/{vocid}/hierarchy'
}
export const getByVocidHierarchy_TYPE = function() {
  return 'get'
}
export const getByVocidHierarchyURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/{vocid}/hierarchy'
  path = path.replace('{vocid}', `${parameters['vocid']}`)
  if (parameters['uri'] !== undefined) {
    queryParameters['uri'] = parameters['uri']
  }
  if (parameters['lang'] !== undefined) {
    queryParameters['lang'] = parameters['lang']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}