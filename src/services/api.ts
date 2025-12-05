import axios from 'axios';
import { showErrorToast } from '@/utils/toastUtils'; // Importar la utilidad
// Importar todo lo exportado por el cliente generado
import * as generated from './generated';
// Eliminar esta importación, apiClient se define abajo
// import { apiClient } from '../axiosClient';
import { PromptAssetData } from '@/components/tables/PromptAssetsTable';
// Eliminar la importación anterior si existe:
// import { PromptVersionData } from '@/app/(admin)/projects/[projectId]/prompts/[promptId]/versions/page.tsx';

// --- Configuración Global de Axios ---

const AUTH_TOKEN_KEY = 'authToken';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'; // Usar /api como fallback

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de Request: Añade token de autenticación
apiClient.interceptors.request.use(
    (config: any) => {
        // Solo log en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('Request interceptor: Adding auth token');
        }

        if (typeof window !== 'undefined') {
            let token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                token = sessionStorage.getItem(AUTH_TOKEN_KEY);
                if (token && process.env.NODE_ENV === 'development') {
                    console.log('Token found in sessionStorage');
                }
            } else if (process.env.NODE_ENV === 'development') {
                console.log('Token found in localStorage');
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                if (process.env.NODE_ENV === 'development') {
                    console.log('Authorization header set:', config.headers.Authorization);
                }
            } else if (process.env.NODE_ENV === 'development') {
                console.log('No token found in storage');
            }
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

// Interceptor de Response: Manejo global de errores
apiClient.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Response interceptor error:', error.response?.status, error.response?.data);
        }

        const errorMessage = error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
            ? String(error.response.data.message)
            : error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data
                ? String(error.response.data.error)
                : error.message;

        if (error.response?.status === 401) {
            console.error('API Error: Unauthorized (401).');
            if (typeof window !== 'undefined') {
                localStorage.removeItem(AUTH_TOKEN_KEY);
                sessionStorage.removeItem(AUTH_TOKEN_KEY);
            }
        } else if (error.response?.status === 403) {
            console.error('API Error: Forbidden (403).');
            showErrorToast(errorMessage || 'Forbidden: You do not have permission to access this resource.');
        } else {
            console.error('API call error:', errorMessage, error.response);
            showErrorToast(errorMessage || 'An unexpected API error occurred.');
        }
        return Promise.reject(error);
    }
);

// --- Instancias de Servicios API Generados ---
const generatedApiConfig = new generated.Configuration();

// Inicializar las APIs generadas
const llmExecutionApi = new generated.LLMExecutionApi(generatedApiConfig, undefined, apiClient);
const aiModelsApi = new generated.AIModelsProjectSpecificApi(generatedApiConfig, undefined, apiClient);
const promptsApi = new generated.PromptsApi(generatedApiConfig, undefined, apiClient);
const promptVersionsApi = new generated.PromptVersionsWithinProjectPromptApi(generatedApiConfig, undefined, apiClient);
const promptTranslationsApi = new generated.PromptTranslationsWithinProjectPromptVersionApi(generatedApiConfig, undefined, apiClient);
const systemPromptsApi = new generated.SystemPromptsApi(generatedApiConfig, undefined, apiClient);
const rawExecutionApi = new generated.RawExecutionApi(generatedApiConfig, undefined, apiClient);
const tagsApi = new generated.TagsApi(generatedApiConfig, undefined, apiClient);
const environmentsApi = new generated.EnvironmentsApi(generatedApiConfig, undefined, apiClient);
const promptAssetsApi = new generated.PromptAssetsForASpecificPromptApi(generatedApiConfig, undefined, apiClient);
const promptAssetVersionsApi = new generated.PromptAssetVersionsApi(generatedApiConfig, undefined, apiClient);
// export const apiKeysApi = new generated.ApiKeysApi(generatedApiConfig, undefined, apiClient); HACK: Manually implemented due to generator issues

// --- Servicios Manuales (Wrapper sobre los generados o lógica personalizada) ---

// --- AI Model Service ---
export const aiModelService = {
    /**
     * Fetches the available Langchain provider types.
     * Uses a manual API call due to issues with the generated client function
     * not correctly handling the projectId path parameter for this specific endpoint.
     */
    getProviderTypes: async (projectId: string): Promise<string[]> => {
        const response = await apiClient.get<string[]>(`/api/projects/${projectId}/aimodels/providers/types`);
        return response.data;
    },
    create: async (projectId: string, payload: generated.CreateAiModelDto): Promise<generated.AiModelResponseDto> => {
        const response = await apiClient.post<generated.AiModelResponseDto>(`/api/projects/${projectId}/aimodels`, payload);
        return response.data;
    },
    findAll: async (projectId: string): Promise<generated.AiModelResponseDto[]> => {
        const response = await apiClient.get<generated.AiModelResponseDto[]>(`/api/projects/${projectId}/aimodels`);
        return response.data;
    },
    findOne: async (projectId: string, aiModelId: string): Promise<generated.AiModelResponseDto> => {
        const response = await apiClient.get<generated.AiModelResponseDto>(`/api/projects/${projectId}/aimodels/${aiModelId}`);
        return response.data;
    },
    update: async (projectId: string, aiModelId: string, payload: generated.UpdateAiModelDto): Promise<generated.AiModelResponseDto> => {
        const response = await apiClient.patch<generated.AiModelResponseDto>(`/api/projects/${projectId}/aimodels/${aiModelId}`, payload);
        return response.data;
    },
    remove: async (projectId: string, aiModelId: string): Promise<generated.AiModelResponseDto> => {
        const response = await apiClient.delete<generated.AiModelResponseDto>(`/api/projects/${projectId}/aimodels/${aiModelId}`);
        return response.data;
    }
};

