import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, UseGuards, Headers, Delete, Param, Res, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../auth/auth.service';
import { FileUpload } from './fileUpload.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ResponseService } from '../base/controller';
import { appConst } from '../libs/constants';
import * as _ from 'lodash';
import type { Response as EResponse } from 'express';

const maxUploadImageSizeMB = parseFloat(process.env.MAX_UPLOAD_SIZE_IMAGE_MB);
const maxUploadVideoSizeMB = parseFloat(process.env.MAX_UPLOAD_SIZE_VIDEO_MB);
const maxUploadSizeMB = parseFloat(process.env.MAX_UPLOAD_SIZE_VIDEO_MB);
const { ALLOWED_MIME_TYPE, VIDEO_MIME_TYPE, ERROR, SUCCESS } = appConst;

@ApiTags('FileUpload')
@Controller('fileUpload')
export class FileUploadController {
  private readonly s3: AWS.S3;
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
    @InjectModel(FileUpload.name) private readonly fileUploadModel: Model<FileUpload>,
  ) {
    // Initialize AWS S3 instance
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    this.s3 = new AWS.S3();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/img',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response, @Headers('authorization') authorization: string): Promise<FileUpload> {
    if (!file) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1059' }, '1059');
    }
    if (!authorization || !authorization.startsWith('Bearer ')) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1063' }, '1063');
    }
    const token = authorization.split(' ')[1];
    const decodedToken = this.authService.decodeToken(token);
    if (!decodedToken) {
      this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1063' }, '1063');
    }
    const validate = await this.validateFile(file, res)
    if (!_.isEmpty(validate.filename)) {
      const { id, role } = decodedToken;
      const user = await this.uploadToS3(file);

      const newFileUpload = await this.fileUploadModel.create({
        filename: user.Key,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        path: user.Location,
        size: file.size.toString(),
        uploadedBy: id,
        uploadedByRole: role,
        status: 'ACTIVE',
      });
      fs.unlinkSync(file.path);
      return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
        code: '1060',
        data: newFileUpload
      }, '1060');
    } else {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1066' }, '1066');
    }
  }

  private async validateFile(file: Express.Multer.File, @Res() res: Response) {
    const fileSize = file.size;
    if (ALLOWED_MIME_TYPE.includes(file.mimetype) || VIDEO_MIME_TYPE.includes(file.mimetype)) {
      if ((ALLOWED_MIME_TYPE.includes(file.mimetype))) {
        if (fileSize <= parseFloat(process.env.MAX_UPLOAD_SIZE_IMAGE_MB) * 1024 * 1024) {
          return file
        } else {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1064' }, '1064');
        }
      } else if (VIDEO_MIME_TYPE.includes(file.mimetype)) {
        if (fileSize <= parseFloat(process.env.MAX_UPLOAD_SIZE_VIDEO_MB) * 1024 * 1024) {
          return file
        } else {
          return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1065' }, '1065');
        }
      }
    } else {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1066' }, '1066');
    }
  }

  private async uploadToS3(file: Express.Multer.File): Promise<AWS.S3.ManagedUpload.SendData> {
    const s3Params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}${extname(file.originalname)}`,
      Body: fs.createReadStream(file.path),
    };

    return new Promise((resolve, reject) => {
      this.s3.upload(s3Params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private async downloadFromS3(filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: filename }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  @Get('read/:filename')
  async readFile(@Param('filename') filename: string, @Res() res: EResponse) {
    const fileDetail = await this.fileUploadModel.findOne({ filename });
    if (fileDetail && fileDetail.filename) {
      const data = await this.downloadFromS3(filename);
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileDetail.originalname);
      res.setHeader('Content-Transfer-Encoding', fileDetail.encoding);
      res.setHeader('Content-Type', fileDetail.mimetype);
      return res.send(data.Body);
    } else {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1062' }, '1062');
    }
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Res() res: Response): Promise<{ message: string }> {
    try {
      const fileRecord = await this.fileUploadModel.findById(id).exec();
      if (!fileRecord) {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1059' }, '1059');
      }
      const s3Key = fileRecord.filename;
      const deleteParams: AWS.S3.DeleteObjectRequest = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      };
      await new Promise<void>((resolve, reject) => {
        this.s3.deleteObject(deleteParams, (err, data) => {
          if (err) {
            reject(err);
          } else {
            this.fileUploadModel.deleteOne({ _id: id })
              .exec()
              .then(() => resolve())
              .catch(reject);
          }
        });
      });
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1061' }, '1061');
    } catch (error) {
      return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1062' }, '1062');
    }
  }


}
