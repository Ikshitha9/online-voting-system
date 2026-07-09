/**
 * Survey Controller
 * =================
 * Handles survey CRUD operations, survey response collection, duplicate submission checks,
 * and result analytics (aggregating multiple-choice tallies, rating averages, and text responses).
 */

const Survey = require('../models/Survey');
const SurveyResponse = require('../models/SurveyResponse');
const logAudit = require('../utils/auditLogger');

/**
 * Get all surveys with status check
 */
exports.getAllSurveys = async (req, res) => {
  try {
    // Sort surveys by newest first
    const surveys = await Survey.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      surveys,
    });
  } catch (error) {
    console.error('🚨 GetAllSurveys error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving surveys.',
    });
  }
};

/**
 * Get detailed survey by ID & indicate if the current user has already responded
 */
exports.getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found.',
      });
    }

    // Check if the current user has already responded
    const hasResponded = await SurveyResponse.exists({
      survey: survey._id,
      respondent: req.user._id,
    });

    res.status(200).json({
      success: true,
      survey,
      hasResponded: !!hasResponded,
    });
  } catch (error) {
    console.error('🚨 GetSurveyById error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving survey.',
    });
  }
};

/**
 * Create a new survey (Admin only)
 */
exports.createSurvey = async (req, res) => {
  try {
    const { title, description, questions, startDate, endDate, status } = req.body;

    if (!questions || questions.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'A survey must contain at least 1 question.',
      });
    }

    const survey = await Survey.create({
      title,
      description: description || '',
      questions,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || 'draft',
      createdBy: req.user._id,
    });

    await logAudit(
      'SURVEY_CREATED',
      req.user._id,
      `Created survey: "${survey.title}"`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Survey created successfully.',
      survey,
    });
  } catch (error) {
    console.error('🚨 CreateSurvey error:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating survey.',
    });
  }
};

/**
 * Update an existing survey (Admin only)
 */
exports.updateSurvey = async (req, res) => {
  try {
    const { title, description, questions, startDate, endDate, status } = req.body;

    let survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found.',
      });
    }

    if (title) survey.title = title;
    if (description !== undefined) survey.description = description;
    if (questions) survey.questions = questions;
    if (startDate) survey.startDate = new Date(startDate);
    if (endDate) survey.endDate = new Date(endDate);
    if (status) survey.status = status;

    await survey.save();

    res.status(200).json({
      success: true,
      message: 'Survey updated successfully.',
      survey,
    });
  } catch (error) {
    console.error('🚨 UpdateSurvey error:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating survey.',
    });
  }
};

/**
 * Delete a survey and its responses (Admin only)
 */
exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found.',
      });
    }

    const title = survey.title;
    await Survey.findByIdAndDelete(req.params.id);

    // Delete corresponding responses
    await SurveyResponse.deleteMany({ survey: req.params.id });

    await logAudit(
      'SURVEY_CREATED', // Fallback action type or write a custom audit event
      req.user._id,
      `Deleted survey and its responses: "${title}" (ID: ${req.params.id})`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Survey and all associated responses deleted successfully.',
    });
  } catch (error) {
    console.error('🚨 DeleteSurvey error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error deleting survey.',
    });
  }
};

/**
 * Submit survey response (Verified Users)
 */
exports.submitSurveyResponse = async (req, res) => {
  try {
    const { answers } = req.body;
    const surveyId = req.params.id;

    if (!answers || !Array.isArray(answers) || answers.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide survey answers.',
      });
    }

    // 1. Check if user is verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified. OTP verification is required to participate in surveys.',
      });
    }

    // 2. Fetch survey
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found.',
      });
    }

    // 3. Verify status
    if (survey.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This survey is not active or has been closed.',
      });
    }

    // 4. Double submission check
    const existingResponse = await SurveyResponse.findOne({
      survey: surveyId,
      respondent: req.user._id,
    });
    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a response to this survey.',
      });
    }

    // 5. Build and validate response answers against questions
    const formattedAnswers = [];

    for (let i = 0; i < survey.questions.length; i++) {
      const question = survey.questions[i];
      const submittedAnswer = answers.find((ans) => ans.questionIndex === i);

      // Check validation for required fields
      if (question.required && (!submittedAnswer || submittedAnswer.answer === undefined || submittedAnswer.answer === '')) {
        return res.status(400).json({
          success: false,
          message: `Question #${i + 1} ("${question.questionText}") is required.`,
        });
      }

      if (submittedAnswer) {
        formattedAnswers.push({
          questionIndex: i,
          answer: submittedAnswer.answer,
        });
      }
    }

    // 6. Save response
    await SurveyResponse.create({
      survey: surveyId,
      respondent: req.user._id,
      answers: formattedAnswers,
    });

    // 7. Increment survey response total
    survey.totalResponses += 1;
    await survey.save();

    // 8. Audit logging
    await logAudit(
      'SURVEY_RESPONSE',
      req.user._id,
      `Submitted response to survey: "${survey.title}"`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Your response has been submitted successfully.',
    });
  } catch (error) {
    console.error('🚨 SubmitSurveyResponse error:', error.stack);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A survey response has already been recorded from this user.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while submitting survey response.',
    });
  }
};

/**
 * Get aggregated survey results (Admin only)
 */
exports.getSurveyResults = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found.',
      });
    }

    // Retrieve all responses
    const responses = await SurveyResponse.find({ survey: req.params.id }).populate('respondent', 'fullName email');

    // Aggregate answers for each question
    const aggregatedResults = survey.questions.map((question, qIdx) => {
      const qAnswers = responses
        .map((resp) => resp.answers.find((ans) => ans.questionIndex === qIdx))
        .filter((ans) => ans !== undefined && ans.answer !== undefined)
        .map((ans) => ans.answer);

      const stats = {
        questionText: question.questionText,
        questionType: question.questionType,
        required: question.required,
        totalResponses: qAnswers.length,
      };

      if (question.questionType === 'multiple-choice') {
        // Tally option selections
        const tallies = {};
        question.options.forEach((opt) => {
          tallies[opt] = 0;
        });

        qAnswers.forEach((ans) => {
          if (tallies[ans] !== undefined) {
            tallies[ans]++;
          } else {
            tallies[ans] = 1;
          }
        });

        stats.tallies = tallies;
        stats.options = question.options;
      } else if (question.questionType === 'rating') {
        // Average score calculation
        const numericAnswers = qAnswers.map((val) => Number(val)).filter((n) => !isNaN(n));
        const sum = numericAnswers.reduce((acc, curr) => acc + curr, 0);
        const average = numericAnswers.length > 0 ? (sum / numericAnswers.length).toFixed(1) : 0;
        
        stats.averageRating = Number(average);
        stats.answersCount = numericAnswers.length;

        // Breakdown count (1 to 5)
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        numericAnswers.forEach((val) => {
          const rounded = Math.round(val);
          if (breakdown[rounded] !== undefined) {
            breakdown[rounded]++;
          }
        });
        stats.breakdown = breakdown;
      } else {
        // Text/free-form compilation
        stats.textResponses = qAnswers.filter((val) => val && val.trim() !== '');
      }

      return stats;
    });

    res.status(200).json({
      success: true,
      surveyTitle: survey.title,
      totalResponses: responses.length,
      results: aggregatedResults,
    });
  } catch (error) {
    console.error('🚨 GetSurveyResults error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error compiling survey results.',
    });
  }
};
