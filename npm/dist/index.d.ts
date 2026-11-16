/**
 * @file index.d.ts
 * @brief TypeScript definitions for @tty-pt/axil-hyle.
 */

export interface PartitionRoutesSpec {
  module: string;
  partitionSource: string;
  primaryField?: string;
  childResource?: string;
  childrenResource?: string;
  pinField?: string;
  positional?: boolean;
  updateAction?: string;
  redirectPattern?: string;
}

export interface DatasetUrlOptions {
  key?: string | number;
  ordered?: boolean;
  index?: number;
  query?: Record<string, string | number | boolean | undefined | null>;
}

export interface AxilHyleClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  fetch?: typeof globalThis.fetch;
}

export interface AxilHyleNativeBinding {
  hasNativeModule(): boolean;
  installRoutes(): boolean;
  registerPartitionRoutes(spec: PartitionRoutesSpec): boolean;
}

export declare function getNativeAxilHyle(): AxilHyleNativeBinding | null;
export declare function hasNativeModule(): boolean;
export declare function getModulePath(): string | null;
export declare function installRoutes(): boolean;
export declare function registerPartitionRoutes(spec: PartitionRoutesSpec): boolean;
export declare function buildDatasetUrl(datasetId: string, options?: DatasetUrlOptions): string;

export declare class AxilHyleClient {
  baseUrl: string;
  headers: Record<string, string>;
  constructor(options?: AxilHyleClientOptions);
  list(datasetId: string, query?: Record<string, any>): Promise<any>;
  get(datasetId: string, key: string): Promise<any>;
  create(datasetId: string, payload: Record<string, any> | string): Promise<any>;
  update(datasetId: string, key: string, payload: Record<string, any> | string): Promise<any>;
  delete(datasetId: string, key: string): Promise<any>;
  listOrdered(datasetId: string, key: string): Promise<any>;
  appendOrdered(datasetId: string, key: string, payload: Record<string, any> | string): Promise<any>;
  updateOrdered(datasetId: string, key: string, index: number, payload: Record<string, any> | string): Promise<any>;
  removeOrdered(datasetId: string, key: string, index: number): Promise<any>;
}

export declare function createAxilHyleClient(options?: AxilHyleClientOptions): AxilHyleClient;
