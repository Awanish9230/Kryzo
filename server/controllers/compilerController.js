const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Question = require('../models/Question');

// Language Config for Piston
const LANGUAGE_CONFIG = {
    'JavaScript': { language: 'javascript', version: '18.15.0' },
    'Python': { language: 'python', version: '3.10.0' },
    'Java': { language: 'java', version: '15.0.2' },
    'C++': { language: 'c++', version: '10.2.0' },
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

    const config = LANGUAGE_CONFIG[language];
    if (!config) {
        res.status(400);
        throw new Error('Unsupported language');
    }

    let testCases = [];

    // If questionId provided, fetch test cases
    if (questionId) {
        const question = await Question.findById(questionId);
        if (question && question.testCases) {
            // Only run against public test cases for "Run", or all for "Submit"? 
            // Usually "Run" runs against sample cases. "Submit" runs against all.
            // Let's run against ALL for now but mark hidden ones?
            // User requested "allow compiler... to solve question", generally implies checking logic.
            testCases = question.testCases;
        }
    }

    // If custom input provided (e.g. user wants to test specific case), add it
    if (customInput) {
        testCases = [{ input: customInput, output: 'Custom Run', isHidden: false }];
    }

    // If no test cases (e.g. playground or no question), just run once with empty input
    if (testCases.length === 0) {
        testCases = [{ input: '', output: '', isHidden: false }];
    }

    // Execute logic
    const results = [];

    // Limit to first 3 test cases for "Run" to avoid timeout, unless it's a submission
    // For now, let's run up to 5
    const casesToRun = testCases.slice(0, 5);

    for (const tc of casesToRun) {
        try {
            const payload = {
                language: config.language,
                version: config.version,
                files: [
                    {
                        content: code
                    }
                ],
                stdin: tc.input || '',
            };

            const response = await axios.post('https://emkc.org/api/v2/piston/execute', payload);
            const { run } = response.data;

            const actualOutput = run.stdout ? run.stdout.trim() : '';
            const expectedOutput = tc.output ? tc.output.trim() : '';

            // Basic comparison
            const passed = actualOutput === expectedOutput;

            results.push({
                input: tc.input,
                expectedOutput: tc.output,
                actualOutput: actualOutput,
                error: run.stderr,
                passed: passed,
                isHidden: tc.isHidden
            });

        } catch (error) {
            console.error('Piston Error:', error.message);
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
