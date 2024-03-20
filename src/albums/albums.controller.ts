import {
  Body,
  Controller, Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FileInterceptor } from "@nestjs/platform-express";
import { Album, AlbumDocument } from "../schemas/album.schema";
import { CreateAlbumDto } from "./create-album.dto";

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}
  @Get()
  getAll(@Query() params: any) {
    if(params.artist) {
      return this.albumModel
        .find({artist: params.artist})
        .sort({ date: 'desc' })
        .populate('artist', 'name information')
    }
      return this.albumModel
        .find()
        .sort({ date: 'desc' })
        .populate('artist', 'name information')
  }

  @Get('/:id')
  async getOne(@Param('id') id:string){
    const album = await this.albumModel
      .findById(id)
      .populate(
        'artist',
        'name information');

    if (!album) {
      throw new NotFoundException('No such album');
    }
    return album;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image',{dest:'./public/uploads/albums'})
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumData: CreateAlbumDto
  ) {
    const album = new this.albumModel({
      artist: albumData.artist,
      name: albumData.name,
      date: albumData.date,
      image: file ? '/uploads/albums/' + file.filename : null,
    });
    return album.save();
  }

  @Delete('/:id')
  async delete(@Param('id') id:string) {
    await this.albumModel.findByIdAndDelete(id);
    return {message: 'This album was deleted'}
  }
}