// Servicio de Autenticación (Mantener manual por ahora, o reemplazar con generated.AuthenticationApi)
export const authService = {
    register: async (payload: generated.RegisterDto): Promise<generated.UserProfileResponse> => {
        // Podrías reemplazar esto con:
        // const response = await authGeneratedApi.authControllerRegister(payload);
        // return response.data;
        const response = await apiClient.post<generated.UserProfileResponse>('/api/auth/register', payload);
        return response.data;
    },
    login: async (payload: generated.LoginDto, rememberMe: boolean = false): Promise<generated.LoginResponse> => {
        // Podrías reemplazar esto con:
        // const response = await authGeneratedApi.authControllerLogin(payload);
        const response = await apiClient.post<generated.LoginResponse>('/api/auth/login', payload);
        if (response.data.access_token && typeof window !== 'undefined') {
            if (rememberMe) {
                localStorage.setItem(AUTH_TOKEN_KEY, response.data.access_token);
                if (process.env.NODE_ENV === 'development') {
                    console.log('authService: Token stored in localStorage (rememberMe=true).');
                }
            } else {
                sessionStorage.setItem(AUTH_TOKEN_KEY, response.data.access_token);
                if (process.env.NODE_ENV === 'development') {
                    console.log('authService: Token stored in sessionStorage (rememberMe=false).');
                }
            }
        }
        return response.data;
    },
    getCurrentUserProfile: async (): Promise<generated.UserProfileResponse> => {
        // Podrías reemplazar esto con:
        // const response = await authGeneratedApi.authControllerGetProfile();
        const response = await apiClient.get<generated.UserProfileResponse>('/api/auth/profile');
        return response.data;
    },
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            sessionStorage.removeItem(AUTH_TOKEN_KEY);
            if (process.env.NODE_ENV === 'development') {
                console.log('authService: Token removed from localStorage and sessionStorage.');
            }
        }
    },
    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false;
        let token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) return true;
        token = sessionStorage.getItem(AUTH_TOKEN_KEY); // Check sessionStorage if not in localStorage
        return !!token;
    },
    setToken: (token: string, rememberMe: boolean = false) => {
        if (typeof window !== 'undefined') {
            if (rememberMe) {
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                if (process.env.NODE_ENV === 'development') {
                    console.log('authService: Token stored in localStorage (rememberMe=true).');
                }
            } else {
                sessionStorage.setItem(AUTH_TOKEN_KEY, token);
                if (process.env.NODE_ENV === 'development') {
                    console.log('authService: Token stored in sessionStorage (rememberMe=false).');
                }
            }
        }
    },
};

export interface UserResponseDto {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: string;
    tenantId?: string;
}

