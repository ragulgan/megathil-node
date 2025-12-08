import { Injectable } from '@nestjs/common';
import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import { registerFont } from 'canvas';

@Injectable()
export class CertificateService {

 constructor() {
  const fontPath = path.join(process.cwd(), 'src', 'fonts', 'DMSerifText-Regular.ttf');
  if (fs.existsSync(fontPath)) {
   registerFont(fontPath, { family: 'DM Serif Text' });
  } else {
   console.warn('Font not found:', fontPath);
  }
 }

 async generate(userId: string, userName: string): Promise<{ filePath: string }> {
  const templatePath = path.join(process.cwd(), 'static', 'masserts', 'certificate', 'certificate.png');
  const template = await loadImage(templatePath);
  const width = template.width;
  const height = template.height;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(template, 0, 0, width, height);
  ctx.font = '75px "DM Serif Text"';
  ctx.lineWidth = 8.5;
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  for (let offset = -1; offset <= 1; offset++) {
   ctx.fillText(userName.toUpperCase(), width / 2 + offset, 1190);
   ctx.fillText(userName.toUpperCase(), width / 2, 1190 + offset);
  }

  const issueDate = new Date();
  const issuedDateStr = `${issueDate.getDate().toString().padStart(2, '0')}-${(issueDate.getMonth() + 1)
   .toString()
   .padStart(2, '0')}-${issueDate.getFullYear()}`;
  const qrContent = `Name: ${userName.toUpperCase()}, ID: ${userId}, IssuedOn: ${issuedDateStr}`;

  const qrDataUrl = await QRCode.toDataURL(qrContent);
  const qrImage = await loadImage(qrDataUrl);
  const qrSize = 300;
  const qrX = 240;
  const qrY = height - 630;
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
  const outputDir = path.join(__dirname, '..', 'certificates');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const fileName = `${userId}.png`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
  return { filePath };
 }
}