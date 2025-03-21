import mongoose, { Schema, Document } from 'mongoose';
import {PostViewModel} from "../../domain/interfaces/post.interface";

export interface IPostDocument extends Document {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    toViewModel(): PostViewModel;
}

const postSchema = new Schema<IPostDocument>({
    title: { type: String, required: true, maxlength: 30 },
    shortDescription: { type: String, required: true, maxlength: 100 },
    content: { type: String, required: true, maxlength: 1000 },
    blogId: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} is not a valid ObjectId!`
        }
    },
    blogName: { type: String, required: true },
    createdAt: { type: String, required: true, default: () => new Date().toISOString() }
}, {
    versionKey: false
});

postSchema.methods.toViewModel = function(): PostViewModel {
    return {
        id: this._id.toString(),
        title: this.title,
        shortDescription: this.shortDescription,
        content: this.content,
        blogId: this.blogId,
        blogName: this.blogName,
        createdAt: this.createdAt
    };
};

export const PostModel = mongoose.model<IPostDocument>('Post', postSchema);