export const userService = {
    findAll: async (tenantId?: string): Promise<UserResponseDto[]> => {
        const params: { tenantId?: string } = {};
        if (tenantId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
            params.tenantId = tenantId;
        }
        const response = await apiClient.get<UserResponseDto[]>('/api/users', { params });
        return response.data;
    },
    findOne: async (id: string): Promise<UserResponseDto> => {
        const response = await apiClient.get<UserResponseDto>(`/api/users/${id}`);
        return response.data;
    },
    findByTenant: async (tenantId: string): Promise<UserResponseDto[]> => {
        if (tenantId !== 'default-tenant' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
            throw new Error('Invalid tenant ID format. Must be a valid UUID or "default-tenant".');
        }
        const response = await apiClient.get<UserResponseDto[]>('/api/users', {
            params: { tenantId }
        });
        return response.data;
    },
    create: async (payload: generated.CreateUserDto): Promise<UserResponseDto> => {
        const response = await apiClient.post<UserResponseDto>('/api/users', payload);
        return response.data;
    },
    update: async (id: string, payload: UpdateUserDto): Promise<UserResponseDto> => {
        const response = await apiClient.patch<UserResponseDto>(`/api/users/${id}`, payload);
        return response.data;
    },
    remove: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/users/${id}`);
    },
    checkInitialUser: async (): Promise<{ exists: boolean; userId: string }> => {
        const response = await apiClient.get<{ exists: boolean; userId: string }>('/api/auth/initial_setup_check');
        return response.data;
    },
    updateInitialUser: async (userId: string, payload: { email: string; password: string }): Promise<void> => {
        await apiClient.patch(`/api/users/${userId}`, payload);
    },
};

// Servicio de Proyectos (Mantener manual o reemplazar con generated.ProjectsApi)
export const projectService = {
    findAll: async (): Promise<generated.ProjectDto[]> => { // Usar ProjectDto
        // Reemplazar con: const response = await projectsGeneratedApi.projectControllerFindAll(); return response.data;
        const response = await apiClient.get<generated.ProjectDto[]>('/api/projects');
        return response.data;
    },
    findMine: async (): Promise<generated.ProjectDto[]> => { // Usar ProjectDto
        // Reemplazar con: const response = await projectsGeneratedApi.projectControllerFindMine(); return response.data;
        const response = await apiClient.get<generated.ProjectDto[]>('/api/projects/mine');
        return response.data;
    },
    findOne: async (id: string): Promise<generated.ProjectDto> => { // Usar ProjectDto
        // Reemplazar con: const response = await projectsGeneratedApi.projectControllerFindOne(id); return response.data;
        const response = await apiClient.get<generated.ProjectDto>(`/api/projects/${id}`);
        return response.data;
    },
    create: async (payload: generated.CreateProjectDto): Promise<generated.ProjectDto> => { // Usar ProjectDto como retorno
        // Reemplazar con: const response = await projectsGeneratedApi.projectControllerCreate(payload); return response.data;
        const response = await apiClient.post<generated.ProjectDto>('/api/projects', payload);
        return response.data;
    },
    update: async (id: string, payload: generated.UpdateProjectDto): Promise<generated.ProjectDto> => { // Usar ProjectDto como retorno
        // Reemplazar con: const response = await projectsGeneratedApi.projectControllerUpdate(id, payload); return response.data;
        const response = await apiClient.patch<generated.ProjectDto>(`/api/projects/${id}`, payload);
        return response.data;
    },
    remove: async (id: string): Promise<void> => {
        // Reemplazar con: await projectsGeneratedApi.projectControllerRemove(id);
        await apiClient.delete(`/api/projects/${id}`);
    },
};

// Servicio de Regiones (Mantener manual o reemplazar con generated.RegionsApi)
export const regionService = {
    findAll: async (projectId: string): Promise<generated.CreateRegionDto[]> => { // Usar CreateRegionDto
        // Reemplazar con: const response = await regionsGeneratedApi.regionControllerFindAll(projectId); return response.data;
        const response = await apiClient.get<generated.CreateRegionDto[]>(`/api/projects/${projectId}/regions`);
        return response.data;
    },
    findOne: async (projectId: string, languageCode: string): Promise<generated.CreateRegionDto> => { // Usar CreateRegionDto
        // Reemplazar con: const response = await regionsGeneratedApi.regionControllerFindOne(languageCode, projectId); return response.data;
        const response = await apiClient.get<generated.CreateRegionDto>(`/api/projects/${projectId}/regions/${languageCode}`);
        return response.data;
    },
    create: async (projectId: string, payload: generated.CreateRegionDto): Promise<generated.CreateRegionDto> => { // Usar CreateRegionDto
        // Reemplazar con: const response = await regionsGeneratedApi.regionControllerCreate(projectId, payload); return response.data;
        const response = await apiClient.post<generated.CreateRegionDto>(`/api/projects/${projectId}/regions`, payload);
        return response.data;
    },
    update: async (projectId: string, languageCode: string, payload: generated.UpdateRegionDto): Promise<generated.CreateRegionDto> => { // Usar CreateRegionDto como retorno
        // Reemplazar con: const response = await regionsGeneratedApi.regionControllerUpdate(languageCode, projectId, payload); return response.data;
        const response = await apiClient.patch<generated.CreateRegionDto>(`/api/projects/${projectId}/regions/${languageCode}`, payload);
        return response.data;
    },
    remove: async (projectId: string, languageCode: string): Promise<void> => {
        // Reemplazar con: await regionsGeneratedApi.regionControllerRemove(languageCode, projectId);
        await apiClient.delete(`/api/projects/${projectId}/regions/${languageCode}`);
    },
};

// Servicio de Entornos (Actualizado para usar generado)
export const environmentService = {
    create: async (projectId: string, payload: generated.CreateEnvironmentDto): Promise<generated.CreateEnvironmentDto> => {
        const response = await environmentsApi.environmentControllerCreate(projectId, payload);
        return response.data;
    },
    findAll: async (projectId: string): Promise<generated.CreateEnvironmentDto[]> => {
        const response = await environmentsApi.environmentControllerFindAll(projectId);
        return response.data;
    },
    findOne: async (projectId: string, environmentId: string): Promise<generated.CreateEnvironmentDto> => {
        // Asegurar el orden correcto de parámetros para el servicio generado si es diferente
        const response = await environmentsApi.environmentControllerFindOne(environmentId, projectId); // El generado usa (environmentId, projectId)
        return response.data;
    },
    // findByName se mantiene si existe y se usa, la API generada parece tenerlo.
    findByName: async (projectId: string, name: string): Promise<generated.CreateEnvironmentDto | null> => {
        try {
            const response = await environmentsApi.environmentControllerFindByName(name, projectId);
            return response.data;
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                if (axiosError.response && axiosError.response.status === 404) {
                    return null;
                }
            }
            console.error(`[environmentService.findByName] Error: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
            showErrorToast(`Failed to find environment by name: ${name}`);
            throw error;
        }
    },
    update: async (projectId: string, environmentId: string, payload: generated.UpdateEnvironmentDto): Promise<generated.CreateEnvironmentDto> => {
        // Asegurar el orden correcto de parámetros para el servicio generado si es diferente
        const response = await environmentsApi.environmentControllerUpdate(environmentId, projectId, payload); // El generado usa (environmentId, projectId, payload)
        return response.data;
    },
    remove: async (projectId: string, environmentId: string): Promise<generated.CreateEnvironmentDto> => {
        // Asegurar el orden correcto de parámetros para el servicio generado si es diferente
        const response = await environmentsApi.environmentControllerRemove(environmentId, projectId); // El generado usa (environmentId, projectId)
        return response.data;
    }
};

