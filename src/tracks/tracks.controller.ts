import {
  Body,
  Controller, Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query, Req, UseGuards
} from "@nestjs/common";

import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Track, TrackDocument } from "../schemas/track.schema";
import { CreateTrackDto } from "./create-track.dto";
import { Request } from "express";
import { TokenAuthGuard } from "../auth/token-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../users/role.enum";
import { RolesGuard } from "../auth/guard/roles.guard";

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  getAll(@Query('albumId') albumId: string) {
    if (albumId) {
      return this.trackModel
        .find({album: albumId})
        .sort({ number: 'asc' })
        .populate('album', 'name date');
    }
    return this.trackModel
      .find()
      .sort({ number: 'asc' })
      .populate('album', 'name date');
  }

  @Get('/:id')
  async getOne(@Param('id') id: string){
    const track = await this.trackModel
      .findById(id)
      .populate('album', 'name date');

    if (!track) {
      throw new NotFoundException('No such track');
    }
    return track;
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  create(
    @Body() trackData: CreateTrackDto,
    @Req() _req: Request,
  ) {
    const track = new this.trackModel({
      album: trackData.album,
      name: trackData.name,
      length: trackData.length,
      number: trackData.number,
    });
    return track.save();
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Delete('/:id')
  delete(@Param('id') id: string) {
    this.trackModel.findByIdAndDelete(id);
    return {message: 'This track was deleted'}
  }
}

