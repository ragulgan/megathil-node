

import { Injectable } from '@nestjs/common';
import { appConst } from '../libs/constants';
import { apimsgconfig } from '../libs/api_message'
const { en } = apimsgconfig;
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@Injectable()
export class ResponseService {
  private responseFormat(): any {
    return {
      code: '',
      messageCode: '',
      // message: '',
      data: {}
    }
  }

  errorResponse(req: any, error: any, messageCode: any) {
    const response = this.responseFormat();
    response.code = ERROR.CODE;
    response.messageCode = messageCode;
    if (_.has(error, 'code')) {
      response.message = apimsgconfig.en[error.code] || error;
    } else {
      response.message = error
    }

    if (_.has(error, 'data')) {
      response.data = error.data;
    } else {
      delete response.data;
    }

    if (_.has(error, 'message')) {
      response.message = error.message;
    }
    return response;
  }

  successResponse(req: any, success: any, messageCode: any) {
    const response = this.responseFormat();
    response.code = SUCCESS.CODE;
    response.messageCode = messageCode;
    if (_.has(success, 'count')) {
      response.count = success.count;
    } else {
      delete response.count;
    }

    if (_.has(success, 'message')) {
      response.message = success.message;
    } else {
      delete response.message;
    }

    if (_.has(success, 'code')) {
      response.message = apimsgconfig.en[success.code];
    } else {
      delete response.code;
    }

    if (_.has(success, 'data')) {
      response.data = success.data;
    } else {
      delete response.data;
    }
    return response;
  }

  sendResponse(req: any, res: any, statusCode: number, resToSend: any, messageCode: any) {
    let response = {};
    if (statusCode !== SUCCESS.CODE) {
      response = this.errorResponse(req, resToSend, messageCode);
    } else {
      response = this.successResponse(req, resToSend, messageCode);
    }
    return res.status(statusCode).json(response);
  }
}

