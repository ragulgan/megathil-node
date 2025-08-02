import { Controller, Post, UploadedFile, UseInterceptors, Body, BadRequestException, Request, UseGuards, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import axios, { AxiosResponse } from 'axios';
import * as FormData from 'form-data';
import { verifyAndExtractToken } from '../utill/utill';
import { UserStaffAdminGuard } from '../auth/jwt-auth.guard';
import { ResponseService } from '../base/controller';
import { appConst } from '../libs/constants';
const { SUCCESS, ERROR, AUDIO_MIME_TYPE, VIDEO_MIME_TYPE } = appConst;
import * as _ from 'lodash';
import axiosRetry from 'axios-retry';
import { ProcessAudioService } from './processAudio.service';
import { ProcessAudioDto } from './dto/processAudio.dto';

axiosRetry(axios, { retries: 3 });

@ApiTags('ProcessAudio')
@Controller('processAudio')
export class ProcessAudioController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly processAudioService: ProcessAudioService
  ) { }

  @Post('saveUserResult')
  async handleAIResponse(@Body() processAudioDto: ProcessAudioDto, @Request() req, @Res() res: Response) {
    try {
      if (processAudioDto.aiToken !== process.env.AI_TOKEN) {
        console.error("Error: Invalid AI token.")
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5001' }, '5001');
      }

      if (!processAudioDto.userId) {
        console.error("Error: Invalid user ID.")
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5003', data: [] }, '5003');
      }

      const user: any = await this.processAudioService.getUserById(processAudioDto.userId);
      if (!user) {
        console.error("Error: Invalid user ID.")
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5003', data: [] }, '5003');
      }
      if (!processAudioDto?.aiResponseData) {
        console.error("Invalid ai response data.")
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5002', data: [] }, '5002');
      }
      await this.processAudioService.processAudio({ id: processAudioDto.userId }, processAudioDto, processAudioDto.aiResponseData);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '201', data: [] }, '201');
    } catch (e) {
      console.log("Error", e);
      throw new BadRequestException();
    }
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userProgressStatusId: { type: 'string' },
        unitId: { type: 'string' },
        moduleId: { type: 'string' },
        questionId: { type: 'string' },
        question: { type: 'string' },
        audio_file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['userProgressStatusId', 'unitId', 'moduleId', 'questionId', 'question', 'audio_file'],
    },
  })
  @UseInterceptors(FileInterceptor('audio_file'))
  @UseGuards(UserStaffAdminGuard)
  @ApiBearerAuth()
  async local(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req,
    @Res() res: any
  ) {
    console.log("process audio body##", body);

    const decodedToken = verifyAndExtractToken(req.headers);

    const user: any = await this.processAudioService.getUserById(decodedToken.id);
    if (!user) {
      console.log('User not found or invalid token.');
      throw new BadRequestException('Invalid user ID or user not found.');
    }
    if (!file) {
      console.log('No file uploaded.');
      throw new BadRequestException('No file uploaded.');
    }

    const { mimetype, originalname, buffer } = file;
    if (!AUDIO_MIME_TYPE.includes(mimetype) && !VIDEO_MIME_TYPE.includes(mimetype)) {
      console.log('Unsupported file format. Only WAV and MP3 files are allowed.');
      throw new BadRequestException('Unsupported file format. Only WAV and MP3 files are allowed.');
    }

    const findHighestScore = (arr: any) => {
      return arr.reduce((max: any, current: any) => {
        return current.score > max.score ? current : max;
      }, arr[0]);
    }

    try {
      // preparing file for AI
      const formData = new FormData();
      formData.append('audio_file', buffer, {
        filename: originalname,
        contentType: mimetype,
      });
      formData.append('question', body?.question);
      if (user?.firstName) formData.append('firstName', user?.firstName);
      if (user?.lastName) formData.append('lastName', user?.lastName);
      if (user?.otherCollegeName) formData.append('otherCollegeName', user?.otherCollegeName);
      if (user?.city?.cityName) formData.append('city', user?.city?.cityName);
      if (user?.course?.name) formData.append('course', user?.course?.name);
      if (user?.department?.name) formData.append('department', user?.department?.name);
      if (user?.college?.name) formData.append('college', user?.college?.name);

      // preparing headers for axios
      const headers = {
        ...formData.getHeaders(),
        'accept': 'application/json',
      };
      const response: AxiosResponse<any> = await axios.post(`${process.env.AI_ENDPOINT}/process_audio_master`, formData, {
        timeout: 300000,
        headers: headers,
      });
      const responseData = response.data;
      if (
        responseData.emotion_recognition?.error?.includes("Malformed soundfile") ||
        responseData.transcription?.error?.includes("Malformed soundfile")
      ) {
        console.log("Malformed soundfile");
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1066', data: [] }, '1066')
      } else {
        const result = await this.processAudioService.processAudio(decodedToken, body, responseData);
        const highestFluencyLevel = findHighestScore(responseData?.fluency_level);
        const highestEmotionRecognition = findHighestScore(responseData?.emotion_recognition);
        const roundedHighestEmotionRecognition = {
          label: highestEmotionRecognition?.label == 'sad' ? 'boredom' : highestEmotionRecognition?.label,
          score: Math.round(highestEmotionRecognition.score * 100) / 100
        };
        const roundedHighestFluencyLevel = {
          label: highestFluencyLevel.label,
          score: Math.round(highestFluencyLevel.score * 100) / 100
        };
        const responseDataToSend = {
          contentRelevanceRating: responseData?.content_relavency?.Relevance_rating,
          contentRelevanceRatingReason: responseData?.content_relavency?.reason,
          emotionRecognition: roundedHighestEmotionRecognition,
          enhancedText: responseData.enhanced_text,
          fluencyLevel: roundedHighestFluencyLevel,
          transcription: responseData.transcription,
          vocabularyRating: responseData?.voacablary_level?.Vocabulary_rating,
          vocabularyRatingReason: responseData?.voacablary_level?.reason,
          speechRate: Math.round(responseData.speech_rate * 100) / 100
        }
        console.log("AI response data to mobile app##", responseDataToSend);
        if (!_.isEmpty(responseData)) {
          console.log("AI response has data");
          this.responseService.sendResponse({}, res, SUCCESS.CODE, {
            code: '1004',
            data: responseDataToSend,
          }, '1004');
        } else {
          console.log("AI response has NO data");
          this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [] }, '1005')
        }
      }
    } catch (error) {
      console.log("Process audio error#", error);
      this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '400', data: [] }, '400')
    }
  }
}