// Servicio de Tags (Actualizado para usar generado y TagDto con ID)
export const tagService = {
    findAll: async (projectId: string): Promise<generated.TagDto[]> => {
        const response = await tagsApi.tagControllerFindAll(projectId);
        return response.data;
    },
    findOne: async (projectId: string, tagId: string): Promise<generated.TagDto> => {
        const response = await tagsApi.tagControllerFindOne(tagId, projectId);
        return response.data;
    },
    create: async (projectId: string, data: generated.CreateTagDto): Promise<generated.TagDto> => {
        const response = await tagsApi.tagControllerCreate(projectId, data);
        return response.data;
    },
    update: async (projectId: string, tagId: string, data: generated.UpdateTagDto): Promise<generated.TagDto> => {
        const response = await tagsApi.tagControllerUpdate(tagId, projectId, data);
        return response.data;
    },
    delete: async (projectId: string, tagId: string): Promise<generated.TagDto> => {
        const response = await tagsApi.tagControllerRemove(tagId, projectId);
        return response.data;
    }
};

// Servicio de Prompts (Corregido para usar generated.PromptsApi)
export const promptService = {
    async findAll(projectId: string): Promise<any[]> {
        const response = await promptsApi.promptControllerFindAll(projectId);
        return response.data;
    },
    async findOne(projectId: string, id: string): Promise<any> {
        const response = await promptsApi.promptControllerFindOne(id, projectId);
        return response.data;
    },
    async create(projectId: string, payload: Omit<generated.CreatePromptDto, 'tenantId'>): Promise<any> {
        const response = await promptsApi.promptControllerCreate(projectId, payload as generated.CreatePromptDto);
        return response.data;
    },
    async update(projectId: string, id: string, payload: generated.UpdatePromptDto): Promise<any> {
        const response = await promptsApi.promptControllerUpdate(id, projectId, payload);
        return response.data;
    },
    async remove(projectId: string, id: string): Promise<void> {
        await promptsApi.promptControllerRemove(id, projectId);
    },
    async generateStructure(projectId: string, payload: generated.GeneratePromptStructureDto): Promise<any> {
        const response = await promptsApi.promptControllerGenerateStructure(projectId, payload);
        return response.data;
    },
    async loadStructure(projectId: string, payload: any): Promise<any> {
        // HACK: This endpoint seems to be missing from the latest generated client.
        // Assuming a similar signature to generateStructure for now.
        // Replace with the correct call when the generator is fixed.
        // const response = await promptsApi.promptControllerLoadStructure(projectId, payload);
        // return response.data;
        console.warn("promptService.loadStructure is not implemented due to a missing endpoint in the generated client.");
        return Promise.resolve({}); // Return empty object as a fallback
    }
};

// Interfaz local para el servicio, debería coincidir o ser compatible con PromptVersionData de la página
interface PromptVersionDetail extends Omit<generated.CreatePromptVersionDto, 'languageCode'> {
    id: string;
    versionTag: string;
    isActive: boolean;
    languageCode?: string;
}

