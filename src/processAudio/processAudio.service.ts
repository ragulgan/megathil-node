import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AxiosResponse } from "axios";
import { Model } from 'mongoose';
import { lastValueFrom } from "rxjs";
import { Modules } from "src/module/module.schema";
import { Question } from "src/question/question.schema";
import { QuestionResponse } from "src/questionResponse/questionResponse.schema";
import { Unit } from "src/unit/unit.schema";
import { UserProgressStatusDto } from "src/users/dto/userProgressStatus.dto";
import { UserProgressStatus } from "src/users/userProgressStatus.schema";
import { User } from "src/users/users.schema";
import { UserActivity } from "src/users/usersActivites.schema";
import { UserScoreHistories } from "src/users/userScoreHistory.schema";
import { UserScores } from "src/users/userScores.schema";
import { userLearningHistory } from "src/userUnitHistory/userUnitHistory.schema";
import { calculateMegathilPoints, generateCertificateId } from "src/utill/utill";
import { CertificateDTO } from "./dto/certificate.dto";
import { CertificateService } from "src/certificateGeneration/certificate/certificate.service";
import { MailService } from "src/certificateGeneration/mail/mail.service";
const mongoose = require('mongoose');
const moment = require('moment');


/* #########################
IMPORTANT 
whatever changes done in this  processAudio() method should be applied in
src\questionResponse\questionResponse.service.ts processUserAnswers(), vice versa.
*/

@Injectable()
export class ProcessAudioService {
  constructor(
    @InjectModel(QuestionResponse.name) private questionResponseModel: Model<QuestionResponse>,
    @InjectModel(userLearningHistory.name) private userUnitHistoryModel: Model<userLearningHistory>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(UserProgressStatus.name) private usersProgressStatusModel: Model<UserProgressStatus>,
    @InjectModel(Modules.name) private modulesModel: Model<Modules>,
    @InjectModel(UserScores.name) private userScoresModel: Model<UserScores>,
    @InjectModel(User.name) private usersModel: Model<User>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivity>,
    @InjectModel(UserScoreHistories.name) private userScoreHistoryModel: Model<UserScoreHistories>,
    @InjectModel(Unit.name) private unitsModel: Model<Unit>,
    private httpService: HttpService,
    private readonly certificateService: CertificateService,
    private readonly mailService: MailService,
  ) { }

  async getUserById(userId: string) {
    return await this.usersModel.findById(userId)
      .populate('city', 'cityName')
      .populate('course', 'name')
      .populate('department', 'name')
      .populate('college', 'name');
  }

