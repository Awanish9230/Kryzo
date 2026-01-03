const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const { executePiston } = require('../utils/pistonExecutor');

// @desc    Run Code via Cloud API (Piston)
// @route   POST /api/compiler/run
// @access  Private
const runCode = asyncHandler(async (req, res) => {
    const { code, language, questionId, customInput } = req.body;

    if (!code || !language) {
        res.status(400);
        throw new Error('Code and language are required');
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
    // Limit test cases to avoid hitting API rate limits excessively
    const casesToRun = testCases.length > 10 ? testCases.slice(0, 10) : testCases;

    for (const tc of casesToRun) {
        try {
            // Clean input: remove common labels like "n = ", "input: ", "n - ", etc.
            let rawInput = (tc.input || '').trim();
            rawInput = rawInput.replace(/^[a-zA-Z]\s*[-=:]\s*/, '').replace(/^[a-zA-Z]+:\s*/, '');

            const execResult = await executePiston(code, language, rawInput);

            const actualOutput = execResult.stdout ? execResult.stdout.trim() : '';
            const expectedOutput = (tc.output || '').trim();

            // Basic string comparison for equality
            const passed = actualOutput === expectedOutput;

            // Clean up error message if it's just a runtime error
            let errorMsg = execResult.error;
            if (errorMsg === true || errorMsg === 'Runtime Error') {
                errorMsg = execResult.stderr || 'Runtime Error';
            }

            results.push({
                input: tc.input,
                expectedOutput: tc.output,
                actualOutput: actualOutput,
                error: errorMsg,
                passed: passed,
                isHidden: tc.isHidden
            });

        } catch (error) {
            console.error('Controller Logic Error:', error.message);
            results.push({
                input: tc.input,
                error: 'Internal Server Error: ' + error.message,
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