// Servicio para Versiones de Prompt
export const promptVersionService = {
    findAll: async (projectId: string, promptId: string): Promise<generated.CreatePromptVersionDto[]> => {
        const response = await promptVersionsApi.promptVersionControllerFindAll(projectId, promptId);
        return response.data;
    },
    findOne: async (projectId: string, promptId: string, versionTag: string, processed?: boolean): Promise<generated.CreatePromptVersionDto> => {
        let url = `/api/projects/${projectId}/prompts/${promptId}/versions/${versionTag}`;
        if (processed) url += '?processed=true';
        const response = await apiClient.get<generated.CreatePromptVersionDto>(url);
        return response.data;
    },
    create: async (projectId: string, promptId: string, payload: generated.CreatePromptVersionDto): Promise<generated.CreatePromptVersionDto> => {
        const response = await promptVersionsApi.promptVersionControllerCreate(projectId, promptId, payload);
        return response.data;
    },
    update: async (projectId: string, promptId: string, versionTag: string, payload: generated.UpdatePromptVersionDto): Promise<generated.CreatePromptVersionDto> => {
        const response = await promptVersionsApi.promptVersionControllerUpdate(projectId, promptId, versionTag, payload);
        return response.data;
    },
    remove: async (projectId: string, promptId: string, versionTag: string): Promise<void> => {
        await promptVersionsApi.promptVersionControllerRemove(projectId, promptId, versionTag);
    },
    // Nuevos métodos para Marketplace
    requestPublish: async (projectId: string, promptId: string, versionTag: string): Promise<generated.CreatePromptVersionDto> => {
        const response = await apiClient.post<generated.CreatePromptVersionDto>(
            `/api/projects/${projectId}/prompts/${promptId}/versions/${versionTag}/request-publish`
        );
        return response.data; // Asume que la API devuelve la versión actualizada
    },
    unpublish: async (projectId: string, promptId: string, versionTag: string): Promise<generated.CreatePromptVersionDto> => {
        const response = await apiClient.post<generated.CreatePromptVersionDto>(
            `/api/projects/${projectId}/prompts/${promptId}/versions/${versionTag}/unpublish`
        );
        return response.data; // Asume que la API devuelve la versión actualizada (o al menos el nuevo status)
    },
};

// Servicio para Traducciones de Prompt
export const promptTranslationService = {
    findAll: async (projectId: string, promptId: string, versionTag: string): Promise<generated.CreatePromptTranslationDto[]> => {
        const response = await promptTranslationsApi.promptTranslationControllerFindAll(projectId, promptId, versionTag);
        return response.data;
    },
    findByLanguage: async (projectId: string, promptId: string, versionTag: string, languageCode: string, processed?: boolean): Promise<generated.CreatePromptTranslationDto> => {
        let url = `/api/projects/${projectId}/prompts/${promptId}/versions/${versionTag}/translations/${languageCode}`;
        if (processed) url += '?processed=true';
        const response = await apiClient.get<generated.CreatePromptTranslationDto>(url);
        return response.data;
    },
    create: async (projectId: string, promptId: string, versionTag: string, payload: generated.CreatePromptTranslationDto): Promise<generated.CreatePromptTranslationDto> => {
        const response = await promptTranslationsApi.promptTranslationControllerCreate(projectId, promptId, versionTag, payload);
        return response.data;
    },
    update: async (projectId: string, promptId: string, versionTag: string, languageCode: string, payload: generated.UpdatePromptTranslationDto): Promise<generated.CreatePromptTranslationDto> => {
        const response = await promptTranslationsApi.promptTranslationControllerUpdate(projectId, promptId, versionTag, languageCode, payload);
        return response.data;
    },
    remove: async (projectId: string, promptId: string, versionTag: string, languageCode: string): Promise<void> => {
        await promptTranslationsApi.promptTranslationControllerRemove(projectId, promptId, versionTag, languageCode);
    },
};

// --- Tipos personalizados para el frontend ---
// Tipo para crear assets sin tenantId (el backend lo maneja automáticamente)
export type CreatePromptAssetDtoFrontend = Omit<generated.CreatePromptAssetDto, 'tenantId'>;

