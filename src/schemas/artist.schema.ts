import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Artist {
  @Prop({required: true, unique: true})
  name: string;

  @Prop()
  information: string;

  @Prop()
  image: string;

  @Prop({ default: false })
  isPublished: boolean;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);

export type ArtistDocument = Artist & Document;
