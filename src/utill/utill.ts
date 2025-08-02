import * as jwt from 'jsonwebtoken';
import { ERROR_CODES } from 'src/libs/constants';
import * as moment from 'moment'

let studentIdCounter = 1;

export function generateStudentId(): string {
  const paddedCounter = `000${studentIdCounter}`.slice(-4);
  const studentId = `stu${paddedCounter}`;
  studentIdCounter++;
  return studentId;
}


export function extractTokenFromHeaders(headers: any): string | null {
  const authHeader = headers.authorization;
  if (!authHeader) {
    return null;
  }
  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return null;
  }
  return token;
}


export function verifyAndExtractToken(headers: any) {
  const authHeader = headers.authorization;
  if (!authHeader) {
    return null;
  }
  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return null;
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    return decoded
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return null;
  }
}

export function decodeJWTToken(headers: any) {
  const authHeader = headers.authorization;
  if (!authHeader) {
    return null;
  }
  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return null;
  }
  return jwt.decode(token);
}

export function decodeTokenForPayment(token: string) {
  if (!token) {
    return null;
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    return decoded
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return null;
  }
}

export const calculateMegathilPoints = (
  moduleMVP: number,
  baseMVP: number,
  extraTimeTakenInMins: number,
  accuracyPercentage: number,
  lastLoginHours: number
) => {
  let penalities = [];
  // Base number of trophies awarded for completing a level
  if (moduleMVP === 0) return { mvp: moduleMVP, penalities: [] };
  let mvp = moduleMVP;

  // Reduce mvp based on time taken
  // Reduce 1 trophy for every 2 minutes over the target
  const timePenality = extraTimeTakenInMins / 2;
  mvp = mvp - timePenality;

  penalities.push({ reason: 'The penalty for taking extra time.', penality: timePenality });

  // Reducing mvp based on accuracy
  // Reduce 1 trophy for every 2% decrease in accuracy
  if (accuracyPercentage) {
    const accuracyPenality = (100 - accuracyPercentage) / 2;
    mvp = mvp - accuracyPenality;
  }

  penalities.push({ reason: 'The penalty for compromising accuracy.', penality: timePenality });

  if (lastLoginHours > 24) {
    mvp = mvp - 2;
    penalities.push({ reason: 'The penalty for not active for more than 24 hours.', penality: 2 });
  }

  // Reduce mvp based on retries
  // using sum of series to calculate retry penality
  // let retryPenality = 0;
  // for (let i = 1; i <= retries; i++) {
  //   retryPenality = retryPenality + i;
  // }
  // mvp = mvp - retryPenality;

  // Ensuring user atleast have the basic mvp
  mvp = Math.max(mvp, baseMVP);

  return { mvp, penalities };
}

export const sanitizeUpdateData = (data: any) => {
  for (const key in data) {
    if (data[key] === "") {
      data[key] = null;
    }
  }
  return data;
};

export const removeNullNodes = (data: any) => {
  const result = {};
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  return result;
}

export function getErrorCode(existing: any, createDto: any) {
  if (existing) {
    for (const [key, errorCode] of Object.entries(ERROR_CODES)) {
      if (existing[key] === createDto[key]) {
        return errorCode;
      }
    }
  }
  return null;
}


export const validateDOB = (dob: string) => {
  const userDOB = moment.utc(dob);
  const minDateDOB = moment.utc().subtract(16, 'years');
  return userDOB.isBefore(minDateDOB);
}

export const generateReferralCode = () => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i <= 16; i++) {//referral code length is 16
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  return code;
}

export const generateCertificateId = () => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i <= 16; i++) {//referral code length is 16
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  return code;
}

export const generatePromotorPassCode = () => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i <= 8; i++) {//referral code length is 8
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  return code;
}

export const xpMilestones = [
  { xp: 10000, gems: 10 },
  { xp: 25000, gems: 15 },
  { xp: 50000, gems: 25 },
  { xp: 75000, gems: 50 },
  { xp: 100000, gems: 100 },
];