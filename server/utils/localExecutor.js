const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '../temp_code');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Executes code locally using child_process.spawn for robustness.
 */
const executeLocal = (code, language, input = '') => {
    return new Promise((resolve) => {
        const id = uuidv4();
        let fileName, cmd, args = [];
        let fileExtension = '';

        try {
            switch (language) {
                case 'JavaScript':
                    fileExtension = '.js';
                    fileName = path.join(TEMP_DIR, `${id}${fileExtension}`);
                    fs.writeFileSync(fileName, code);
                    cmd = 'node';
                    args = [fileName];
                    break;
                case 'Python':
                    fileExtension = '.py';
                    fileName = path.join(TEMP_DIR, `${id}${fileExtension}`);
                    fs.writeFileSync(fileName, code);
                    cmd = 'python'; // Fallback logic handled by OS path
                    args = [fileName];
                    break;
                case 'Java':
                    fileExtension = '.java';
                    const javaId = id.replace(/-/g, '');
                    fileName = path.join(TEMP_DIR, `Solution_${javaId}.java`);
                    const className = `Solution_${javaId}`;
                    const modifiedCode = code.replace(/class\s+Solution/g, `class ${className}`);
                    fs.writeFileSync(fileName, modifiedCode);

                    // Compilation step
                    const javac = spawn('javac', [fileName]);
                    let compileErr = '';
                    javac.stderr.on('data', (data) => compileErr += data.toString());
                    javac.on('close', (code) => {
                        if (code !== 0) {
                            cleanupFiles(fileName, id, language);
                            return resolve({ stdout: '', stderr: 'Compilation Error:\n' + compileErr, error: true });
                        }
                        runSpawn('java', ['-cp', TEMP_DIR, className], fileName, id, language, input, resolve);
                    });
                    return; // Return early, runSpawn called in callback
                case 'C++':
                    fileExtension = '.cpp';
                    const exeName = path.join(TEMP_DIR, `${id}.exe`);
                    fileName = path.join(TEMP_DIR, `${id}${fileExtension}`);
                    fs.writeFileSync(fileName, code);

                    const gpp = spawn('g++', [fileName, '-o', exeName]);
                    let gppErr = '';
                    gpp.stderr.on('data', (data) => gppErr += data.toString());
                    gpp.on('close', (code) => {
                        if (code !== 0) {
                            cleanupFiles(fileName, id, language);
                            return resolve({ stdout: '', stderr: 'Compilation Error:\n' + gppErr, error: true });
                        }
                        runSpawn(exeName, [], fileName, id, language, input, resolve);
                    });
                    return;
                default:
                    return resolve({ stderr: 'Unsupported language for local execution', error: true });
            }

            runSpawn(cmd, args, fileName, id, language, input, resolve);

        } catch (err) {
            console.error('Execution setup error:', err);
            resolve({ stderr: 'Internal error during execution setup: ' + err.message, error: true });
        }
    });
};

const runSpawn = (cmd, args, fileName, id, language, input, resolve) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(cmd, args);

    const timeout = setTimeout(() => {
        child.kill();
        resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim() + '\nExecution timed out (5s limit)',
            timeout: true
        });
    }, 5000);

    if (input && child.stdin) {
        child.stdin.write(input);
        child.stdin.end();
    }

    child.stdout.on('data', (data) => stdout += data.toString());
    child.stderr.on('data', (data) => stderr += data.toString());

    child.on('error', (err) => {
        clearTimeout(timeout);
        stderr += `\nFailed to start process: ${err.message}`;
        if (err.code === 'ENOENT') {
            stderr += `\nMake sure '${cmd}' is installed and in your system PATH.`;
        }
        cleanupFiles(fileName, id, language);
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), error: true });
    });

    child.on('close', (code) => {
        clearTimeout(timeout);
        cleanupFiles(fileName, id, language);
        resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            error: code !== 0
        });
    });
};

const cleanupFiles = (fileName, id, language) => {
    try {
        if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        if (language === 'C++') {
            const exePath = path.join(TEMP_DIR, `${id}.exe`);
            if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
        }
        if (language === 'Java') {
            const classPath = fileName.replace('.java', '.class');
            if (fs.existsSync(classPath)) fs.unlinkSync(classPath);
        }
    } catch (e) {
        console.error('Cleanup error:', e);
    }
};

module.exports = { executeLocal };
