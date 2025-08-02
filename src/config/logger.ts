import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const traceId = uuidv4(); 
    request['traceId'] = traceId;
    const startTime = new Date();
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const logObject = {
        level: statusCode === 401 ? 'error' : 'info',
        message: `${traceId} ${ip} [${endTime.toISOString()}] "${method} ${originalUrl} HTTP/1.1" ${statusCode} ${duration.toFixed(3)} ms - ${contentLength}`,
      };

      this.logger.log(JSON.stringify(logObject));
    });

    next();
  }
}






























































// import { Injectable, LoggerService, Scope } from '@nestjs/common';
// import * as winston from 'winston';
// import * as DailyRotateFile from 'winston-daily-rotate-file';
// import * as appRoot from 'app-root-path';

// @Injectable({ scope: Scope.TRANSIENT })
// export class CustomLoggerService implements LoggerService {
  
//   private readonly logger: winston.Logger;

//   constructor() {
//     const options = {
//       dailyRotateErrorFile: {
//         filename: `${appRoot}/logs/app.error-%DATE%.log`,
//         datePattern: 'YYYY-MM-DD'
//       },
//       dailyRotateFile: {
//         filename: `${appRoot}/logs/app.info-%DATE%.log`,
//         datePattern: 'YYYY-MM-DD'
//       },
//       console: {
//         level: 'info',
//         handleExceptions: true,
//         json: false,
//         colorize: true
//       }
//     }
// console.log("options-----------------------------------------------------------------",options.console)
//     const fileOptions: DailyRotateFile.DailyRotateFileTransportOptions = {
//       filename: `${appRoot}/logs/app.info-%DATE%.log`,
//       datePattern: 'YYYY-MM-DD',
//       format: winston.format.json(),
//     };
// console.log("fileOptions-----------------------------------------------------------------", fileOptions);

//     this.logger = winston.createLogger({
//       transports: [
//         new winston.transports.Console(options.console),
//         new DailyRotateFile(fileOptions),
//       ],
//       exitOnError: false,
//     });
//   }

//   log(message: string) {
//     console.log('Calling log method'); 
//     this.logger.log('info', message);
//   }

//   error(message: string, trace: string) {
//     console.log('Calling log method22',message); 
//     this.logger.error(message, { trace });
//   }

//   warn(message: string) {
//     this.logger.warn(message);
//   }

//   debug(message: string) {
//     this.logger.debug(message);
//   }

//   verbose(message: string) {
//     this.logger.verbose(message);
//   }
// }

