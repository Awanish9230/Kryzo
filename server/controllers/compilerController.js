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
            // Clean input logic
            let rawInput = (tc.input || '').trim();

            // 1. Handle "key = value, key2 = value2" format (LeetCode style)
            // Replace ", key =" with "\n" to separate arguments onto new lines
            rawInput = rawInput.replace(/,\s*[a-zA-Z0-9_]+\s*=\s*/g, '\n');

            // 2. Remove leading "key =" from the first line (and subsequent lines if missed)
            rawInput = rawInput.replace(/^[a-zA-Z0-9_]+\s*=\s*/gm, '');

            // 3. Remove "Input:" prefix if present
            rawInput = rawInput.replace(/^Input:\s*/i, '');

            // 4. Handle brackets and separators for numerical input (common in AI-gen questions)
            // If the input contains brackets/commas, we'll try to be smart about providing the count
            // many users (Java/C++) expect the first input to be the count 'n'.
            let elementCount = 0;
            let isArrayInput = false;

            if (rawInput.trim().startsWith('[') && rawInput.trim().endsWith(']')) {
                isArrayInput = true;
                // Simple comma-based split to count elements
                const contents = rawInput.trim().slice(1, -1);
                if (contents.trim() === '') {
                    elementCount = 0;
                } else {
                    // Split by comma, but handle potential spaces
                    elementCount = contents.split(',').length;
                }
            }

            if (rawInput.includes('[') || rawInput.includes(']')) {
                rawInput = rawInput.replace(/[\[\],]/g, ' ');
            }

            // Final trim and whitespace normalization
            let sanitizedInput = rawInput.replace(/\s+/g, ' ').trim();

            // Smart Prepend: If we detected an array, prepend the count 'n'
            // This fixes InputMismatchException for users doing sc.nextInt() then Loop
            if (isArrayInput) {
                sanitizedInput = `${elementCount} ${sanitizedInput}`;
            }

            const execResult = await executePiston(code, language, sanitizedInput);

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
                sanitizedInput: sanitizedInput, // Helpful for debugging
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
