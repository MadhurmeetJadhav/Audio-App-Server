import { categories, categoriesTypes } from "#/utils/audio_category";
import { Model, Schema, model } from "mongoose";
import { ObjectId } from "mongoose";

export interface AudioDocument {
  title: string;
  about: string;
  owner: ObjectId;
  file: {
    url: string;
    publicId: string;
  };
  poster?: {
    url: string;
    publicId: string;
  };
  likes: ObjectId[];
  categories: categoriesTypes;
}

const AudioSchema = new Schema<AudioDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    file: {
      type: Object,
      url: String,
      publicId: String,
      required: true,
    },
    poster: {
      type: Object,
      url: String,
      publicId: String,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    categories: {
      type: String,
      enum: categories,
      default: "Others",
    },
  },
  {
    timestamps: true,
  }
);

model("Audio", AudioSchema) as Model<AudioDocument>;
