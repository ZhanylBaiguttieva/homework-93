import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from "mongoose";
import { Album } from "./album.schema";

@Schema()
export class Track {
  @Prop({ref: Album.name, required: true})
  album: mongoose.Schema.Types.ObjectId;

  @Prop({required: true, unique: true})
  name: string;

  @Prop()
  length: string;

  @Prop({required: true, min: 0})
  number: number;
}

export const TrackSchema = SchemaFactory.createForClass(Track);

export type TrackDocument = Track & Document;