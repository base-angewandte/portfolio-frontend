/* eslint-disable */
import axios from 'axios'
import qs from 'qs'
let domain = 'https://basedev.uni-ak.ac.at/portfolio'
let axiosInstance = axios.create();
export const getDomain = () => {
  return domain
}
export const setDomain = ($domain) => {
  domain = $domain
}
export const getAxiosInstance = () => {
  return axiosInstance
}
export const setAxiosInstance = ($axiosInstance) => {
  axiosInstance = $axiosInstance
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
    return axiosInstance[method](queryUrl, body, config)
  } else if (method === 'get' || method === 'delete' || method === 'head' || method === 'option') {
    return axiosInstance[method](queryUrl, config)
  } else {
    return axiosInstance[method](queryUrl, qs.stringify(form), config)
  }
}
/*==========================================================
 *
 ==========================================================*/
/**
 * Returns a list of all entities for current user.
 * request: api_v1_entity_list
 * url: api_v1_entity_listURL
 * method: api_v1_entity_list_TYPE
 * raw_url: api_v1_entity_list_RAW_URL
 * @param type -
 * @param sort - Which field to use when ordering the results.
 * @param limit - Number of results to return per page.
 * @param offset - The initial index from which to return the results.
 */
export const api_v1_entry_list = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/entry/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['type'] !== undefined) {
    queryParameters['type'] = parameters['type']
  }
  if (parameters['sort'] !== undefined) {
    queryParameters['sort'] = parameters['sort']
  }
  if (parameters['limit'] !== undefined) {
    queryParameters['limit'] = parameters['limit']
  }
  if (parameters['offset'] !== undefined) {
    queryParameters['offset'] = parameters['offset']
  }
  if (parameters['q'] !== undefined) {
    queryParameters['q'] = parameters['q']
  }
  if (parameters['link_selection_for'] !== undefined) {
    queryParameters['link_selection_for'] = parameters['link_selection_for']
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_entry_list_RAW_URL = function() {
  return '/api/v1/entry/'
}
export const api_v1_entry_list_TYPE = function() {
  return 'get'
}
export const api_v1_entry_listURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/entry/'
  if (parameters['type'] !== undefined) {
    queryParameters['type'] = parameters['type']
  }
  if (parameters['sort'] !== undefined) {
    queryParameters['sort'] = parameters['sort']
  }
  if (parameters['limit'] !== undefined) {
    queryParameters['limit'] = parameters['limit']
  }
  if (parameters['offset'] !== undefined) {
    queryParameters['offset'] = parameters['offset']
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
 * Create a new instance of entity for current user.
 * request: api_v1_entity_create
 * url: api_v1_entity_createURL
 * method: api_v1_entity_create_TYPE
 * raw_url: api_v1_entity_create_RAW_URL
 * @param data -
 */
export const api_v1_entry_create = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/entry/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['data'] !== undefined) {
    body = parameters['data']
  }
  if (parameters['data'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: data'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('post', domain + path, body, queryParameters, form, config)
}
export const api_v1_entry_create_RAW_URL = function() {
  return '/api/v1/entry/'
}
export const api_v1_entry_create_TYPE = function() {
  return 'post'
}
export const api_v1_entry_createURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/entry/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns the number of documents of type entity.
 * request: api_v1_entity_count
 * url: api_v1_entity_countURL
 * method: api_v1_entity_count_TYPE
 * raw_url: api_v1_entity_count_RAW_URL
 */
export const api_v1_entry_count = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/entry/count/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_entry_count_RAW_URL = function() {
  return '/api/v1/entry/count/'
}
export const api_v1_entry_count_TYPE = function() {
  return 'get'
}
export const api_v1_entry_countURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/entry/count/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns a certain entity.
 * request: api_v1_entity_read
 * url: api_v1_entity_readURL
 * method: api_v1_entity_read_TYPE
 * raw_url: api_v1_entity_read_RAW_URL
 * @param id -
 */
export const api_v1_entry_read = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/entry/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_entry_read_RAW_URL = function() {
  return '/api/v1/entry/{id}/'
}
export const api_v1_entry_read_TYPE = function() {
  return 'get'
}
export const api_v1_entry_readURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/entry/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Update a certain entity.
 * request: api_v1_entity_update
 * url: api_v1_entity_updateURL
 * method: api_v1_entity_update_TYPE
 * raw_url: api_v1_entity_update_RAW_URL
 * @param data -
 * @param id -
 */
export const api_v1_entry_update = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/entry/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['data'] !== undefined) {
    body = parameters['data']
  }
  if (parameters['data'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: data'))
  }
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('put', domain + path, body, queryParameters, form, config)
}
export const api_v1_entry_update_RAW_URL = function() {
  return '/api/v1/entry/{id}/'
}
export const api_v1_entry_update_TYPE = function() {
  return 'put'
}
export const api_v1_entry_updateURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/entry/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Partially update a certain entity.
 * request: api_v1_entity_partial_update
 * url: api_v1_entity_partial_updateURL
 * method: api_v1_entity_partial_update_TYPE
 * raw_url: api_v1_entity_partial_update_RAW_URL
 * @param data -
 * @param id -
 */
export const api_v1_entry_partial_update = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/entry/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['data'] !== undefined) {
    body = parameters['data']
  }
  if (parameters['data'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: data'))
  }
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('patch', domain + path, body, queryParameters, form, config)
}
export const api_v1_entry_partial_update_RAW_URL = function() {
  return '/api/v1/entry/{id}/'
}
export const api_v1_entry_partial_update_TYPE = function() {
  return 'patch'
}
export const api_v1_entry_partial_updateURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/entry/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Delete a certain entity.
 * request: api_v1_entity_delete
 * url: api_v1_entity_deleteURL
 * method: api_v1_entity_delete_TYPE
 * raw_url: api_v1_entity_delete_RAW_URL
 * @param id -
 */
