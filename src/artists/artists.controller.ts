import {
  Body,
  Controller, Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Artist, ArtistDocument } from "../schemas/artist.schema";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateArtistDto } from "./create-artist.dto";
import { diskStorage } from "multer";

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}
  @Get()
  getAll() {
    return this.artistModel.find();
  }

  @Get('/:id')
  async getOne(@Param('id') id:string){
    const artist = await this.artistModel.findById(id);
    if (!artist) {
      throw new NotFoundException('No such artist');
    }
    return artist;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image',{storage: diskStorage({
        destination:'./public/uploads/artists',
        filename: (_req,file,cb )=> {
          cb(null,file.originalname);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistData: CreateArtistDto
  ) {
    const artist = new this.artistModel({
      name: artistData.name,
      information: artistData.information,
      image: file ? '/uploads/artists/' + file.filename : null,
    });
    return artist.save();
  }

  @Delete('/:id')
  async delete(@Param('id') id:string) {
    await this.artistModel.findByIdAndDelete(id);
    return {message: 'This artist was deleted'}
  }
}


