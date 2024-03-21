import {
  Body,
  Controller,Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Track, TrackDocument } from "../schemas/track.schema";
import { CreateTrackDto } from "./create-track.dto";

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

  @Post()
  create(

    @Body() trackData: CreateTrackDto
  ) {
    const track = new this.trackModel({
      album: trackData.album,
      name: trackData.name,
      length: trackData.length,
      number: trackData.number,
    });
    return track.save();
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.trackModel.findByIdAndDelete(id);
    return {message: 'This track was deleted'}
  }
}