export const api_v1_entry_delete = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/entry/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('delete', domain + path, body, queryParameters, form, config)
}
export const api_v1_entry_delete_RAW_URL = function() {
  return '/api/v1/entry/{id}/'
}
export const api_v1_entry_delete_TYPE = function() {
  return 'delete'
}
export const api_v1_entry_deleteURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/entry/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Return list of media objects.
 * request: api_v1_entity_media
 * url: api_v1_entity_mediaURL
 * method: api_v1_entity_media_TYPE
 * raw_url: api_v1_entity_media_RAW_URL
 * @param id -
 */
export const api_v1_entry_media = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/entry/{id}/media/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_entry_media_RAW_URL = function() {
  return '/api/v1/entry/{id}/media/'
}
export const api_v1_entry_media_TYPE = function() {
  return 'get'
}
export const api_v1_entry_mediaURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/entry/{id}/media/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns a list of all available JSONSchemas.
 * request: api_v1_jsonschema_list
 * url: api_v1_jsonschema_listURL
 * method: api_v1_jsonschema_list_TYPE
 * raw_url: api_v1_jsonschema_list_RAW_URL
 */
export const api_v1_jsonschema_list = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/jsonschema/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_jsonschema_list_RAW_URL = function() {
  return '/api/v1/jsonschema/'
}
export const api_v1_jsonschema_list_TYPE = function() {
  return 'get'
}
export const api_v1_jsonschema_listURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/jsonschema/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns a certain JSONSchema.
 * request: api_v1_jsonschema_read
 * url: api_v1_jsonschema_readURL
 * method: api_v1_jsonschema_read_TYPE
 * raw_url: api_v1_jsonschema_read_RAW_URL
 * @param id -
 */
export const api_v1_jsonschema_read = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/jsonschema/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_jsonschema_read_RAW_URL = function() {
  return '/api/v1/jsonschema/{id}/'
}
export const api_v1_jsonschema_read_TYPE = function() {
  return 'get'
}
export const api_v1_jsonschema_readURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/jsonschema/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 *
 * request: api_v1_media_create
 * url: api_v1_media_createURL
 * method: api_v1_media_create_TYPE
 * raw_url: api_v1_media_create_RAW_URL
 * @param file -
 * @param entity -
 */
