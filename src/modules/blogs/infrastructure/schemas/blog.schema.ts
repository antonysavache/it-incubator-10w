import mongoose, { Schema, Document } from 'mongoose';
import {BlogViewModel} from "../../domain/interfaces/blog.interface";

export interface IBlogDocument extends Document {
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
    toViewModel(): BlogViewModel;
}

const blogSchema = new Schema<IBlogDocument>({
    name: { type: String, required: true, maxlength: 15 },
    description: { type: String, required: true, maxlength: 500 },
    websiteUrl: {
        type: String,
        required: true,
        maxlength: 100,
        validate: {
            validator: function(v: string) {
                return /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/.test(v);
            },
            message: props => `${props.value} is not a valid website URL!`
        }
    },
    createdAt: { type: String, required: true, default: () => new Date().toISOString() },
    isMembership: { type: Boolean, required: true, default: false }
}, {
    versionKey: false
});

blogSchema.methods.toViewModel = function(): BlogViewModel {
    return {
        id: this._id.toString(),
        name: this.name,
        description: this.description,
        websiteUrl: this.websiteUrl,
        createdAt: this.createdAt,
        isMembership: this.isMembership
    };
};

export const BlogModel = mongoose.model<IBlogDocument>('Blog', blogSchema);