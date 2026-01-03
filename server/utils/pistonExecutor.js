const axios = require('axios');

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

/**
 * Piston API Language Versions (Pinned for Stability)
 * These were verified from https://emkc.org/api/v2/piston/runtimes
 */
const LANGUAGE_CONFIG = {
    'javascript': { language: 'javascript', version: '18.15.0' },
    'js': { language: 'javascript', version: '18.15.0' },
    'python': { language: 'python', version: '3.10.0' },
    'py': { language: 'python', version: '3.10.0' },
    'java': { language: 'java', version: '15.0.2' },
    'c++': { language: 'c++', version: '10.2.0' },
    'cpp': { language: 'c++', version: '10.2.0' },
};

/**
 * Executes code using the Piston Cloud API.
 * 
 * @param {string} code - The source code.
 * @param {string} language - The language name (JavaScript, Python, Java, C++).
 * @param {string} input - Stdin input for the program.
 * @returns {Promise<Object>} - Format: { stdout, stderr, error, timeout }
 */
const executePiston = async (code, language, input = '') => {
    // Normalize language key: lowercase and trim
    const normalizedLang = language.toLowerCase().trim();
    const config = LANGUAGE_CONFIG[normalizedLang];

    if (!config) {
        return {
            stdout: '',
            stderr: `Unsupported language: ${language}`,
            error: true
        };
    }

    try {
        const payload = {
            language: config.language,
            version: config.version,
            files: [
                {
                    content: code
                }
            ],
            stdin: input,
            run_timeout: 3000, // 3 seconds timeout
            compile_timeout: 10000 // 10 seconds compilation timeout
        };

        const response = await axios.post(PISTON_API, payload, {
            timeout: 15000 // Network timeout (15s)
        });

        const { run, compile } = response.data;

        // Check for compilation error (if applicable)
        if (compile && compile.code !== 0) {
            return {
                stdout: '',
                stderr: compile.stderr || compile.stdout || 'Compilation Failed',
                error: true
            };
        }

        // Check for runtime error
        // Piston returns code 0 for success.
        // If code != 0, it's a runtime error, BUT stdout might still have valuable output.
        // We capture both.
        return {
            stdout: run.stdout || '',
            stderr: run.stderr || '',
            error: run.code !== 0 ? (run.stderr || 'Runtime Error') : false
        };

    } catch (error) {
        console.error('Piston Execution Error:', error.message);

        let errorMessage = 'External Execution Service Failed';

        if (error.code === 'ECONNABORTED') {
            errorMessage = 'Execution timed out (Network)';
        } else if (error.response && error.response.status === 429) {
            errorMessage = 'System busy (Rate Limit). Please wait a moment.';
        } else if (error.response) {
            errorMessage = `Service Error: ${error.response.statusText}`;
        }

        return {
            stdout: '',
            stderr: errorMessage,
            error: true
        };
    }
};

module.exports = { executePiston };
