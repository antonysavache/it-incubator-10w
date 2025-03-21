import mongoose, { Document, Model } from 'mongoose';
import {PageResponse, PaginationQueryParams, SearchParam} from "../../../models/common.model";

export abstract class BaseQueryRepository<T extends Document, V> {
    protected constructor(protected model: Model<T>) {}

    protected abstract toViewModel(doc: T): V;

    async findAll(params: PaginationQueryParams): Promise<PageResponse<V>> {
        const filter = this.buildFilter(params.searchParams, params.blogId ? { blogId: params.blogId } : {});

        const skipAmount = (Number(params.pageNumber) - 1) * Number(params.pageSize);
        const limitAmount = Number(params.pageSize);

        const sortDirection = params.sortDirection === 'asc' ? 1 : -1;
        const sortField = params.sortBy || 'createdAt';

        const [items, totalCount] = await Promise.all([
            this.model.find(filter)
                .sort({ [sortField]: sortDirection })
                .skip(skipAmount)
                .limit(limitAmount)
                .exec(),
            this.model.countDocuments(filter)
        ]);

        return {
            pagesCount: Math.ceil(totalCount / limitAmount),
            page: Number(params.pageNumber),
            pageSize: limitAmount,
            totalCount,
            items: items.map(item => this.toViewModel(item))
        };
    }

    async findById(id: string): Promise<V | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }

        const item = await this.model.findById(id).exec();
        return item ? this.toViewModel(item) : null;
    }

    async findByFilter(filter: Record<string, any>): Promise<T | null> {
        return this.model.findOne(filter).exec();
    }

    protected buildFilter(
        searchParams: SearchParam[],
        additionalFilter: Record<string, any> = {}
    ): Record<string, any> {
        if (searchParams.length === 0) {
            return additionalFilter;
        }

        const conditions = searchParams.map(param => ({
            [param.fieldName]: param.isExact
                ? param.value
                : { $regex: param.value, $options: 'i' }
        }));

        return {
            ...additionalFilter,
            $or: conditions
        };
    }
}