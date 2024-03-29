document.addEventListener("DOMContentLoaded", function() {
    const terminal = document.getElementById("terminal");
    const promptElement = document.getElementById('currentPath');
    const terminalWindow = document.querySelector('.terminal-window');
    const terminalIcon = document.querySelector('.terminal-icon');
    const footer = document.querySelector('.footer');

    document.querySelector('.button.green').addEventListener('click', function () {
        if (terminalWindow.classList.contains('minimized')) {
            terminalWindow.classList.remove('minimized');
            footer.classList.toggle('hidefooter'); 
        } else {
            terminalWindow.classList.toggle('fullscreen');
            footer.classList.toggle('hidefooter'); 
        }
    });
    
    document.querySelector('.button.yellow').addEventListener('click', function () {
        if (terminalWindow.classList.contains('fullscreen')) {
            terminalWindow.classList.remove('fullscreen');
            footer.classList.toggle('hidefooter'); 
        } else {
            terminalWindow.classList.toggle('minimized');
            footer.classList.toggle('hidefooter'); 
        }
    });

    document.querySelector('.button.red').addEventListener('click', function () {
        terminalWindow.classList.remove('fullscreen', 'minimized');
        terminalWindow.style.display = 'none';
        terminalIcon.classList.add('show');
        const footerDisplayStyle = getComputedStyle(footer).display;
    
        if (footerDisplayStyle === 'none') {
            footer.classList.toggle('hidefooter');
        }
        
    });

    document.querySelector('.terminal-icon').addEventListener('click', function () {
        terminalWindow.style.display = 'block';
        terminalIcon.classList.remove('show');
        const footerDisplayStyle = getComputedStyle(footer).display;
    
        if (footerDisplayStyle === 'none') {
            footer.classList.toggle('hidefooter');
        }
    });

    terminal.addEventListener('click', function() {
        const inputElement = terminal.querySelector('.input');
        inputElement.focus();
    });

    terminal.addEventListener("keydown", function(event) {
        const inputElement = terminal.querySelector('.input');
        if (event.key === "Enter") {
            event.preventDefault();
            const command = inputElement.textContent.trim();
            if (command !== '') {
                inputElement.textContent = ''; // Clear the input field
                const prompt = `<span class="prompt">${currentPath}</span>`;
                const output = processCommand(command)// Process the command

                const newLine = document.createElement("p");
                
                newLine.innerHTML = `${prompt} <span class="tick">&gt; </span>${command}<br>${output}`;
                terminal.insertBefore(newLine, inputElement.parentNode);
                promptElement.textContent = currentPath;
                const nextSibling = newLine.nextElementSibling;
                if (nextSibling) {
                    terminal.removeChild(nextSibling);
                }
                createPrompt();
            } 


        } else if (event.key === "Tab") {
            event.preventDefault();
            const command = inputElement.textContent.trim();
            const prompt = `<span class="prompt">${currentPath}</span>`;

            const args = command.split(' ');
            const commandName = args[0];
            const target = args[1];

            if (!target) {
                const suggestions = getSuggestions(commandName);
                let output = '';
    
                if (suggestions.length === 1) {
                    // Auto-complete the command or file name
                    inputElement.textContent = suggestions[0];
    
                    // Move the cursor to the end of the text content
                    const range = document.createRange();
                    const selection = window.getSelection();
    
                    range.selectNodeContents(inputElement);
                    range.collapse(false);
    
                    selection.removeAllRanges();
                    selection.addRange(range);
    
                } else if (suggestions.length > 1) {
                    // Show suggestions
                    output = suggestions.join(' ');
                    const newLine = document.createElement("p");
                    newLine.innerHTML = `${prompt} <span class="tick">&gt; </span>${commandName}<br>${output}`;
                    terminal.insertBefore(newLine, inputElement.parentNode);
                } 
            } else {
                const suggestions = getTargetSuggestions(commandName, target);

                if (suggestions && suggestions.length === 1) {

                    inputElement.textContent = commandName + ' ' + suggestions[0];
                    
                    // Move the cursor to the end of the text content
                    const range = document.createRange();
                    const selection = window.getSelection();

                    range.selectNodeContents(inputElement);
                    range.collapse(false);

                    selection.removeAllRanges();
                    selection.addRange(range);

                } else if (suggestions && suggestions.length > 1) {
                    // Show suggestions
                    output = suggestions.join(' ');
                    const newLine = document.createElement("p");
                    newLine.innerHTML = `${prompt} <span class="tick">&gt; </span>${commandName} ${target}<br>${output}`;
                    terminal.insertBefore(newLine, inputElement.parentNode);
                }
            }
        }
    });

    const fileContents = {
        'masters.txt': '',
        'bachelors.txt': '',
        'diploma.txt': '',
        'ledlenser.txt': '',
        'cognizant.txt': '',
        'safe_nlp.txt': '',
        'autonomous_planner.txt': '',
        'multi_robot_manager.txt': '',
        'sign_language_translator.txt': '',
        'resume.txt': '',
        'contact.txt': '',
        'about.txt': '',
        'skills.txt': '',
        'achievements.txt': '',
    };

    let rootDirectory = {
        name: 'root',
        folders: [
            {
                name: 'education',
                files: ['masters.txt', 'bachelors.txt', 'diploma.txt'],
                folders: [],
            },
            {
                name: 'experience',
                files: ['ledlenser.txt', 'cognizant.txt'],
                folders: [],
            },
            {
                name: 'projects',
                files: ['safe_nlp.txt', 'autonomous_planner.txt', 'multi_robot_manager.txt', 'sign_language_translator.txt'],
                folders: [],
            },
        ],
        files: ['resume.txt', 'contact.txt', 'about.txt', 'skills.txt', 'achievements.txt'],
    };
    
    let currentDirectory = rootDirectory;
    let currentPath = 'root/';

    promptElement.textContent = currentPath;
    terminal.querySelector('.input').focus();

    function createPrompt() {
        newLine = document.createElement("p");
        prompt = `<span class="prompt">${currentPath}</span>`;
        newLine.innerHTML = `${prompt} <span class="tick">&gt; </span><span contenteditable="true" class="input" spellcheck="false"></span>`;
        terminal.appendChild(newLine); // Add a new empty line with the current prompt
        // focus curson on the input element
        inputElement = terminal.querySelector('.input');
        promptElement.textContent = currentPath;
        inputElement.focus();
    }
    
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
                    const targetParts = target.split('/'); // Split the target path by '/'
                    for (const part of targetParts) {
                        if (part === '..') {
                            // Remove the last part of the currentPath
                            const pathParts = currentPath.split('/').filter(Boolean); // Remove empty strings
                            if (pathParts.length > 1) {
                                pathParts.pop();
                            }
                            currentPath = pathParts.join('/') + '/'; // Reconstruct the currentPath
                        } else {
                            currentPath += `${part}/`; // Append the current part to the currentPath
                        }
                    }
                    currentDirectory = targetDir;
                    
                }
                return '';
            }
        } else if (commandName === 'clear') {
            terminal.innerHTML = ''; // Clear the terminal screen
            createPrompt();
            return ''; // Return an empty string as output
        } else if (commandName === 'cat') {
            if (!target) {
              return `cat: missing operand`;
            } else {
                const targetPath = target.split('/');
                const fileName = targetPath.pop(); // Get the file name
                
                let fileDir = currentDirectory;
                
                // Construct the directory path without the file name
                const directoryPath = targetPath.join('/') + '/';
                // Traverse the directory path to reach the file's directory
                const foundDir = navigateTo(directoryPath);
                
                if (foundDir === null) {
                    return `cat: ${directoryPath}: No such file or directory`;
                } else {
                    fileDir = foundDir;
                }
              // replace .txt with .html
              let actualFileName = fileName.replace('.txt', '.html');
              const file = fileDir.files.find(file => file === fileName);
              if (file) {
                const filePath = `content/${actualFileName}`; // Path to the HTML content
                loadHTMLFile(filePath, fileName);
                return fileContents[fileName]; // Return the loaded content
              } else {
                return `cat: ${target}: No such file or directory`;
              }
            }
          } else if (commandName === 'tree') {
            return displayTree(rootDirectory, 0, '');
        }else if (commandName === 'help') {
            output =   `<span class="green">ls</span> - list directory contents<br>
                        <span class="green">cd</span> - change the working directory<br>
                        <span class="green">cat</span> - Print file output on the standard output<br>
                        <span class="green">clear</span> - clear the terminal screen<br>
                        <span class="green">help</span> - display help info<br>
                        <span class="green">pwd</span> - print name of current/working directory<br>
                        <span class="green">tree</span> - list contents of directories<br>`;
            return output;
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

    // Function to load HTML content using AJAX (XMLHttpRequest)
    function loadHTMLFile(filePath, fileName) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
              fileContents[fileName] = xhr.responseText; // Store content in the object
            }
          }
        };
        xhr.open('GET', filePath, false); // Synchronous AJAX call to load the HTML file
        xhr.send();
    } 
    
    function listContents(directory) {
        const folders = directory.folders.map(folder => folder.name);
        const files = directory.files;
        folders.sort();
        files.sort();
        let output = '';
        folders.forEach(folder => {
            output += `<span class="green">${folder}/</span> `;
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
                        fileDir = getParentDirectory(rootDirectory, pathParts);
                    } else {
                        return null; // Already at root
                    }
                } else if (dir !== '') {
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

    function getSuggestions(commandName) {
        availableCommands = ['ls', 'cd', 'cat', 'clear', 'help', 'pwd', 'tree'];
            
        if (availableCommands.includes(commandName)) {
            if (commandName === 'ls' || commandName === 'cd') {
                const folders = currentDirectory.folders.map(folder => `<span class="green">${folder.name}/</span>`);
                return folders;
            }
            else if (commandName === 'cat') {
                const folders = currentDirectory.folders.map(folder => `<span class="green">${folder.name}/</span>`);
                const allFilesAndFolders = [...currentDirectory.files, ...folders];
                return allFilesAndFolders;
            }
        } else {
            return availableCommands.filter(command => command.startsWith(commandName));
        }

    }

    function getTargetSuggestions(commandName, target) {
        if (commandName === 'ls' || commandName === 'cd') {
            targetPath = target.split('/');
            if (targetPath.length === 1) {
                let folders;
                if (targetPath[0] === '..') {
                    folders = rootDirectory.folders.map(folder => folder.name);
                }
                else {
                    folders = currentDirectory.folders.map(folder => folder.name).filter(item => item.startsWith(target));
                }
                if (folders.length > 1) {
                    return folders.map(folder => `<span class="green">${folder}/</span>`);
                }
                else if (folders.length === 1) {
                    return [folders[0]+'/'];
                }
            } else {
                const requiredTarget = targetPath.pop();
                targetPath = targetPath.join('/');
                const targetDir = navigateTo(targetPath);
                if (targetDir === null) {
                    return [];
                }
                const folders = targetDir.folders.map(folder => folder.name).filter(item => item.startsWith(requiredTarget));
                if (folders.length > 1) {
                    return folders.map(folder => `<span class="green">${folder}/</span>`);
                }
                else if (folders.length === 1) {
                    return [targetPath + '/' + folders[0]+ '/'];
                }
            }
        } else if (commandName === 'cat') {
            if (target.endsWith('/')) {
                // Navigate directly to the directory and list its contents if it ends with '/' but is a single word
                const dir = navigateTo(target.slice(0, -1)); // Remove the trailing '/'
                if (dir === null) {
                    return [];
                }
                const folders = dir.folders.map(folder => folder.name + '/');
                const files = dir.files;
                return [...folders, ...files];
            } else {
                targetPath = target.split('/');
            }
            
            if (targetPath.length === 1) {
                const folders = currentDirectory.folders.map(folder => folder.name + '/');
                const files = currentDirectory.files;
                const allFilesAndFolders = [...folders, ...files];
                return allFilesAndFolders.filter(item => item.startsWith(target));
            } else {
                // return targetPath;
                const requiredTarget = targetPath.pop();
                targetPath = targetPath.join('/');
                const targetDir = navigateTo(targetPath);
                if (targetDir === null) {
                    return [];
                }
                const folders = targetDir.folders.map(folder => folder.name + '/');
                const files = targetDir.files.map(file => file);
                const allFilesAndFolders = [...folders, ...files];
                const filteredItems = allFilesAndFolders.filter(item => item.startsWith(requiredTarget));
                if (filteredItems.length > 1) {
                    return filteredItems;
                } else {
                    return [targetPath + '/' + filteredItems[0]]; // Assuming you want to return a single item within an array
                }
                
                
            }
        }
    }

    function displayTree(directory, depth, output) {
        const indentation = '    '.repeat(depth); // Define the indentation for each level
    
        // Display the root directory
        if (depth === 0) {
            output += `<span class="green">root/</span><br>`;
        }
        directory.files.forEach(file => {
            output += `${indentation}<span class="white" style="margin-left: 20px;">${file}</span><br>`;
        });
    
        // Display folders and their contents
        directory.folders.forEach((folder) => {
            output += `${indentation}<span class="green">${folder.name}/</span><br>`;
    
            // Recursively display contents of subfolders with appropriate indentation
            output = displayTree(folder, depth + 1, output);
        });
    
        // Display files at this level
        
    
        return output;
    }
});