  async processAudio(decodedToken: any, body: any, responseData: any) {
    let currentUserProgressStatusId = null;
    let attempt = 1;
    let userUnitHistorySaved;

    if (decodedToken.id && body?.unitId && body?.moduleId && body?.questionId) {
      const latestAttempt = await this.userUnitHistoryModel.findOne({
        userId: decodedToken.id,
        unitId: body?.unitId,
        moduleId: body?.moduleId,
        questionId: body?.questionId,
      }).sort({ attempt: -1 }).limit(1);
      attempt = latestAttempt ? latestAttempt.attempt + 1 : 1;
    }

    const tempScore = (responseData?.content_relavency?.Relevance_rating || 0) +
      (responseData?.voacablary_level?.Vocabulary_rating || 0);

    let retryPenality = 0;
    if (attempt === 2) {
      retryPenality = 0.25;
    } else if (attempt === 3) {
      retryPenality = 0.5;
    } else if (attempt > 3 && attempt <= 5) {
      retryPenality = 0.75;
    } else if (attempt > 5 && attempt <= 8) {
      retryPenality = 1.0;
    } else if (attempt > 8 && attempt <= 13) {
      retryPenality = 1.25;
    } else if (attempt > 13 && attempt <= 21) {
      retryPenality = 1.5;
    } else if (attempt > 21) {
      retryPenality = 1.75;
    }

    let score = 0;
    const finalPenality = retryPenality;
    if (tempScore > 3 && tempScore > finalPenality) {
      score = tempScore > 0 && tempScore > finalPenality ? tempScore - finalPenality : 3;
    }

    if (decodedToken.id && body?.unitId && body?.moduleId && body?.questionId) { // if req body has question details
      const conditionForQuestions = {
        moduleId: body?.moduleId,
        status: 'ACTIVE'
      }
      const questions = await this.questionModel.find(conditionForQuestions)
        .populate('questionType', 'id displayName displayValue')
        .populate('templateType', 'id displayName displayValue').exec();

      userUnitHistorySaved = await this.userUnitHistoryModel.create({
        userId: decodedToken.id,
        unitId: body?.unitId,
        moduleId: body?.moduleId,
        questionId: body?.questionId,
        score: score,
        attempt: attempt
      });

      // calculating questions length
      const moduleInstructions = questions.filter((i: any) => i.questionType.displayValue === 'moduleInstruction');
      const moduleQuestions = questions.filter((i: any) => i.questionType.displayValue === 'Modulequestions');
      const instructionsCount = moduleInstructions.length;
      const questionsCount = moduleQuestions.length;
      const totalItemCount = instructionsCount + questionsCount;
      const instructionIds = moduleInstructions.map((i: any) => i.id);
      const questionIds = moduleQuestions.map((i: any) => i.id);

      // preparing user learning status data
      const userProgressStatusDto: UserProgressStatusDto = {
        userId: new mongoose.Types.ObjectId(decodedToken.id),
        unitId: new mongoose.Types.ObjectId(body?.unitId),
        moduleId: new mongoose.Types.ObjectId(body?.moduleId),
        currentQuestionId: new mongoose.Types.ObjectId(body?.questionId),
        parentOptionId: null,
        completedInstructionsCount: 0,
        totalInstructionsCount: instructionsCount,
        completedQuestionsCount: 0,
        totalQuestionsCount: questionsCount,
        completedCount: 0,
        totalCount: totalItemCount,
        completedPercentage: 0,
        instructionIds: instructionIds,
        questionIds: questionIds,
        completedInstructionIds: [],
        completedQuestionIds: [],
        status: 'INPROGRESS'
      };

      // getting module details
      const moduleIdData: any = await this.modulesModel.findOne({ _id: body?.moduleId })
        .populate('xpId', "value")
        .populate('megathilPoints', 'value')
        .populate("gems", "value")
        .populate('templateType')
        .exec();

      // checking current question type
      const filteredQuestion: any[] = questions.filter((i: any) => i.id === body?.questionId);
      const currentQuestionType = filteredQuestion[0].questionType?.displayValue;

      if (body?.userProgressStatusId) {
        currentUserProgressStatusId = body?.userProgressStatusId;
        const match = { // preparing condition for getting userProgessStatus id
          _id: body?.userProgressStatusId,
          userId: decodedToken.id,
          unitId: body?.unitId,
          moduleId: body?.moduleId,
        }
        const moduleInProgress = await this.usersProgressStatusModel.findOne(match);
        if (moduleInProgress) {
          userProgressStatusDto.completedInstructionIds = moduleInProgress.completedInstructionIds &&
            moduleInProgress.completedInstructionIds.length ? moduleInProgress.completedInstructionIds : [];
          userProgressStatusDto.completedQuestionIds = moduleInProgress.completedQuestionIds &&
            moduleInProgress.completedQuestionIds.length ? moduleInProgress.completedQuestionIds : [];

          if (currentQuestionType === 'moduleInstruction') {
            if (!userProgressStatusDto.completedInstructionIds.includes(body?.questionId)) {
              userProgressStatusDto.completedInstructionIds.push(body?.questionId);
            }
          } else if (currentQuestionType === 'Modulequestions') {
            if (!userProgressStatusDto.completedQuestionIds.includes(body?.questionId)) {
              userProgressStatusDto.completedQuestionIds.push(body?.questionId);
            }
          }

          userProgressStatusDto.completedInstructionsCount = userProgressStatusDto.completedInstructionIds.length;
          userProgressStatusDto.completedQuestionsCount = userProgressStatusDto.completedQuestionIds.length;

          const totalCompleted = userProgressStatusDto.completedInstructionsCount + userProgressStatusDto.completedQuestionsCount;
          const totalToBeCompleted = instructionsCount + questionsCount;
          userProgressStatusDto.completedPercentage = Number(((totalCompleted * 100) / totalToBeCompleted).toFixed(2));


          if ((userProgressStatusDto.completedInstructionsCount + userProgressStatusDto.completedQuestionsCount) >= (instructionsCount + questionsCount)) { // check module completed
            userProgressStatusDto.status = 'COMPLETED';

            this.checkAndIssueCertificate(body?.unitId, body?.moduleId, decodedToken.id, decodedToken, body?.questionId).then(() => { }).catch((e) => { console.log("Error:", e) });

            const accuracyPercentage = (score / 200) * 100;

            // calculating last activity hours
            let lastLoginHours = 0;
            const lastactivity: any[] = await this.userActivityModel.find({ userId: decodedToken.id }).sort({ createdAt: -1 }).skip(1).limit(1);
            if (lastactivity && lastactivity.length) {
              const lastactivityTime = moment.utc(lastactivity[0].createdAt);
              const currentTime = moment.utc();
              lastLoginHours = currentTime.diff(lastactivityTime, 'hours');
            }

            const scoreData: any = calculateMegathilPoints(moduleIdData?.megathilPoints?.value || 0, 10, 0, accuracyPercentage || 0, lastLoginHours)
            const megathilPoints = Math.floor(scoreData?.mvp);
            const userScore = await this.userScoresModel.findOne({ userId: decodedToken.id, unitId: body?.unitId, moduleId: body?.moduleId });
            let comments = "Updating latest high Megathil value points for completing the module.";
            if (userScore) { // checking if user score already present for that module.
              if (megathilPoints > userScore.megathilPoints) { // if recent score is higher than previous score.
                const updatedPoints = megathilPoints - userScore.megathilPoints;
                this.userScoresModel.updateOne({ _id: userScore._id }, {
                  userId: decodedToken.id, unitId: body?.unitId, moduleId: body?.moduleId, megathilPoints: megathilPoints
                }).then(() => { }); // addding user score for module
                await this.usersModel.findOneAndUpdate({ _id: decodedToken.id }, {
                  $inc: { 'megathilPoints': updatedPoints, 'xpValue': (moduleIdData?.xpId?.value || 0) }, // updating megathil points & xp value
                }, { new: true });
              } else {
                comments = "Keeping the last highest Megathil value points as current score is lower than you high score.";
                await this.usersModel.findOneAndUpdate({ _id: decodedToken.id }, {
                  $inc: { 'xpValue': (moduleIdData?.xpId?.value || 0) }, // updating megathil points & xp value
                }, { new: true });
              }
            } else {
              this.userScoresModel.create({
                userId: decodedToken.id, unitId: body?.unitId, moduleId: body?.moduleId, megathilPoints: megathilPoints
              }).then(() => { }); // addding user score for module
              await this.usersModel.findOneAndUpdate({ _id: decodedToken.id }, {
                $inc: { 'megathilPoints': megathilPoints, 'xpValue': (moduleIdData?.xpId?.value || 0) }, // updating megathil points & xp value
              }, { new: true });
            }

            // saving the user score history
            this.userScoreHistoryModel.create({
              userId: decodedToken.id,
              unitId: body?.unitId,
              moduleId: body?.moduleId,
              gems: moduleIdData?.xpId?.value || 0,
              xp: moduleIdData?.xpId?.value || 0,
              moduleMVP: moduleIdData.megathilPoints?.value || 0,
              scoredMVP: megathilPoints,
              penalities: scoreData.penalities,
              comments: comments
            }).then(() => { });

            // calculating achievements is pending

            try {// udating user activity for module completion
              const params = {
                userId: decodedToken.id,
                activity: "Completed the lesson & activities in module " + moduleIdData.moduleName,
                action: 'module_completed',
                shortDescription: "Completed the lesson & activities in module " + moduleIdData.moduleName,
                unitId: body?.unitId,
                moduleId: body?.moduleId
              };
              this.userActivityModel.create(params).then(() => { });
            } catch { }
          } // end module completed
          this.usersProgressStatusModel.updateOne({ _id: moduleInProgress.id }, userProgressStatusDto).then(() => { });
        }
      } else {
        userProgressStatusDto.completedCount = 1;
        if (currentQuestionType === 'moduleInstruction') {
          userProgressStatusDto.completedInstructionIds.push(body?.questionId);
          userProgressStatusDto.completedInstructionsCount = userProgressStatusDto.completedInstructionIds.length;
        } else if (currentQuestionType === 'Modulequestions') {
          userProgressStatusDto.completedQuestionIds.push(body?.questionId);
          userProgressStatusDto.completedQuestionsCount = userProgressStatusDto.completedQuestionIds.length;
        }
        const totalCompleted = userProgressStatusDto.completedInstructionsCount + userProgressStatusDto.completedQuestionsCount;
        const totalToBeCompleted = instructionsCount + questionsCount;
        userProgressStatusDto.completedPercentage = Number(((totalCompleted * 100) / totalToBeCompleted).toFixed(2));
        const moduleStatusData = await this.usersProgressStatusModel.create(userProgressStatusDto);
        currentUserProgressStatusId = moduleStatusData ? moduleStatusData.id : null;

        try {
          const params = {
            userId: decodedToken.id,
            activity: "Started the lesson & activities in module " + moduleIdData.moduleName,
            action: 'module_started',
            shortDescription: "Started the lesson & activities in module " + moduleIdData.moduleName,
            unitId: body?.unitId,
            moduleId: body?.moduleId
          };
          this.userActivityModel.create(params).then(() => { });
        } catch { }
      }
      console.log("userProgressStatusDto####", userProgressStatusDto);
    } // end if req body has question details

    console.log("responseData", responseData)

    this.questionResponseModel.create({
      userId: decodedToken.id,  // User ID
      unitId: body?.unitId,  // Unit ID reference
      moduleId: body?.moduleId,  // Module ID reference
      questionId: body?.questionId,  // Question ID reference
      answers: body?.answers,  // Array of selected answer IDs (if applicable)
      contentRelevanceRating: responseData?.contentRelevanceRating,  // Rating for content relevance
      contentRelevanceRatingReason: responseData?.contentRelevanceRatingReason,  // Reason for content relevance rating
      emotionRecognition: {
        label: responseData?.emotionRecognition?.label,  // Label for emotion recognition
        score: responseData?.emotionRecognition?.score   // Score for emotion recognition
      },
      enhancedText: responseData?.enhancedText,  // Enhanced text (if available)
      fluencyLevel: {
        label: responseData?.fluencyLevel?.label,  // Fluency level label
        score: responseData?.fluencyLevel?.score   // Fluency level score
      },
      transcription: {
        text: responseData?.transcription?.text   // Transcribed text (if applicable)
      },
      vocabularyRating: responseData?.vocabularyRating,  // Vocabulary rating
      vocabularyRatingReason: responseData?.vocabularyRatingReason,  // Reason for vocabulary rating
      speechRate: responseData?.speechRate,
      yourScore: score,  // Score obtained by the user
      maxScore: 200,  // Maximum score possible
      userLearningHistoryId: userUnitHistorySaved?._id,  // Reference to user learning history
      userProgressStatusId: currentUserProgressStatusId, // Reference to user progress status
      attempt: attempt
    }).then(() => {
      console.log("Question response saved!");
    }).catch((error) => {
      console.error("Error saving question response:", error);
    });

    return true;
  }

