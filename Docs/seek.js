const fs = require('fs');
const path = require('path');

const countLines = (dirPath, callback) => {
    let totalLines = 0;
    fs.readdir(dirPath, (err, files) => {
        if (err) return callback(err);

        let pending = files.length;
        if (!pending) return callback(null, totalLines);

        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return callback(err);

                if (stats.isDirectory()) {
                    countLines(filePath, (err, lines) => {
                        if (err) return callback(err);

                        totalLines += lines;
                        if (!--pending) callback(null, totalLines);
                    });
                } else {
                    fs.readFile(filePath, 'utf8', (err, content) => {
                        if (err) return callback(err);

                        const lines = content.split('\n').length;
                        totalLines += lines;
                        if (!--pending) callback(null, totalLines);
                    });
                }
            });
        });
    });
};

const directoryPath = 'D:/JS/project-trpo/trpo/trpo-proj';

countLines(directoryPath, (err, lines) => {
    if (err) {
        console.error('Ошибка при подсчете строк:', err);
    } else {
        console.log('Общее количество строк кода:', lines);
    }
});

