import { ObjectId } from 'mongodb';

export type ToViewModel<T extends { _id: ObjectId }> =
    { id: string } &
    { [K in Exclude<keyof T, '_id'>]: T[K] };

export const DEFAULT_QUERY_PARAMS = {
    sortBy: '_id',
    sortDirection: 'desc' as const,
    pageNumber: '1',
    pageSize: '10'
};

export interface BaseQueryParams {
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    pageNumber?: string;
    pageSize?: string;
}

export interface SearchTerms {
    searchNameTerm?: string | null;
    searchLoginTerm?: string | null;
    searchEmailTerm?: string | null;
}

export interface SearchParam {
    fieldName: string;
    value: string;
    isExact?: boolean;
}

export interface QueryParams extends BaseQueryParams, Partial<SearchTerms> {}

export interface PaginationQueryParams {
    searchParams: SearchParam[];
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    pageNumber: string;
    pageSize: string;
    blogId?: string;
}

export interface PageResponse<T> {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
}

export interface ErrorMessage {
    message: string;
    field: string;
}

export interface ApiErrorResult {
    errorsMessages: ErrorMessage[];
}