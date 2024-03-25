import {
  Body,
  Controller, Delete,
  Get,
  NotFoundException,
  Param,
  Post, Req,
  UploadedFile, UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Artist, ArtistDocument } from "../schemas/artist.schema";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateArtistDto } from "./create-artist.dto";
import { diskStorage } from "multer";
import { randomUUID } from "crypto";
import { TokenAuthGuard } from "../auth/token-auth.guard";
import { Request } from "express";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../users/role.enum";

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
  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image',{storage: diskStorage({
        destination:'./public/uploads/artists',
        filename: (_req,file,cb )=> {
          cb(null, randomUUID() + file.originalname);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistData: CreateArtistDto,
    @Req() _req: Request,
  ) {
    const artist = new this.artistModel({
      name: artistData.name,
      information: artistData.information,
      image: file ? '/uploads/artists/' + file.filename : null,
    });
    return artist.save();
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    this.artistModel.findByIdAndDelete(id);
    return {message: 'This artist was deleted'}
  }
}