export const api_v1_media_create = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/media/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['file'] !== undefined) {
    form['file'] = parameters['file']
  }
  if (parameters['file'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: file'))
  }
  if (parameters['entry'] !== undefined) {
    form['entry'] = parameters['entry']
  }
  if (parameters['entry'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: entry'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('post', domain + path, body, queryParameters, form, config)
}
export const api_v1_media_create_RAW_URL = function() {
  return '/api/v1/media/'
}
export const api_v1_media_create_TYPE = function() {
  return 'post'
}
export const api_v1_media_createURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/media/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 *
 * request: api_v1_media_read
 * url: api_v1_media_readURL
 * method: api_v1_media_read_TYPE
 * raw_url: api_v1_media_read_RAW_URL
 * @param id -
 */
export const api_v1_media_read = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/media/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_media_read_RAW_URL = function() {
  return '/api/v1/media/{id}/'
}
export const api_v1_media_read_TYPE = function() {
  return 'get'
}
export const api_v1_media_readURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/media/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns a list of all relations for current user.
 * request: api_v1_relation_list
 * url: api_v1_relation_listURL
 * method: api_v1_relation_list_TYPE
 * raw_url: api_v1_relation_list_RAW_URL
 */
export const api_v1_relation_list = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/relation/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_relation_list_RAW_URL = function() {
  return '/api/v1/relation/'
}
export const api_v1_relation_list_TYPE = function() {
  return 'get'
}
export const api_v1_relation_listURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/relation/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Create a new relation between entities.
 * request: api_v1_relation_create
 * url: api_v1_relation_createURL
 * method: api_v1_relation_create_TYPE
 * raw_url: api_v1_relation_create_RAW_URL
 * @param data -
 */
export const api_v1_relation_create = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/relation/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['data'] !== undefined) {
    body = parameters['data']
  }
  if (parameters['data'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: data'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('post', domain + path, body, queryParameters, form, config)
}
export const api_v1_relation_create_RAW_URL = function() {
  return '/api/v1/relation/'
}
export const api_v1_relation_create_TYPE = function() {
  return 'post'
}
export const api_v1_relation_createURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/relation/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns the number of documents of type relation.
 * request: api_v1_relation_count
 * url: api_v1_relation_countURL
 * method: api_v1_relation_count_TYPE
 * raw_url: api_v1_relation_count_RAW_URL
 */
export const api_v1_relation_count = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/relation/count/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_relation_count_RAW_URL = function() {
  return '/api/v1/relation/count/'
}
export const api_v1_relation_count_TYPE = function() {
  return 'get'
}
export const api_v1_relation_countURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/relation/count/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Returns a certain relation.
 * request: api_v1_relation_read
 * url: api_v1_relation_readURL
 * method: api_v1_relation_read_TYPE
 * raw_url: api_v1_relation_read_RAW_URL
 * @param id -
 */
export const api_v1_relation_read = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/relation/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_relation_read_RAW_URL = function() {
  return '/api/v1/relation/{id}/'
}
export const api_v1_relation_read_TYPE = function() {
  return 'get'
}
export const api_v1_relation_readURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/relation/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Update a certain relation.
 * request: api_v1_relation_update
 * url: api_v1_relation_updateURL
 * method: api_v1_relation_update_TYPE
 * raw_url: api_v1_relation_update_RAW_URL
 * @param data -
 * @param id -
 */
export const api_v1_relation_update = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/relation/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['data'] !== undefined) {
    body = parameters['data']
  }
  if (parameters['data'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: data'))
  }
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('put', domain + path, body, queryParameters, form, config)
}
export const api_v1_relation_update_RAW_URL = function() {
  return '/api/v1/relation/{id}/'
}
export const api_v1_relation_update_TYPE = function() {
  return 'put'
}
export const api_v1_relation_updateURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/relation/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Partially update a certain relation.
 * request: api_v1_relation_partial_update
 * url: api_v1_relation_partial_updateURL
 * method: api_v1_relation_partial_update_TYPE
 * raw_url: api_v1_relation_partial_update_RAW_URL
 * @param data -
 * @param id -
 */
export const api_v1_relation_partial_update = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/relation/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters['data'] !== undefined) {
    body = parameters['data']
  }
  if (parameters['data'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: data'))
  }
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('patch', domain + path, body, queryParameters, form, config)
}
export const api_v1_relation_partial_update_RAW_URL = function() {
  return '/api/v1/relation/{id}/'
}
export const api_v1_relation_partial_update_TYPE = function() {
  return 'patch'
}
export const api_v1_relation_partial_updateURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/relation/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 * Delete a certain relation.
 * request: api_v1_relation_delete
 * url: api_v1_relation_deleteURL
 * method: api_v1_relation_delete_TYPE
 * raw_url: api_v1_relation_delete_RAW_URL
 * @param id -
 */
