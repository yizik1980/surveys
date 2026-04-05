import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Surveyor, SurveyorSchema } from './surveyor.schema';
import { SurveyorsService } from './surveyors.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Surveyor.name, schema: SurveyorSchema }]),
  ],
  providers: [SurveyorsService],
  exports: [SurveyorsService],
})
export class SurveyorsModule {}
