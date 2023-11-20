document.addEventListener("DOMContentLoaded", function() {
    const terminal = document.getElementById("terminal");
    const promptElement = document.getElementById('currentPath');

    terminal.addEventListener("keydown", function(event) {
        const inputElement = terminal.querySelector('.input');
        if (event.key === "Enter") {
            event.preventDefault();
            const command = inputElement.textContent.trim();
            inputElement.textContent = ''; // Clear the input field
            const prompt = `<span class="prompt">${currentPath}</span>`;
            const output = processCommand(command); // Process the command

            const newLine = document.createElement("p");
            
            newLine.innerHTML = `${prompt} <span class="tick">❯ </span>${command}<br>${output}`;
            terminal.insertBefore(newLine, inputElement.parentNode);
            promptElement.textContent = currentPath;
        }
    });

    const fileContents = {
        'masters.txt': 'Contents of masters.txt file',
        'bachelors.txt': 'Contents of bachelors.txt file',
        'diploma.txt': 'Contents of diploma.txt file',
        'ledlenser.txt': 'Contents of ledlenser.txt file',
        'cognizant.txt': 'Contents of cognizant.txt file',
        'rasa.txt': 'Contents of rasa.txt file',
        'python.txt': 'Contents of python.txt file',
        'hobbies.txt': 'Contents of hobbies.txt file',
        'skills.txt': 'Contents of skills.txt file'
        // Add more files and their contents as needed
    };

    let rootDirectory = {
        name: 'root',
        folders: [
            {
                name: 'education',
                files: ['masters.txt', 'bachelors.txt', 'diploma.txt'],
                folders: []
            },
            {
                name: 'experience',
                files: ['ledlenser.txt', 'cognizant.txt'],
                folders: []
            },
            {
                name: 'projects',
                files: ['rasa.txt', 'python.txt'],
                folders: []
            }
        ],
        files: ['hobbies.txt', 'skills.txt']
    };
    
    let currentDirectory = rootDirectory;
    let currentPath = 'root/';

    promptElement.textContent = currentPath;

    
    function processCommand(command) {
        const args = command.split(' ');    
        const commandName = args[0];
        target = args[1];

        if (target && target.endsWith('/')) {
            target = target.slice(0, -1); // Remove the last character if it is a slash
        }
    
        if (commandName === 'ls') {
            if (!target || target === '.' || target === './' || target === currentPath || target === '-a') {
                return listContents(currentDirectory);
            } else {
                const targetDir = navigateTo(target);
                if (targetDir === null) {
                    return `Directory '${target}' not found.`;
                } else {
                    return listContents(targetDir);
                }
            }
        } else if (commandName === 'cd') {
            if (!target) {
                currentDirectory = rootDirectory;
                currentPath = 'root/';
                return ``;
            }
            const targetDir = navigateTo(target);
            if (targetDir === null) {
                return `Directory '${target}' not found.`;
            } else if (targetDir === 0) {
                return ``;
            } else {
                if (target === '..') {
                    const pathParts = currentPath.split('/').filter(part => part !== '');
                    if (pathParts.length > 1) {
                        pathParts.pop();
                        currentPath = `${pathParts.join('/')}/`;
                        currentDirectory = getParentDirectory(rootDirectory, pathParts);
                    } else {
                        currentPath = currentDirectory === rootDirectory ? 'root/' : `${currentPath}${target}/`;
                        currentDirectory = targetDir;
                    }
                } else {
                    currentPath += `${target}/`;
                    currentDirectory = targetDir;
                }
                return '';
            }
        } else if (commandName === 'clear') {
            terminal.innerHTML = ''; // Clear terminal window
            
            const newLine = document.createElement("p");
            newLine.innerHTML = `<span class="prompt">${currentPath}</span>
                                <span class="tick">❯</span>
                                <span contenteditable="true" class="input" spellcheck="false"></span>`;
            terminal.appendChild(newLine);
            const newInput = terminal.querySelector('.input');
            newInput.focus(); // Focus on the new input field
            return '';
        } else if (commandName === 'cat') {
            if (!target) {
                return `cat: missing operand`;
            } else {
                const targetPath = target.split('/');
                const fileName = targetPath.pop(); // Get the file name
    
                let fileDir = currentDirectory;
                // Traverse the directory path to reach the file's directory
                for (const dir of targetPath) {
                    const foundDir = navigateTo(dir);
                    if (foundDir === null) {
                        return `cat: ${dir}: No such file or directory`;
                    } else {
                        fileDir = foundDir;
                    }
                }
                const file = fileDir.files.find(file => file === fileName);
                if (file) {
                    const content = fileContents[file];
                    if (content) {
                        return content;
                    } else {
                        return `cat: ${target}: No such file or directory`;
                    }
                } else {
                    return `cat: ${target}: No such file or directory`;
                }
            }
        } else if (commandName === 'help') {
            return 'Help is for the weak!'
        } else if (commandName === 'pwd') {
            return currentPath;
        } else if (commandName === 'rm' || commandName === 'rmdir' || commandName === 'mkdir' || 
                    commandName === 'touch' || commandName === 'mv' || commandName === 'cp' || commandName === 'apt') {
            return `Permission denied`;
        } else if (commandName === 'sudo' || commandName === 'su') {
            return `What...just cuz it says root?`;
        } else if (commandName === 'whoami') {
            return `Guest`;
        } else {
            return `Command not recognized: ${command}`;
        }
    }
    
    function listContents(directory) {
        const folders = directory.folders.map(folder => folder.name);
        const files = directory.files;
        folders.sort();
        files.sort();
        let output = '';
        folders.forEach(folder => {
            output += `<span class="green">${folder}</span> `;
        });
        files.forEach(file => {
            output += `<span class="white">${file}</span> `;
        });
        return output;
    }
    
    function navigateTo(target) {
        if (target === '..') {
            // Go up one level
            const pathParts = currentPath.split('/').filter(part => part !== '');
            if (pathParts.length > 1) {
                pathParts.pop();
                const newPath = `${pathParts.join('/')}/`;
                return getParentDirectory(rootDirectory, pathParts);
            } else {
                return 0; // Already at root
            }
        } else if (target.includes('/')) {
            const targetPath = target.split('/');
            let fileDir = currentDirectory;
            for (const dir of targetPath) {
                if (dir === '..') {
                    const pathParts = currentPath.split('/').filter(part => part !== '');
                    if (pathParts.length > 1) {
                        pathParts.pop();
                        const newPath = `${pathParts.join('/')}/`;
                        fileDir = getParentDirectory(rootDirectory, pathParts);
                    } else {
                        return null; // Already at root
                    }
                } else {
                    const foundDir = fileDir.folders.find(folder => folder.name === dir);
                    if (foundDir) {
                        fileDir = foundDir;
                    } else {
                        return null; // Directory not found
                    }
                }
            }
            return fileDir;
        } else {
            const folder = currentDirectory.folders.find(folder => folder.name === target);
            if (folder) {
                return folder;
            } else {
                return null; // Directory not found
            }
        }
    }
    
    
    function getParentDirectory(directory, pathParts) {
        let parent = directory;
        for (let i = 0; i < pathParts.length - 1; i++) {
            parent = parent.folders.find(folder => folder.name === pathParts[i]);
        }
        return parent;
    }
});
