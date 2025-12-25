const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Question = require('../models/Question');

// Language Config for Judge0
const LANGUAGE_CONFIG = {
    'JavaScript': 63,
    'Python': 71,
    'Java': 62,
    'C++': 54,
};

// @desc    Run Code against Test Cases
// @route   POST /api/compiler/run
// @access  Private
const runCode = asyncHandler(async (req, res) => {
    const { code, language, questionId, customInput } = req.body;

    if (!code || !language) {
        res.status(400);
        throw new Error('Code and language are required');
    }

    const langId = LANGUAGE_CONFIG[language];
    if (!langId) {
        res.status(400);
        throw new Error('Unsupported language');
    }

    let testCases = [];

    if (questionId) {
        const question = await Question.findById(questionId);
        if (question && question.testCases) {
            testCases = question.testCases;
        }
    }

    if (customInput) {
        testCases = [{ input: customInput, output: 'Custom Run', isHidden: false }];
    }

    if (testCases.length === 0) {
        testCases = [{ input: '', output: '', isHidden: false }];
    }

    const results = [];
    const casesToRun = testCases.slice(0, 5);

    for (const tc of casesToRun) {
        try {
            const response = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
                source_code: code,
                language_id: langId,
                stdin: tc.input || '',
                expected_output: tc.output || ''
            }, {
                headers: {
                    'x-rapidapi-key': process.env.JUDGE0_KEY || 'free_tier_key',
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                    'Content-Type': 'application/json'
                }
            });

            const result = response.data;
            const actualOutput = result.stdout ? result.stdout.trim() : '';
            const passed = result.status.id === 3; // Accepted

            results.push({
                input: tc.input,
                expectedOutput: tc.output,
                actualOutput: actualOutput,
                error: result.stderr || result.compile_output || (result.status.id !== 3 ? result.status.description : null),
                passed: passed,
                isHidden: tc.isHidden
            });

        } catch (error) {
            console.error('Judge0 Error:', error.message);
            results.push({
                input: tc.input,
                error: 'Execution failed: ' + error.message,
                passed: false
            });
        }
    }

    res.json({
        results,
        summary: {
            total: results.length,
            passed: results.filter(r => r.passed).length
        }
    });
});

module.exports = { runCode };
