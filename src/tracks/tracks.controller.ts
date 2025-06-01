import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TrackService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get()
  findAll() {
    return this.trackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTrackDto) {
    return this.trackService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
    return this.trackService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.trackService.remove(id);
  }
}