  async checkAndIssueCertificate(unitId: string, moduleId: string, userId: string, decodedToken: any, questionId: any) {
    try {
      const user = await this.usersModel.findById(decodedToken.id);
      if (!user.certificateIssued) {
        const lastUnit = await this.unitsModel.aggregate([
          { $match: { status: 'ACTIVE' } },
          { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
          { $sort: { displayOrderNum: -1 } },
          { $limit: 1 }
        ]);

        const ObjectId = mongoose.Types.ObjectId;

        if (lastUnit.length && lastUnit[0]._id.toString() === unitId) {
          const lastModule = await this.modulesModel.aggregate([
            { $match: { status: 'ACTIVE', unitId: new ObjectId(unitId) } },
            { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
            { $sort: { displayOrderNum: -1 } },
            { $limit: 1 }
          ]);

          const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

          const userScores = await this.userScoreHistoryModel.aggregate([
            {
              $match: { userId: new ObjectId(userId) }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $group: {
                _id: { unitId: "$unitId", moduleId: "$moduleId" },
                scoredMVP: { $first: "$scoredMVP" },
                moduleMVP: { $first: "$moduleMVP" },
              }
            },
            {
              $group: {
                _id: null,
                totalScoredMVP: { $sum: "$scoredMVP" },
                totalModuleMVP: { $sum: "$moduleMVP" }
              }
            }
          ]);

          let percentageScore = 0;
          if (userScores.length > 0 && userScores[0].totalModuleMVP > 0) {
            const totalScoredMVP = userScores[0].totalScoredMVP;
            const totalModuleMVP = userScores[0].totalModuleMVP;

            percentageScore = (totalScoredMVP / totalModuleMVP) * 100;
            percentageScore = Math.round(percentageScore);
          }
          const fullName = `${capitalize(decodedToken.firstName)} ${capitalize(decodedToken.lastName)}`;

          if (lastModule.length && lastModule[0]._id.toString() === moduleId) {
            const lastQuestion = await this.questionModel.aggregate([
              {
                $match: {
                  status: 'ACTIVE',
                  moduleId: new ObjectId(moduleId),
                }
              },
              {
                $lookup: {
                  from: 'questiontypes',
                  localField: 'questionType',
                  foreignField: '_id',
                  as: 'questionType'
                }
              },
              { $unwind: "$questionType" },
              {
                $match: {
                  "questionType.displayValue": { $in: ["moduleInstruction", "Modulequestions"] }
                }
              },
              { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
              { $sort: { displayOrderNum: -1 } },
              { $limit: 1 }
            ]);

            const lastQuestionId = lastQuestion[0]?._id.toString();
            if (lastQuestionId && questionId === lastQuestionId) {
              try {
                const { filePath: certPath } = await this.certificateService.generate(userId, fullName);
                await this.mailService.sendCertificate(decodedToken.email, fullName, certPath);

                await this.usersModel.updateOne(
                  { _id: userId },
                  {
                    $set: {
                      certificateIssued: true,
                    }
                  }
                );
              } catch (err) {
                console.error('Certificate generation/email failed:', err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during certificate issuance process:", error.message);
    }
  }

}