import {
  Body,
  Controller, Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query, Req,
  UploadedFile, UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FileInterceptor } from "@nestjs/platform-express";
import { Album, AlbumDocument } from "../schemas/album.schema";
import { CreateAlbumDto } from "./create-album.dto";
import { diskStorage } from "multer";
import { randomUUID } from "crypto";
import { TokenAuthGuard } from "../auth/token-auth.guard";
import { Request } from "express";

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}
  @Get()
  getAll(@Query('artistId') artistId: string) {
    if(artistId) {
      return this.albumModel
        .find({artist: artistId})
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

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image',{storage: diskStorage({
        destination:'./public/uploads/albums',
        filename: (_req,file,cb )=> {
          cb(null, randomUUID()  + file.originalname);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumData: CreateAlbumDto,
    @Req() _req: Request,
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