// Servicio de Prompt Assets (Corregido para usar generated.PromptAssetsApi)
export const promptAssetService = {
    findAll: async (projectId: string, promptId: string): Promise<PromptAssetData[]> => {
        console.log("DEBUG: promptAssetService.findAll - received projectId:", projectId);
        console.log("DEBUG: promptAssetService.findAll - received promptId:", promptId);
        const response = await promptAssetsApi.promptAssetControllerFindAll(promptId, projectId);
        const responseData = response.data;
        if (Array.isArray(responseData)) {
            const assets = responseData as generated.CreatePromptAssetDto[];
            return assets.map(item => ({
                ...item,
                key: item.key || '',
                projectId: projectId,
                promptId: promptId,
            }));
        }
        console.warn("[promptAssetService.findAll] response.data no es un array o es void. Devolviendo array vacío.");
        return [];
    },

    findOne: async (projectId: string, promptId: string, assetKey: string): Promise<PromptAssetData> => {
        const response = await promptAssetsApi.promptAssetControllerFindOne(promptId, projectId, assetKey);
        const asset = response.data as any;
        return {
            ...asset,
            key: asset.key || assetKey,
            projectId: projectId,
            promptId: promptId,
        } as PromptAssetData;
    },

    // Método para crear assets de prompt específicos
    create: async (projectId: string, promptId: string, payload: CreatePromptAssetDtoFrontend): Promise<void> => {

        // Obtener tenantId del localStorage/sessionStorage del token JWT
        let tenantId = 'default-tenant'; // Valor por defecto
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (token) {
                try {
                    // Decodificar JWT para obtener tenantId (simple base64 decode del payload)
                    const payload_jwt = JSON.parse(atob(token.split('.')[1]));
                    if (payload_jwt.tenantId) {
                        tenantId = payload_jwt.tenantId;
                    }
                } catch (e) {

                }
            }
        }

        // Crear un payload completamente limpio sin tenantId
        const cleanPayload: {
            key: string;
            name: string;
            initialValue: string;
            category?: string;
            initialChangeMessage?: string;
            tenantId: string; // Requerido por el backend hasta que se actualice
        } = {
            key: payload.key,
            name: payload.name,
            initialValue: payload.initialValue,
            tenantId: tenantId // Usar el tenantId obtenido del JWT
        };

        // Solo añadir campos opcionales si existen
        if (payload.category) {
            cleanPayload.category = payload.category;
        }
        if (payload.initialChangeMessage) {
            cleanPayload.initialChangeMessage = payload.initialChangeMessage;
        }

        try {
            const response = await apiClient.post(`/api/projects/${projectId}/prompts/${promptId}/assets`, cleanPayload);
        } catch (error: any) {

            if (error.config?.data) {

            }
            throw error;
        }
    },
    update: async (projectId: string, promptId: string, assetKey: string, payload: generated.UpdatePromptAssetDto): Promise<void> => {
        await promptAssetsApi.promptAssetControllerUpdate(promptId, projectId, assetKey, payload);
    },
    remove: async (projectId: string, promptId: string, assetKey: string): Promise<void> => {
        await promptAssetsApi.promptAssetControllerRemove(promptId, projectId, assetKey);
    },
    findVersions: async (projectId: string, promptId: string, assetKey: string): Promise<generated.CreatePromptAssetVersionDto[]> => {
        const response = await apiClient.get<generated.CreatePromptAssetVersionDto[]>(`/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions`);
        return response.data;
    },
    findOneVersion: async (
        projectId: string,
        promptId: string,
        assetKey: string,
        versionTag: string
    ): Promise<generated.CreatePromptAssetVersionDto> => {
        console.log('[promptAssetService.findOneVersion] Usando apiClient.get directamente.');
        console.log('[promptAssetService.findOneVersion] Project ID:', projectId);
        console.log('[promptAssetService.findOneVersion] Prompt ID:', promptId);
        console.log('[promptAssetService.findOneVersion] Asset Key:', assetKey);
        console.log('[promptAssetService.findOneVersion] Version Tag:', versionTag);

        const url = `/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}`;

        try {
            const response = await apiClient.get<generated.CreatePromptAssetVersionDto>(url);
            console.log('[promptAssetService.findOneVersion] Datos recibidos:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener la versión del asset (${url}):`, error);
            throw error;
        }
    },
    createVersion: async (projectId: string, promptId: string, assetKey: string, payload: generated.CreatePromptAssetVersionDto): Promise<generated.CreatePromptAssetVersionDto> => {
        const url = `/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions`;
        console.log('[promptAssetService.createVersion] Usando apiClient.post. URL:', url, 'Payload:', payload);
        try {
            const response = await apiClient.post<generated.CreatePromptAssetVersionDto>(url, payload);
            return response.data;
        } catch (error) {
            showErrorToast(`Failed to create asset version: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`Error creating asset version (${url}):`, error);
            throw error;
        }
    },
    updateVersion: async (
        projectId: string,
        promptId: string,
        assetKey: string,
        versionTag: string,
        payload: generated.UpdatePromptAssetVersionDto
    ): Promise<generated.CreatePromptAssetVersionDto> => {
        console.log('[promptAssetService.updateVersion] Usando apiClient.patch directamente.');
        console.log('[promptAssetService.updateVersion] Project ID:', projectId);
        console.log('[promptAssetService.updateVersion] Prompt ID:', promptId);
        console.log('[promptAssetService.updateVersion] Asset Key:', assetKey);
        console.log('[promptAssetService.updateVersion] Version Tag:', versionTag);
        console.log('[promptAssetService.updateVersion] Payload enviado:', JSON.stringify(payload));

        const url = `/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}`;

        try {
            const response = await apiClient.patch<generated.CreatePromptAssetVersionDto>(url, payload);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar la versión del asset (${url}):`, error);
            throw error;
        }
    },
    removeVersion: async (projectId: string, promptId: string, assetKey: string, versionTag: string): Promise<void> => {
        const url = `/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}`;
        console.log('[promptAssetService.removeVersion] Usando apiClient.delete directamente. URL:', url);
        try {
            await apiClient.delete(url);
        } catch (error) {
            showErrorToast(`Failed to delete asset version ${versionTag}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`Error deleting asset version ${versionTag} (${url}):`, error);
            throw error;
        }
    },
    requestPublishVersion: async (projectId: string, promptId: string, assetKey: string, versionTag: string): Promise<generated.CreatePromptAssetVersionDto> => {
        const response = await apiClient.post<generated.CreatePromptAssetVersionDto>(
            `/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}/request-publish`
        );
        return response.data;
    },
    unpublishVersion: async (projectId: string, promptId: string, assetKey: string, versionTag: string): Promise<generated.CreatePromptAssetVersionDto> => {
        const response = await apiClient.post<generated.CreatePromptAssetVersionDto>(
            `/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}/unpublish`
        );
        return response.data;
    },
    findTranslations: async (projectId: string, promptId: string, assetKey: string, versionTag: string): Promise<generated.CreateAssetTranslationDto[]> => {
        const response = await apiClient.get<generated.CreateAssetTranslationDto[]>(`/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}/translations`);
        return response.data;
    },
    createTranslation: async (projectId: string, promptId: string, assetKey: string, versionTag: string, payload: generated.CreateAssetTranslationDto): Promise<generated.CreateAssetTranslationDto> => {
        const response = await apiClient.post<generated.CreateAssetTranslationDto>(`/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}/translations`, payload);
        return response.data;
    },
    updateTranslation: async (projectId: string, promptId: string, assetKey: string, versionTag: string, languageCode: string, payload: generated.UpdateAssetTranslationDto): Promise<generated.CreateAssetTranslationDto> => {
        const response = await apiClient.patch<generated.CreateAssetTranslationDto>(`/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}/translations/${languageCode}`, payload);
        return response.data;
    },
    removeTranslation: async (projectId: string, promptId: string, assetKey: string, versionTag: string, languageCode: string): Promise<void> => {
        await apiClient.delete(`/api/projects/${projectId}/prompts/${promptId}/assets/${assetKey}/versions/${versionTag}/translations/${languageCode}`);
    },
};

// Servicio de Health Check
export const healthService = {
    check: async (): Promise<boolean> => {
        try {
            const response = await apiClient.get('/health');
            return response.status === 200;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
};

// Servicio de Ejecución de LLM
export const llmExecutionService = {
    execute: async (payload: generated.ExecuteLlmDto): Promise<any> => {
        const response = await llmExecutionApi.llmExecutionControllerExecuteLlm(payload);
        return response.data;
    }
};

// Servicio de Ejecución Bruta
export const rawExecutionService = {
    execute: async (payload: generated.ExecuteRawDto): Promise<any> => {
        const response = await rawExecutionApi.rawExecutionControllerExecuteRawText(payload);
        return response.data;
    }
};

// --- Exportaciones de tipos para compatibilidad ---
// Re-exportar tipos importantes desde generated para mantener compatibilidad
export type CreateProjectDto = generated.CreateProjectDto;
export type UpdateProjectDto = generated.UpdateProjectDto;
export type CreatePromptDto = generated.CreatePromptDto;
export type UpdatePromptDto = generated.UpdatePromptDto;
export type CreatePromptVersionDto = generated.CreatePromptVersionDto;
export type UpdatePromptVersionDto = generated.UpdatePromptVersionDto;
export type CreatePromptTranslationDto = generated.CreatePromptTranslationDto;
export type UpdatePromptTranslationDto = generated.UpdatePromptTranslationDto;
export type CreatePromptAssetDto = generated.CreatePromptAssetDto;
export type UpdatePromptAssetDto = generated.UpdatePromptAssetDto;
export type CreatePromptAssetVersionDto = generated.CreatePromptAssetVersionDto;
export type UpdatePromptAssetVersionDto = generated.UpdatePromptAssetVersionDto;
export type CreateAssetTranslationDto = generated.CreateAssetTranslationDto;
export type UpdateAssetTranslationDto = generated.UpdateAssetTranslationDto;
export type CreateRegionDto = generated.CreateRegionDto;
export type UpdateRegionDto = generated.UpdateRegionDto;
export type CreateTagDto = generated.CreateTagDto;
export type UpdateTagDto = generated.UpdateTagDto;
export type TagDto = generated.TagDto;
export type CreateUserDto = generated.CreateUserDto;
export type UserProfileResponse = generated.UserProfileResponse;
export type LoginDto = generated.LoginDto;
export type RegisterDto = generated.RegisterDto;
export type CreateEnvironmentDto = generated.CreateEnvironmentDto;
export type UpdateEnvironmentDto = generated.UpdateEnvironmentDto;
export type CreateCulturalDataDto = generated.CreateCulturalDataDto;
export type UpdateCulturalDataDto = generated.UpdateCulturalDataDto;
export type CulturalDataResponse = generated.CulturalDataResponse;
export type PromptDto = any; // HACK: Set to any due to generator issues
export type ExecuteRawDto = generated.ExecuteRawDto;
export type ExecuteLlmDto = generated.ExecuteLlmDto;
export type AiModelResponseDto = generated.AiModelResponseDto;
export type CreateSystemPromptDto = generated.CreateSystemPromptDto;

// Tipos alias para compatibilidad hacia atrás
export type Project = generated.ProjectDto;
export type Tag = generated.TagDto;
export type Environment = generated.CreateEnvironmentDto;

// Extender UserProfileResponse para incluir role y tenantId
export interface ExtendedUserProfileResponse extends UserProfileResponse {
    role: string;
    tenantId: string;
    updatedAt: string;
}

// Definir el tipo User una sola vez
export type User = ExtendedUserProfileResponse;

// Servicio de Data Cultural (Datos culturales)
export const culturalDataService = {
    findAll: async (projectId: string): Promise<generated.CulturalDataResponse[]> => {
        const response = await apiClient.get<generated.CulturalDataResponse[]>(`/api/projects/${projectId}/cultural-data`);
        return response.data;
    },
    findOne: async (projectId: string, key: string): Promise<generated.CulturalDataResponse> => {
        const response = await apiClient.get<generated.CulturalDataResponse>(`/api/projects/${projectId}/cultural-data/${key}`);
        return response.data;
    },
    create: async (projectId: string, payload: generated.CreateCulturalDataDto): Promise<generated.CulturalDataResponse> => {
        const response = await apiClient.post<generated.CulturalDataResponse>(`/api/projects/${projectId}/cultural-data`, payload);
        return response.data;
    },
    update: async (projectId: string, key: string, payload: generated.UpdateCulturalDataDto): Promise<generated.CulturalDataResponse> => {
        const response = await apiClient.patch<generated.CulturalDataResponse>(`/api/projects/${projectId}/cultural-data/${key}`, payload);
        return response.data;
    },
    remove: async (projectId: string, key: string): Promise<void> => {
        await apiClient.delete(`/api/projects/${projectId}/cultural-data/${key}`);
    },
};

// Tipos para Tenants
export interface TenantResponseDto {
    id: string;
    name: string;
    marketplaceRequiresApproval: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTenantAdminUserDto {
    email: string;
    password: string;
    name?: string;
}

export interface CreateTenantDto {
    name: string;
    marketplaceRequiresApproval?: boolean;
    initialAdminUser: CreateTenantAdminUserDto;
}

export interface UpdateTenantDto {
    name?: string;
    marketplaceRequiresApproval?: boolean;
}

// Servicio de Tenants
export const tenantService = {
    findAll: async (): Promise<TenantResponseDto[]> => {
        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
            const response = await apiClient.get<TenantResponseDto[]>('/api/tenants');
            return response.data;
        } catch (error: any) {
            console.error('[tenantService] Error fetching tenants:', error);
            console.error('[tenantService] Error response:', error.response?.data);
            console.error('[tenantService] Error status:', error.response?.status);
            throw error;
        }
    },
    findOne: async (id: string): Promise<TenantResponseDto> => {
        try {
            const response = await apiClient.get<TenantResponseDto>(`/api/tenants/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`[tenantService] Error fetching tenant ${id}:`, error);
            console.error('[tenantService] Error response:', error.response?.data);
            console.error('[tenantService] Error status:', error.response?.status);
            throw error;
        }
    },
    create: async (payload: CreateTenantDto): Promise<TenantResponseDto> => {
        try {
            const response = await apiClient.post<TenantResponseDto>('/api/tenants', payload);
            return response.data;
        } catch (error: any) {
            console.error('[tenantService] Error creating tenant:', error);
            console.error('[tenantService] Error response:', error.response?.data);
            console.error('[tenantService] Error status:', error.response?.status);
            throw error;
        }
    },
    update: async (id: string, payload: UpdateTenantDto): Promise<TenantResponseDto> => {
        try {
            const response = await apiClient.patch<TenantResponseDto>(`/api/tenants/${id}`, payload);
            return response.data;
        } catch (error: any) {
            console.error(`[tenantService] Error updating tenant ${id}:`, error);
            console.error('[tenantService] Error response:', error.response?.data);
            console.error('[tenantService] Error status:', error.response?.status);
            throw error;
        }
    },
    remove: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/tenants/${id}`);
        } catch (error: any) {
            console.error(`[tenantService] Error deleting tenant ${id}:`, error);
            console.error('[tenantService] Error response:', error.response?.data);
            console.error('[tenantService] Error status:', error.response?.status);
            throw error;
        }
    }
};
// Add rule service methods
export const ruleService = {
    findAllByProject: async (projectId: string): Promise<any> => {
        
        const response = await apiClient.get(`/api/rules`);
        console.log('rulessss: ', response.data);
        return response.data;
    },

    findOne: async (id: string): Promise<any> => {
         console.log("rule id:" ,id);
        const response = await apiClient.get(`/api/rules/${id}`);
        console.log("Successsssssssssss rule response:", response.data);
        return response.data;
    },

    create: async (projectId: string, data: any): Promise<any> => {
        const response = await apiClient.post('/api/rules', { ...data });
        return response.data;
    },

    update: async (id: string, data: any): Promise<any> => {
        const response = await apiClient.patch(`/api/rules/${id}`, data);
        console.log('rulessss update: ', response.data);
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/rules/${id}`);
    },
};



export const apiKeyService = {
    create: async (payload: generated.CreateApiKeyDto): Promise<any> => {
        const response = await apiClient.post(`/api/api-keys`, payload);
        return response.data as any;
    },
    findAll: async (): Promise<any[]> => {
        const response = await apiClient.get(`/api/api-keys`);
        return response.data as any[];
    },
    findOne: async (id: string): Promise<any> => {
        const response = await apiClient.get(`/api/api-keys/${id}`);
        return response.data as any;
    },
    update: async (id: string, payload: generated.UpdateApiKeyDto): Promise<any> => {
        const response = await apiClient.patch(`/api/api-keys/${id}`, payload);
        return response.data as any;
    },
    remove: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/api-keys/${id}`);
    },
};