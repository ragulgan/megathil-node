import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionResponse } from './questionResponse.schema';
import { userLearningHistory } from '../userUnitHistory/userUnitHistory.schema';
import { Question } from '../question/question.schema';
import { Options } from '../options/options.schema';
import { CreateQuestionResponseDto } from './dto/createQuestionResponse.dto';
import { Unit } from '../unit/unit.schema';
import { Modules } from '../module/module.schema';
import { User } from '../users/users.schema';
import * as _ from 'lodash';
import { UsersService } from 'src/users/users.service';
import { UserProgressStatus } from 'src/users/userProgressStatus.schema';
import { UserProgressStatusDto } from 'src/users/dto/userProgressStatus.dto';
import { calculateMegathilPoints, generateCertificateId } from 'src/utill/utill';
import { Achievements } from 'src/achievements/achievements.schema';
import { UserScores } from 'src/users/userScores.schema';
import { UserScoreHistories } from 'src/users/userScoreHistory.schema';
import { HttpService } from '@nestjs/axios';
import { UserAchievement } from 'src/users/userAchievement.schema';
import { CertificateService } from 'src/certificateGeneration/certificate/certificate.service';
import { MailService } from 'src/certificateGeneration/mail/mail.service';
const mongoose = require('mongoose');
const moment = require('moment');

interface QuestionType {
  id: string;
  displayName: string;
}

interface QuestionData {
  moduleId: string;
  questionType: QuestionType; // Specify the type of questionType
  // Other fields...
}

/* #########################
IMPORTANT 
whatever changes done in this processUserAnswers() method should be applied in
src\processAudio\processAudio.service.ts processAudio(), vice versa.
*/


