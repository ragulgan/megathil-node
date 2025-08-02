import { Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  getHello(): string {
    return 'Hello World!';
  }
  
  getInstructions(filename: string) {
    try {
      const baseUrl = this.configService.get<string>('IMAGE_URL');
      const filePath = path.resolve(__dirname, `../static/megathil_json/${filename}`);
      const raw = fs.readFileSync(filePath, 'utf-8');

      const replaced = raw.replace(/\$\{IMAGE_URL\}/g, baseUrl);
      const json = JSON.parse(replaced);
      return json;
    } catch (error) {
      console.error(`Error loading JSON file (${filename}):`, error.message);
      throw error;
    }
  }
}
