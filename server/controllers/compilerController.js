const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const { executeLocal } = require('../utils/localExecutor');

// Language Mapping for convenience
const LANGUAGE_CONFIG = {
    'JavaScript': 'JavaScript',
    'Python': 'Python',
    'Java': 'Java',
    'C++': 'C++',
};

// @desc    Run Code locally against Test Cases (No API Key)
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
    const casesToRun = testCases.slice(0, 5); // Limit to 5 cases for local parity

    for (const tc of casesToRun) {
        try {
            // Clean input: remove common labels like "n = ", "input: ", "n - ", etc.
            let rawInput = (tc.input || '').trim();
            rawInput = rawInput.replace(/^[a-zA-Z]\s*[-=:]\s*/, '').replace(/^[a-zA-Z]+:\s*/, '');

            const execResult = await executeLocal(code, language, rawInput);

            const actualOutput = execResult.stdout ? execResult.stdout.trim() : '';
            const expectedOutput = (tc.output || '').trim();

            // Basic string comparison for equality
            const passed = actualOutput === expectedOutput;

            results.push({
                input: tc.input,
                expectedOutput: tc.output,
                actualOutput: actualOutput,
                error: execResult.stderr || (execResult.error ? 'Execution Error' : null),
                passed: passed,
                isHidden: tc.isHidden
            });

        } catch (error) {
            console.error('Local Exec Error:', error.message);
            results.push({
                input: tc.input,
                error: 'Local execution failed: ' + error.message,
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
