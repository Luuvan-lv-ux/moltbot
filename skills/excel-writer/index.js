const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

async function run(args) {
    try {
        const { data, filename, sheetName = 'Sheet1' } = args;

        if (!data || !Array.isArray(data)) {
            throw new Error('Input "data" must be an array of objects.');
        }

        if (!filename) {
            throw new Error('Input "filename" is required.');
        }

        // Ensure output directory exists
        const outputDir = path.join(process.cwd(), 'output');
        // Note: process.cwd() when run by OpenClaw might be the project root or skill dir. 
        // We assume moltbot root or we find a relative path.
        // Let's use an absolute path relative to the moltbot root if possible, 
        // or just 'output' folder in the current working directory which config-server.js sets to d:\moltbot.

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
        const filePath = path.join(outputDir, safeFilename);

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);

        xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
        xlsx.writeFile(workbook, filePath);

        return {
            success: true,
            message: `Successfully wrote ${data.length} rows to Excel file.`,
            filePath: filePath,
            downloadUrl: `/output/${safeFilename}` // Hint for potential UI links later
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// OpenCLaw/Node execution adapter
if (require.main === module) {
    // If run directly, read args from stdin or argv (simple testing)
    const args = process.argv[2] ? JSON.parse(process.argv[2]) : {};
    run(args).then(console.log).catch(console.error);
} else {
    module.exports = run;
}
