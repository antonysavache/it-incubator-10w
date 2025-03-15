import {Collection, Filter, ObjectId, WithId} from 'mongodb';
import {PageResponse, PaginationQueryParams, SearchParam, ToViewModel} from "../../models/common.model";
import {getDatabase} from "../db/mongo-db";

export abstract class BaseQueryRepository<T extends { _id: ObjectId; }> {
    protected collection: Collection<T> | null = null;

    constructor(protected collectionName: string) {}

    init() {
        if (!this.collection) {
            this.collection = getDatabase().collection<T>(this.collectionName);
        }
    }

    protected checkInit() {
        if (!this.collection) {
            throw new Error('Repository not initialized');
        }
    }

    async findAll(params: PaginationQueryParams): Promise<PageResponse<ToViewModel<T>>> {
        this.checkInit();

        const filter = this.buildFilter(params.searchParams, params.blogId ? { blogId: params.blogId } : {});

        let query = this.collection.find(filter);

        if (params.sortBy) {
            const sortDirection = params.sortDirection === 'asc' ? 1 : -1;
            query = query.sort({ [params.sortBy]: sortDirection });
        }

        const skip = (Number(params.pageNumber) - 1) * Number(params.pageSize);
        const limit = Number(params.pageSize);

        const [items, totalCount] = await Promise.all([
            query.skip(skip).limit(limit).toArray(),
            this.collection.countDocuments(filter)
        ]);

        return {
            pagesCount: Math.ceil(totalCount / limit),
            page: Number(params.pageNumber),
            pageSize: limit,
            totalCount,
            items: items.map((item) => this.toViewModel(item))
        };
    }

    async findById(id: string): Promise<ToViewModel<T> | null> {
        this.checkInit();

        const result = await this.collection.findOne({ _id: new ObjectId(id) } as Filter<T>);
        return result ? this.toViewModel(result) : null;
    }

    protected buildFilter(
        searchParams: SearchParam[],
        additionalFilter: Record<string, any> = {}
    ): Filter<T> {
        if (searchParams.length === 0) {
            return additionalFilter as Filter<T>;
        }

        const conditions = searchParams.map(param => ({
            [param.fieldName]: param.isExact
                ? param.value
                : { $regex: param.value, $options: 'i' }
        }));

        return {
            ...additionalFilter,
            $or: conditions
        } as Filter<T>;
    }

    protected toViewModel(model: WithId<T>): ToViewModel<T> {
        const { _id, ...rest } = model;
        return {
            ...rest,
            id: _id.toString()
        } as ToViewModel<T>;
    }
}