# APIKeysApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiKeyControllerCreate**](#apikeycontrollercreate) | **POST** /api/api-keys | Create a new API Key for the current user|
|[**apiKeyControllerFindAll**](#apikeycontrollerfindall) | **GET** /api/api-keys | List all API Keys for the current user|
|[**apiKeyControllerFindOne**](#apikeycontrollerfindone) | **GET** /api/api-keys/{id} | Get a specific API Key for the current user|
|[**apiKeyControllerRemove**](#apikeycontrollerremove) | **DELETE** /api/api-keys/{id} | Revoke an API Key for the current user|
|[**apiKeyControllerUpdate**](#apikeycontrollerupdate) | **PATCH** /api/api-keys/{id} | Update an API Key for the current user|

# **apiKeyControllerCreate**
> apiKeyControllerCreate(createApiKeyDto)


### Example

```typescript
import {
    APIKeysApi,
    Configuration,
    CreateApiKeyDto
} from './api';

const configuration = new Configuration();
const apiInstance = new APIKeysApi(configuration);

let createApiKeyDto: CreateApiKeyDto; //

const { status, data } = await apiInstance.apiKeyControllerCreate(
    createApiKeyDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createApiKeyDto** | **CreateApiKeyDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiKeyControllerFindAll**
> apiKeyControllerFindAll()


### Example

```typescript
import {
    APIKeysApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIKeysApi(configuration);

const { status, data } = await apiInstance.apiKeyControllerFindAll();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiKeyControllerFindOne**
> apiKeyControllerFindOne()


### Example

```typescript
import {
    APIKeysApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIKeysApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiKeyControllerFindOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiKeyControllerRemove**
> apiKeyControllerRemove()


### Example

```typescript
import {
    APIKeysApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new APIKeysApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.apiKeyControllerRemove(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiKeyControllerUpdate**
> apiKeyControllerUpdate(updateApiKeyDto)


### Example

```typescript
import {
    APIKeysApi,
    Configuration,
    UpdateApiKeyDto
} from './api';

const configuration = new Configuration();
const apiInstance = new APIKeysApi(configuration);

let id: string; // (default to undefined)
let updateApiKeyDto: UpdateApiKeyDto; //

const { status, data } = await apiInstance.apiKeyControllerUpdate(
    id,
    updateApiKeyDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateApiKeyDto** | **UpdateApiKeyDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