export const api_v1_relation_delete = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/relation/{id}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters['id'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: id'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('delete', domain + path, body, queryParameters, form, config)
}
export const api_v1_relation_delete_RAW_URL = function() {
  return '/api/v1/relation/{id}/'
}
export const api_v1_relation_delete_TYPE = function() {
  return 'delete'
}
export const api_v1_relation_deleteURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/relation/{id}/'
  path = path.replace('{id}', `${parameters['id']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 *
 * request: api_v1_user_read
 * url: api_v1_user_readURL
 * method: api_v1_user_read_TYPE
 * raw_url: api_v1_user_read_RAW_URL
 */
export const api_v1_user_read = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/api/v1/user/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const api_v1_user_read_RAW_URL = function() {
  return '/api/v1/user/'
}
export const api_v1_user_read_TYPE = function() {
  return 'get'
}
export const api_v1_user_readURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/api/v1/user/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 *
 * request: autosuggest_v1_person_list
 * url: autosuggest_v1_person_listURL
 * method: autosuggest_v1_person_list_TYPE
 * raw_url: autosuggest_v1_person_list_RAW_URL
 */
export const autosuggest_v1_person_list = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/autosuggest/v1/person/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const autosuggest_v1_person_list_RAW_URL = function() {
  return '/autosuggest/v1/person/'
}
export const autosuggest_v1_person_list_TYPE = function() {
  return 'get'
}
export const autosuggest_v1_person_listURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/autosuggest/v1/person/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 *
 * request: autosuggest_v1_person_read
 * url: autosuggest_v1_person_readURL
 * method: autosuggest_v1_person_read_TYPE
 * raw_url: autosuggest_v1_person_read_RAW_URL
 * @param searchstr -
 */
export const autosuggest_v1_person_read = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/autosuggest/v1/person/{searchstr}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{searchstr}', `${parameters['searchstr']}`)
  if (parameters['searchstr'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: searchstr'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const autosuggest_v1_person_read_RAW_URL = function() {
  return '/autosuggest/v1/person/{searchstr}/'
}
export const autosuggest_v1_person_read_TYPE = function() {
  return 'get'
}
export const autosuggest_v1_person_readURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/autosuggest/v1/person/{searchstr}/'
  path = path.replace('{searchstr}', `${parameters['searchstr']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 *
 * request: autosuggest_v1_place_list
 * url: autosuggest_v1_place_listURL
 * method: autosuggest_v1_place_list_TYPE
 * raw_url: autosuggest_v1_place_list_RAW_URL
 */
export const autosuggest_v1_place_list = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/autosuggest/v1/place/'
  let body
  let queryParameters = {}
  let form = {}
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const autosuggest_v1_place_list_RAW_URL = function() {
  return '/autosuggest/v1/place/'
}
export const autosuggest_v1_place_list_TYPE = function() {
  return 'get'
}
export const autosuggest_v1_place_listURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/autosuggest/v1/place/'
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
/**
 *
 * request: autosuggest_v1_place_read
 * url: autosuggest_v1_place_readURL
 * method: autosuggest_v1_place_read_TYPE
 * raw_url: autosuggest_v1_place_read_RAW_URL
 * @param searchstr -
 */
export const autosuggest_v1_place_read = function(parameters = {}) {
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  const config = parameters.$config
  let path = '/autosuggest/v1/place/{searchstr}/'
  let body
  let queryParameters = {}
  let form = {}
  path = path.replace('{searchstr}', `${parameters['searchstr']}`)
  if (parameters['searchstr'] === undefined) {
    return Promise.reject(new Error('Missing required  parameter: searchstr'))
  }
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    });
  }
  return request('get', domain + path, body, queryParameters, form, config)
}
export const autosuggest_v1_place_read_RAW_URL = function() {
  return '/autosuggest/v1/place/{searchstr}/'
}
export const autosuggest_v1_place_read_TYPE = function() {
  return 'get'
}
export const autosuggest_v1_place_readURL = function(parameters = {}) {
  let queryParameters = {}
  const domain = parameters.$domain ? parameters.$domain : getDomain()
  let path = '/autosuggest/v1/place/{searchstr}/'
  path = path.replace('{searchstr}', `${parameters['searchstr']}`)
  if (parameters.$queryParameters) {
    Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
      queryParameters[parameterName] = parameters.$queryParameters[parameterName]
    })
  }
  let keys = Object.keys(queryParameters)
  return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
}