@Injectable()
export class QuestionResponseService {
  constructor(
    @InjectModel(QuestionResponse.name) private QuestionResponseModel: Model<QuestionResponse>,
    @InjectModel(userLearningHistory.name) private userUnitHistoryModel: Model<userLearningHistory>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Options.name) private optionsModel: Model<Options>,
    @InjectModel(Unit.name) private unitsModel: Model<Unit>,
    @InjectModel(Modules.name) private modulesModel: Model<Modules>,
    @InjectModel(User.name) private usersModel: Model<User>,
    @InjectModel(UserProgressStatus.name) private usersProgressStatusModel: Model<UserProgressStatus>,
    @InjectModel(Achievements.name) private achievementsModel: Model<Achievements>,
    @InjectModel(UserScores.name) private userScoresModel: Model<UserScores>,
    @InjectModel(UserScoreHistories.name) private userScoreHistoryModel: Model<UserScoreHistories>,
    @InjectModel(UserAchievement.name) private userAchievementModel: Model<UserAchievement>,
    private readonly usersService: UsersService,
    private readonly certificateService: CertificateService,
    private readonly mailService: MailService,
    private httpService: HttpService
  ) { }

  // this service handles the processing user answers for question
  async processUserAnswers(createQuestionResponseDto: CreateQuestionResponseDto, userId: string, decodedToken: any) {
    const { userProgressStatusId, unitId, moduleId, questionId, answers, parentOptionId } = createQuestionResponseDto;
    const ObjectId = mongoose.Types.ObjectId;
    let currentUserProgressStatusId = '';

    /**** commented for time optimization *****/
    // try {
    //   await this.documentExists(this.usersModel, userId, 'User');
    //   await this.documentExists(this.unitsModel, unitId, 'Unit');
    //   await this.documentExists(this.modulesModel, moduleId, 'Module');
    //   await this.documentExists(this.questionModel, questionId, 'Question');
    // } catch (error) {
    //   throw new Error(`${error.message}`)
    // }
    const userQuestionId = new ObjectId(questionId);
    const aggregationResult = await this.questionModel.aggregate([
      {
        $match: {
          _id: userQuestionId,
        },
      },
      {
        $lookup: {
          from: 'questiontypes',
          localField: 'questionType',
          foreignField: '_id',
          as: 'questionType',
        },
      },
      {
        $unwind: '$questionType',
      },
      {
        $lookup: {
          from: "templatetypes",
          localField: "templateType",
          foreignField: "_id",
          as: "templateType"
        },
      },
      {
        $unwind: '$templateType',
      },
    ]);

    const questionData = aggregationResult.length > 0 ? aggregationResult[0] : null
    let questionWithOptions: any[]
    if (questionData && questionData?.questionType && questionData?.questionType?.displayValue === "Modulequestions") {
      questionWithOptions = await this.questionModel.aggregate([
        { $match: { _id: userQuestionId } },
        {
          $lookup: {
            from: 'options',
            localField: '_id',
            foreignField: 'questionId',
            as: 'options',
          },
        },
        {
          $match: { 'options.validOption': "true" }
        }
      ]);
      const validOptionIds = questionWithOptions.length ? questionWithOptions[0]?.options.map((option: any) => option._id.toString()) : [];
      const matchingOptionIds = answers.filter(answer => validOptionIds.includes(answer));
      if (questionData && questionData.templateType && (questionData?.templateType?.displayValue === "qnDragDrop" || questionData?.templateType?.displayValue === "resumeDetailCorrection")) {
        const objectIdArray = matchingOptionIds.map(id => new ObjectId(id));
        const optionsData: any[] = await this.optionsModel.find({ _id: { $in: objectIdArray } })
          .populate('xpId', "value")
          .exec();
        const totalXpValue = optionsData.reduce((accumulator, option) => accumulator + (option?.xpId?.value || 0), 0);
        // have to add megathil points too here 
        this.usersModel.findOneAndUpdate(
          { _id: userId },
          {
            $inc: { 'xpValue': totalXpValue },
          },
          { new: true }
        ).then(() => { });
      }
    } else {
      questionWithOptions = await this.questionModel.aggregate([
        { $match: { _id: userQuestionId } },
        {
          $lookup: {
            from: 'options',
            localField: '_id',
            foreignField: 'questionId',
            as: 'options',
          },
        }
      ]);
    }
    const validOptionIds = questionWithOptions.length ? questionWithOptions[0]?.options.map((option: any) => option._id.toString()) : [];
    const matchingOptionIds = answers.filter(answer => validOptionIds.includes(answer));

    const latestAttempt = await this.userUnitHistoryModel.findOne({
      userId,
      unitId,
      moduleId,
      questionId,
    }).sort({ attempt: -1 }).limit(1);
    const attempt = latestAttempt ? latestAttempt.attempt + 1 : 1;

    // calculating score for accuracy
    // Reduce trophies based on retries
    // calulating attempt penality based on fibanacci increment
    // penality increases as fibancci number increaces
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

    // score value is calculated with static odd number value 7, it is nothing but to calculate accuracy percentage later.
    const maxScore = validOptionIds.length * 7;
    const tempScore = matchingOptionIds.length * 7;
    let score = 0;
    const finalPenality = retryPenality;
    if (tempScore > 3 && tempScore > finalPenality) {
      score = tempScore > 0 && tempScore > finalPenality ? tempScore - finalPenality : 3;
    }

    try {
      const conditionForQuestions = {
        moduleId: moduleId,
        status: 'ACTIVE'
      }
      if (parentOptionId) {
        conditionForQuestions['parentOptionId'] = parentOptionId;
      }
      const questions = await this.questionModel.find(conditionForQuestions).populate('questionType', 'id displayName displayValue').populate('templateType').exec();

      const createUserHistoryDto = {
        ...createQuestionResponseDto,
        userId: userId,
        score,
        userAnswers: answers,
        attempt,
      }
      const data = await this.userUnitHistoryModel.create(createUserHistoryDto);
      // calculating questions length
      const moduleInstructions = questions.filter((i: any) => i.questionType.displayValue === 'moduleInstruction');
      const moduleQuestions = questions.filter((i: any) => i.questionType.displayValue === 'Modulequestions');
      const instructionsCount = moduleInstructions.length;
      const questionsCount = moduleQuestions.length;
      const totalItemCount = instructionsCount + questionsCount;
      const instructionIds = moduleInstructions.map((i: any) => i.id);
      const questionIds = moduleQuestions.map((i: any) => i.id);

      let filteredQuestion
      if (_.isEmpty(parentOptionId)) {
        filteredQuestion = questions.filter((i: any) => i.id === questionId);
      } else {
        filteredQuestion = questionData.hasChildrens ? questions : questions.filter((i: any) => i.id === questionId);
      }
      const currentQuestionType = questionData.hasChildrens ? questionData && questionData?.questionType && questionData?.questionType?.displayValue : filteredQuestion[0].questionType?.displayValue;

      let addNewProgressStatus = false;

      // preparing user learning status data
      const userProgressStatusDto: UserProgressStatusDto = {
        userId: new mongoose.Types.ObjectId(userId),
        unitId: new mongoose.Types.ObjectId(unitId),
        moduleId: new mongoose.Types.ObjectId(moduleId),
        currentQuestionId: new mongoose.Types.ObjectId(questionId),
        parentOptionId: parentOptionId,
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

      if (userProgressStatusId) { // update module status
        currentUserProgressStatusId = userProgressStatusId;
        const match = { // preparing condition for getting userProgessStatus id
          _id: userProgressStatusId,
          userId: userId,
          unitId: unitId,
          moduleId: moduleId,
        }
        if (parentOptionId) {
          match['parentOptionId'] = parentOptionId;
        }
        // reading the user module status using module status id userProgressStatusId
        const moduleInProgress = await this.usersProgressStatusModel.findOne(match);
        if (moduleInProgress) {
          userProgressStatusDto.completedInstructionIds = moduleInProgress.completedInstructionIds && moduleInProgress.completedInstructionIds.length ? moduleInProgress.completedInstructionIds : [];
          userProgressStatusDto.completedQuestionIds = moduleInProgress.completedQuestionIds && moduleInProgress.completedQuestionIds.length ? moduleInProgress.completedQuestionIds : [];
          if (currentQuestionType === 'moduleInstruction') {
            if (!userProgressStatusDto.completedInstructionIds.includes(questionId)) {
              userProgressStatusDto.completedInstructionIds.push(questionId);
            }
          } else if (currentQuestionType === 'Modulequestions') {
            if (!userProgressStatusDto.completedQuestionIds.includes(questionId)) {
              userProgressStatusDto.completedQuestionIds.push(questionId);
            }
          }

          userProgressStatusDto.completedInstructionsCount = userProgressStatusDto.completedInstructionIds.length;
          userProgressStatusDto.completedQuestionsCount = userProgressStatusDto.completedQuestionIds.length;

          const totalCompleted = userProgressStatusDto.completedInstructionsCount + userProgressStatusDto.completedQuestionsCount;
          const totalToBeCompleted = instructionsCount + questionsCount;
          userProgressStatusDto.completedPercentage = Number(((totalCompleted * 100) / totalToBeCompleted).toFixed(2));

          if ((userProgressStatusDto.completedInstructionsCount + userProgressStatusDto.completedQuestionsCount) >= (instructionsCount + questionsCount)) {
            userProgressStatusDto.status = 'COMPLETED';
            //Dice Id Implementation
            this.awardAchievement(unitId, moduleId, userId).then(() => { }).catch((e) => { console.log("Error:", e) });

            this.checkAndIssueCertificate(unitId, moduleId, userId, decodedToken, questionId).then(() => { }).catch((e) => { console.log("Error:", e) });

            const moduleIdData: any = await this.modulesModel.findOne({ _id: moduleId })
              .populate('xpId', "value")
              .populate('megathilPoints', 'value')
              .populate("gems", "value")
              .populate('templateType')
              .exec();
            const xpIdData: any = moduleIdData.xpId;

            // updating trophyVaue
            const questionResponseResult = await this.QuestionResponseModel.find({ userId: userId, unitId: unitId, moduleId });
            let totalYourScore = 0;
            let totalMaxScore = 0;
            let finalAttempt = 1;
            questionResponseResult.map((item) => {
              totalYourScore += item?.yourScore ? Number(item?.yourScore) : 0;
              totalMaxScore += item?.maxScore ? Number(item?.maxScore) : 0;
              finalAttempt = Math.max(finalAttempt, Number(item.attempt));
            });
            const accuracyPercentage = (totalYourScore / totalMaxScore) * 100;

            // calculating last activity hours
            let lastLoginHours = 0;
            const lastactivity: any[] = await this.usersService.findUserRecentActiviy(userId);
            if (lastactivity && lastactivity.length) {
              const lastactivityTime = moment.utc(lastactivity[0].createdAt);
              const currentTime = moment.utc();
              lastLoginHours = currentTime.diff(lastactivityTime, 'hours');
            }

            const scoreData: any = calculateMegathilPoints(moduleIdData?.megathilPoints?.value || 0, 10, 0, accuracyPercentage || 0, lastLoginHours);
            const megathilPoints = scoreData?.mvp ? Math.floor(scoreData?.mvp) : 0;
            const userScore = await this.userScoresModel.findOne({ userId: userId, unitId: unitId, moduleId: moduleId });
            let comments = "Updating latest high Megathil value points for completing the module.";
            if (userScore) { // checking if user score already present for that module.
              if (megathilPoints > userScore.megathilPoints) { // if recent score is higher than previous score.
                const updatedPoints = megathilPoints - userScore.megathilPoints;
                this.userScoresModel.updateOne({ _id: userScore._id }, {
                  userId: userId, unitId: unitId, moduleId: moduleId, megathilPoints: megathilPoints
                }).then(() => { }); // addding user score for module
                await this.usersModel.findOneAndUpdate({ _id: userId }, {
                  $inc: { 'megathilPoints': updatedPoints, 'xpValue': (moduleIdData?.xpId?.value || 0) }, // updating megathil points & xp value
                }, { new: true });
              } else {
                comments = "Keeping the last highest Megathil value points as current score is lower than you high score.";
                await this.usersModel.findOneAndUpdate({ _id: userId }, {
                  $inc: { 'xpValue': (moduleIdData?.xpId?.value || 0) }, // updating megathil points & xp value
                }, { new: true });
              }
            } else {
              this.userScoresModel.create({
                userId: userId, unitId: unitId, moduleId: moduleId, megathilPoints: megathilPoints
              }).then(() => { }); // addding user score for module
              await this.usersModel.findOneAndUpdate({ _id: userId }, {
                $inc: { 'megathilPoints': megathilPoints, 'xpValue': (xpIdData?.value || 0) }, // updating megathil points & xp value
              }, { new: true });
            }

            if (moduleIdData?.megathilPoints?.value === 0) {
              comments = "No megathil value points awarded for this module.";
            }

            // saving the user score history
            this.userScoreHistoryModel.create({
              userId: userId,
              unitId: unitId,
              moduleId: moduleId,
              gems: moduleIdData?.xpId?.value || 0,
              xp: moduleIdData?.xpId?.value || 0,
              moduleMVP: moduleIdData?.megathilPoints?.value || 0,
              scoredMVP: megathilPoints,
              penalities: scoreData.penalities,
              comments: comments
            }).then(() => { });

            // calculating achievements is pending


            try {// udating user activity for module completion
              const params = {
                userId: userId,
                activity: "Completed the lesson & activities in module " + moduleIdData.moduleName,
                action: 'module_completed',
                shortDescription: "Completed the lesson & activities in module " + moduleIdData.moduleName,
                unitId: unitId,
                moduleId: moduleId
              };
              this.usersService.logUserActivity(params).then(() => { });
            } catch { }

          }
          this.usersProgressStatusModel.updateOne({ _id: moduleInProgress.id }, userProgressStatusDto).then(() => { });
        } else {
          addNewProgressStatus = true;
        }
      } else {
        addNewProgressStatus = true;
      }

      if (addNewProgressStatus) {
        userProgressStatusDto.completedCount = 1;
        if (currentQuestionType === 'moduleInstruction') {
          userProgressStatusDto.completedInstructionIds.push(questionId);
          userProgressStatusDto.completedInstructionsCount = userProgressStatusDto.completedInstructionIds.length;
        } else if (currentQuestionType === 'Modulequestions') {
          userProgressStatusDto.completedQuestionIds.push(questionId);
          userProgressStatusDto.completedQuestionsCount = userProgressStatusDto.completedQuestionIds.length;
        }
        const totalCompleted = userProgressStatusDto.completedInstructionsCount + userProgressStatusDto.completedQuestionsCount;
        const totalToBeCompleted = instructionsCount + questionsCount;
        userProgressStatusDto.completedPercentage = Number(((totalCompleted * 100) / totalToBeCompleted).toFixed(2));
        const moduleStatusData = await this.usersProgressStatusModel.create(userProgressStatusDto);
        currentUserProgressStatusId = moduleStatusData ? moduleStatusData.id : '';

        try {
          const moduleIdData = await this.modulesModel.findOne({ _id: moduleId })
            .populate('xpId', "value")
            .populate('templateType')
            .exec();
          const params = {
            userId: userId,
            activity: "Started the lesson & activities in module " + moduleIdData.moduleName,
            action: 'module_started',
            shortDescription: "Started the lesson & activities in module " + moduleIdData.moduleName,
            unitId: unitId,
            moduleId: moduleId
          };
          this.usersService.logUserActivity(params).then(() => { });
        } catch { }
      }

      // console.log("userProgressStatusDto####", userProgressStatusDto);

      if (!_.isEmpty(questions)) {
        const newQuestionResponse = await this.QuestionResponseModel.create({
          userId,
          unitId,
          moduleId,
          questionId,
          answers: answers,
          questionsCount: questionsCount,
          yourScore: score,
          maxScore: maxScore,
          parentOptionId: parentOptionId,
          attempt: attempt,
          userLearningHistoryId: new ObjectId(data._id),
          userProgressStatusId: currentUserProgressStatusId
        });

        return newQuestionResponse;
      } else {
        return false
      }
    } catch (error) {
      console.log("Error:", error);
      throw new Error(`${error.message}`)
    }
  }

  async findAll(queryParams: any) {
    const ObjectId = mongoose.Types.ObjectId;
    const moduleId = new ObjectId(queryParams.moduleId)
    const match: any = {}
    if (queryParams.userId) {
      match.userId = new ObjectId(queryParams.userId);
    }
    if (queryParams.unitId) {
      match.unitId = new ObjectId(queryParams.unitId);
    }
    if (queryParams.moduleId) {
      match.moduleId = new ObjectId(queryParams.moduleId)
    }
    if (queryParams.attempt) {
      match.attempt = Number(queryParams.attempt);
    }

    if (queryParams.attemptDate) {
      const startDate = new Date(queryParams.attemptDate);
      const endDate = new Date(queryParams.attemptDate);
      endDate.setDate(endDate.getDate() + 1);

      match.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    let QuestionData: any[] = [];
    if (!_.isEmpty(queryParams.questionId) && queryParams.questionId !== 'null') {
      const matched = {
        ...match,
        questionId: new ObjectId(queryParams.questionId)
      };

      QuestionData = await this.QuestionResponseModel.aggregate([
        { $match: matched },
        {
          $sort: { createdAt: -1 }
        },
        { $limit: 1 },
        {
          $project: {
            _id: 0,
            attempt: 1,
            contentRelevanceRating: 1,
            contentRelevanceRatingReason: 1,
            emotionRecognition: 1,
            enhancedText: 1,
            fluencyLevel: 1,
            transcription: 1,
            vocabularyRating: 1,
            vocabularyRatingReason: 1
          }
        }
      ])
    }
    const QuestionDataItem = QuestionData[0] || {};
    try {
      const scenarios = ["S1", "S2", "S3"];
      const QuestionResponseList = await this.QuestionResponseModel.aggregate([
        {
          $match: match
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'units',
            localField: 'unitId',
            foreignField: '_id',
            as: 'unit'
          }
        },
        {
          $lookup: {
            from: 'modules',
            localField: 'moduleId',
            foreignField: '_id',
            as: 'module'
          }
        },
        {
          $lookup: {
            from: 'questions',
            localField: 'questionId',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['ACTIVE', '$status']
                  }
                }
              }
            ],
            foreignField: '_id',
            as: 'questions'
          }
        },
        {
          $unwind: '$questions'
        },
        {
          $lookup: {
            from: 'questiontypes',
            localField: 'questions.questionType',
            foreignField: '_id',
            as: 'questionType'
          }
        },
        {
          $unwind: { path: '$questionType', preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: 'userlearninghistories',
            localField: 'userLearningHistoryId',
            foreignField: '_id',
            as: 'userLearningHistory'
          }
        },
        {
          $lookup: {
            from: 'options',
            localField: 'questions._id',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['ACTIVE', '$status']
                  }
                }
              }
            ],
            foreignField: 'questionId',
            as: 'options'
          }
        },
        {
          $lookup: {
            from: 'options',
            let: { answerIds: '$answers' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$_id', '$$answerIds'] }
                }
              },
              {
                $addFields: {
                  displayOrderNumber: { $toInt: '$displayOrder' }
                }
              },
              {
                $sort: { displayOrderNumber: 1 }
              },
              {
                $project: {
                  _id: 0,
                  id: '$_id',
                  optionValue: 1,
                  optionText: 1,
                  optionImage: 1,
                  questionId: 1,
                  validOption: 1,
                  appropriateDesc: 1,
                  inappropriateDesc: 1,
                  displayOrder: 1
                }
              }
            ],
            as: 'answers'
          }
        },
        {
          $lookup: {
            from: 'templatetypes',
            localField: 'questions.templateType',
            foreignField: '_id',
            as: 'templateType'
          }
        },
        {
          $unwind: { path: '$templateType', preserveNullAndEmptyArrays: true }
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] },
            unit: { $arrayElemAt: ['$unit', 0] },
            module: { $arrayElemAt: ['$module', 0] },
            'questions.templateType': {
              id: '$templateType._id',
              displayName: '$templateType.displayName',
              displayValue: '$templateType.displayValue',
              status: '$templateType.status'
            },
            userView: QuestionDataItem
          }
        },
        {
          $match: {
            'questionType.displayName': 'Questions',
            'module._id': moduleId,
            ...(queryParams.parentOptionId ? { 'questions.parentOptionId': queryParams.parentOptionId } : {})
          }
        },
        {
          $group: {
            _id: {
              userId: '$userId',
              unitId: '$unitId',
              moduleId: '$moduleId',
              questionId: '$questionId'
            },
            doc: { $first: '$$ROOT' }
          }
        },
        {
          $replaceRoot: { newRoot: '$doc' }
        },
        {
          $group: {
            _id: {
              userId: '$userId',
              unitId: '$unitId',
              moduleId: '$moduleId'
            },
            user: { $first: '$user' },
            unit: { $first: '$unit' },
            module: { $first: '$module' },
            userView: { $first: '$userView' },
            questionsCount: {
              $sum: {
                $cond: [
                  { $eq: ["$questions.status", "ACTIVE"] },
                  1,
                  0
                ]
              }
            },
            ...scenarios.reduce((acc, scenario) => {
              acc[`scenario${scenario}Count`] = {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$questions.status", "ACTIVE"] },
                        { $eq: ["$questions.linkScenario", scenario] },
                        { $eq: ["$module.isScenario", true] },
                        { $eq: ["$questionType.displayName", "Questions"] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              };
              return acc;
            }, {}),
            questions: {
              $push: {
                questionTitle: '$questions.questionTitle',
                displayOrder: { $toInt: '$questions.displayOrder' },
                hasMultiAnswers: "$questions.hasMultiAnswers",
                questionImage: "$questions.questionImage",
                linkScenario: '$questions.linkScenario',
                imageQuestionFemale: "$questions.imageQuestionFemale",
                yourScore: '$yourScore',
                maxScore: '$maxScore',
                yourAnswer: '$answers',
                correctAnswer: {
                  $cond: [
                    { $or: [{ $eq: ['$questions.templateType.displayValue', 'qnDragDrop'] }, { $eq: ['$questions.templateType.displayValue', 'resumeDetailCorrection'] }] },
                    '$answers',
                    {
                      $filter: {
                        input: '$options',
                        as: 'answer',
                        cond: { $eq: ['$$answer.validOption', "true"] }
                      }
                    }
                  ]
                },
                wrongAnswer: {
                  $cond: [
                    { $or: [{ $eq: ['$questions.templateType.displayValue', 'qnDragDrop'] }, { $eq: ['$questions.templateType.displayValue', 'resumeDetailCorrection'] }] },
                    {
                      $filter: {
                        input: '$options',
                        as: 'answer',
                        cond: { $not: { $in: ['$$answer._id', '$answers.id'] } }
                      }
                    },
                    {
                      $filter: {
                        input: '$options',
                        as: 'answer',
                        cond: { $eq: ['$$answer.validOption', "false"] }
                      }
                    }
                  ]
                },
                templateType: '$questions.templateType'
              }
            },
          }
        },
        {
          $addFields: {
            questions: {
              $sortArray: {
                input: '$questions',
                sortBy: { displayOrder: 1 }
              }
            },
          }
        },
        {
          $project: {
            _id: 0,
            userView: 1,
            user: {
              userId: '$user._id',
              email: '$user.email',
              mobileNumber: '$user.mobileNumber',
              firstName: '$user.firstName'
            },
            unit: {
              unitId: '$unit._id',
              unitName: '$unit.unitName'
            },
            module: {
              moduleId: '$module._id',
              moduleName: '$module.moduleName',
              completedPercentage: '$module.completedPercentage'
            },
            questionsCount: 1,
            ...scenarios.reduce((acc, scenario) => {
              acc[`scenario${scenario}Count`] = `$scenario${scenario}Count`;
              return acc;
            }, {}),
            questions: {
              $map: {
                input: '$questions',
                as: 'question',
                in: {
                  questionTitle: '$$question.questionTitle',
                  displayOrder: '$$question.displayOrder',
                  hasMultiAnswers: "$$question.hasMultiAnswers",
                  questionImage: "$$question.questionImage",
                  imageQuestionFemale: "$$question.imageQuestionFemale",
                  yourScore: '$$question.yourScore',
                  maxScore: '$$question.maxScore',
                  linkScenario: '$$question.linkScenario',
                  yourAnswer: {
                    $map: {
                      input: '$$question.yourAnswer',
                      as: 'yourAnswer',
                      in: {
                        id: '$$yourAnswer.id',
                        optionValue: '$$yourAnswer.optionValue',
                        optionText: '$$yourAnswer.optionText',
                        optionImage: '$$yourAnswer.optionImage',
                        displayOrder: '$$yourAnswer.displayOrder',
                        validOption: '$$yourAnswer.validOption',
                        appropriateDesc: '$$yourAnswer.appropriateDesc',
                        inappropriateDesc: '$$yourAnswer.inappropriateDesc',
                      }
                    }
                  },
                  correctAnswer: {
                    $map: {
                      input: '$$question.correctAnswer',
                      as: 'answer',
                      in: {
                        id: '$$answer.id',
                        optionValue: '$$answer.optionValue',
                        optionText: '$$answer.optionText',
                        optionImage: '$$answer.optionImage',
                        displayOrder: '$$answer.displayOrder',
                        validOption: '$$answer.validOption',
                        appropriateDesc: '$$answer.appropriateDesc',
                        inappropriateDesc: '$$answer.inappropriateDesc',
                      }
                    }
                  },
                  wrongAnswer: {
                    $map: {
                      input: '$$question.wrongAnswer',
                      as: 'answer',
                      in: {
                        id: '$$answer.id',
                        optionValue: '$$answer.optionValue',
                        optionText: '$$answer.optionText',
                        optionImage: '$$answer.optionImage',
                        displayOrder: '$$answer.displayOrder',
                        validOption: '$$answer.validOption',
                        appropriateDesc: '$$answer.appropriateDesc',
                        inappropriateDesc: '$$answer.inappropriateDesc',
                      }
                    }
                  },
                  templateType: '$$question.templateType'
                }
              }
            }
          }
        }
      ]);

      const count = await this.QuestionResponseModel.countDocuments(match).exec();
      return { QuestionResponseList, count };
    } catch (error) {
      console.error("Error fetching question response list:", error);
      return { error: error.message };
    }
  }

  async documentExists(model: Model<any>, objectId: string, documentType: string): Promise<void> {
    const document = await model.findOne({ _id: objectId, status: { $ne: 'DELETED' } })
    if (!document) {
      throw new Error(`${documentType} with ID ${objectId} does not exist.`);
    }
  }

  async findUserResponses(userId: string, queryParams: any) {
    const parsedPage = parseInt(String(queryParams.page), 10) || 1;
    const parsedLimit = parseInt(String(queryParams.limit), 10) || 10;
    const skipValue = (parsedPage - 1) * parsedLimit;
    const ObjectId = mongoose.Types.ObjectId;
    const match = {
      userId: new ObjectId(userId)
    }
    const QuestionResponseList = await this.QuestionResponseModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skipValue },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          let: { "u_ans": "$answers" },
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'options',
                localField: '_id',
                foreignField: 'questionId',
                as: 'options'
              }
            },
            {
              $project: {
                _id: 0,
                questionId: "$_id",
                questionTitle: 1,
                displayOrder: 1,
                questionImage: 1,
                hasMultiAnswers: 1,
                contentOrder: 1,
                yourScore: 1,
                maxScore: 1,
                options: "$options",
                validAnswers: {
                  $filter: {
                    input: "$options",
                    as: "item",
                    cond: { $eq: ["$$item.validOption", "true"] }
                  }
                },
                userAnswers: {
                  $filter: {
                    input: "$options",
                    as: "item",
                    cond: { $in: ["$$item._id", "$$u_ans"] }
                  }
                },
              }
            }
          ],
          as: 'question'
        }
      },
      {
        $unwind: { path: '$question', preserveNullAndEmptyArrays: true }
      },
    ]);
    const count = await this.QuestionResponseModel.countDocuments(match).exec()
    return { QuestionResponseList, count }
  }

  async awardAchievement(unitId: string, moduleId: string, userId: string) {
    try {
      const allModulesInUnit = await this.modulesModel.find({ unitId: unitId, status: 'ACTIVE' }).sort({ displayOrder: 1 }).exec();
      const totalModules = allModulesInUnit.length;

      const currentModule = await this.modulesModel.findOne({ _id: moduleId, unitId: unitId }).exec();
      const currentModuleDisplayOrder = Number(currentModule?.displayOrder) || 0;

      const completionPercentage: any = (currentModuleDisplayOrder / totalModules) * 100;

      const achievementMilestones = [
        { percentage: 25, keyName: 'QUARTER_QUEST', reason: 'Quarter of modules completed' },
        { percentage: 50, keyName: 'HALFWAY_HERO', reason: 'Half of modules completed' },
        { percentage: 100, keyName: 'PERFECT_SCORE', reason: 'All modules completed' }
      ];

      for (const milestone of achievementMilestones) {
        if (completionPercentage >= milestone.percentage) {
          const achievement = await this.achievementsModel.findOne({ keyName: milestone.keyName }).exec();

          if (achievement) {
            const achievementId = achievement._id;

            const existingAchievement = await this.userAchievementModel.findOne({
              unitId: unitId,
              userId: userId,
              achievementId: achievementId
            }).exec();

            if (!existingAchievement) {
              const reason = `${milestone.reason} in unit ${unitId}`;
              await this.userAchievementModel.create({
                unitId: unitId,
                userId: userId,
                achievementId: achievementId,
                reason: reason
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in user achievement process:", error.message);
    }
  }

  async checkAndIssueCertificate(unitId: string, moduleId: string, userId: string, decodedToken: any, questionId: any) {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const user = await this.usersModel.findById(userId);
      if (!user.unitsCompleted || !user.certificateIssued) {
        const lastUnit = await this.unitsModel.aggregate([
          { $match: { status: 'ACTIVE' } },
          { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
          { $sort: { displayOrderNum: -1 } },
          { $limit: 1 }
        ]);
        if (lastUnit.length && lastUnit[0]._id.toString() === unitId) {
          const lastModule = await this.modulesModel.aggregate([
            { $match: { status: 'ACTIVE', unitId: new ObjectId(unitId) } },
            { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
            { $sort: { displayOrderNum: -1 } },
            { $limit: 1 }
          ]);
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
              await this.usersModel.updateOne(
                { _id: userId },
                {
                  $set: {
                    unitsCompleted: true
                  }
                }
              );

              if (!user.certificateIssued) {
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
                const capitalize = (text: string) =>
                  text
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
                const fullName = `${capitalize(user.firstName)} ${capitalize(user.lastName)}`;
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

      }
    } catch (error) {
      console.error("Error during certificate issuance process:", error.message);
    }
  }

  async certificateReIssue(userId: any) {
    try {
      const user = await this.usersModel.findById(userId);
      const ObjectId = mongoose.Types.ObjectId;

      if (user.unitsCompleted || user.certificateIssued) {
        const lastUnit = await this.unitsModel.aggregate([
          { $match: { status: 'ACTIVE' } },
          { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
          { $sort: { displayOrderNum: -1 } },
          { $limit: 1 }
        ]);

        const lastUnitId = lastUnit[0]?.unitId
        const lastModule = await this.modulesModel.aggregate([
          { $match: { status: 'ACTIVE', unitId: new ObjectId(lastUnitId) } },
          { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
          { $sort: { displayOrderNum: -1 } },
          { $limit: 1 }
        ]);

        const lastModuleId = lastModule[0]?._id
        const match = {
          userId: userId,
          unitId: lastUnitId,
          moduleId: lastModuleId,
          status: "COMPLETED",
          completedPercentage: 100
        }

        const userProgessStatus = await this.usersProgressStatusModel.findOne(match);
        if (userProgessStatus.completedPercentage === 100 && userProgessStatus.status === "COMPLETED") {
          const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          const fullName = `${capitalize(user.firstName)} ${capitalize(user.lastName)}`;
          try {
            const { filePath: certPath } = await this.certificateService.generate(userId, fullName);
            await this.mailService.sendCertificate(user.email, fullName, certPath);

            await this.usersModel.updateOne(
              { _id: userId },
              {
                $set: {
                  certificateIssued: true,
                }
              }
            );
            return {
              status: 'Success',
            };
          } catch (err) {
            console.error('Certificate generation/email failed:', err);
            return {
              status: 'Failed',
              message: 'Certificate generation or email sending failed'
            };
          }
        }
      }
    } catch (error) {
      console.error("Error during certificate issuance process:", error.message);
    }
  }

  async checkCompletionAndStreamCertificate(userId: string): Promise<{ success: boolean; filePath?: string; code?: string }> {
    try {
      const ObjectId = mongoose.Types.ObjectId;
      const user = await this.usersModel.findById(userId);
      if (!user) return { success: false, code: '5040' };
      const lastUnit = await this.unitsModel.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
        { $sort: { displayOrderNum: -1 } },
        { $limit: 1 }
      ]);
      const lastUnitId = lastUnit[0]?.unitId;
      if (!lastUnitId) return { success: false, code: 'LAST_UNIT_NOT_FOUND' };
      const lastModule = await this.modulesModel.aggregate([
        { $match: { status: 'ACTIVE', unitId: new ObjectId(lastUnitId) } },
        { $addFields: { displayOrderNum: { $toInt: "$displayOrder" } } },
        { $sort: { displayOrderNum: -1 } },
        { $limit: 1 }
      ]);
      const lastModuleId = lastModule[0]?._id;
      if (!lastModuleId) return { success: false, code: 'LAST_MODULE_NOT_FOUND' };

      const progress = await this.usersProgressStatusModel.findOne({
        userId,
        unitId: lastUnitId,
        moduleId: lastModuleId,
        status: 'COMPLETED',
        completedPercentage: 100
      });
      if (progress) {
        const formatUserName = (firstName?: string, lastName?: string): string => {
          return [firstName, lastName].filter(Boolean).map(name => name.toUpperCase()).join(' ');
        };
        const userName = formatUserName(user.firstName, user.lastName) || 'Learner';
        const cert = await this.certificateService.generate(userId, userName);
        return { success: true, filePath: cert.filePath };
      }
      return { success: false, code: '5112' };
    } catch (error) {
      console.error('Error in checkCompletionAndGenerateCertificate:', error);
      return { success: false };
    }
  }
}