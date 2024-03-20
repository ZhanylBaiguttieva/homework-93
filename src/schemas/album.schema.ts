import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Artist } from "./artist.schema";

@Schema()
export class Album {
  @Prop({ref: Artist.name, required: true})
  artist: mongoose.Schema.Types.ObjectId;

  @Prop({required: true, unique: true})
  name: string;

  @Prop({required: true, min: 0})
  date: number;

  @Prop()
  image: string;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);

export type AlbumDocument = Album & Document;