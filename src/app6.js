
document.addEventListener('DOMContentLoaded', () => {
    // DOM元素
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const folderInput = document.getElementById('folderInput');
    const fileCardsContainer = document.getElementById('fileCardsContainer');
    const loadingIndicator = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const refreshBtn = document.getElementById('refreshBtn');
    
    let currentFiles = [];
    
    // 扩展的文件类型图标系统
    const fileIcons = {
        'image': { icon: 'fa-file-image', color: 'text-green-500' },
        'video': { icon: 'fa-file-video', color: 'text-red-500' },
        'audio': { icon: 'fa-file-audio', color: 'text-purple-500' },
        'pdf': { icon: 'fa-file-pdf', color: 'text-red-600' },
        'word': { icon: 'fa-file-word', color: 'text-blue-600' },
        'excel': { icon: 'fa-file-excel', color: 'text-green-600' },
        'powerpoint': { icon: 'fa-file-powerpoint', color: 'text-orange-600' },
        'text': { icon: 'fa-file-lines', color: 'text-gray-600' },
        'html': { icon: 'fa-file-code', color: 'text-orange-500' },
        'css': { icon: 'fa-file-code', color: 'text-blue-400' },
        'js': { icon: 'fa-file-code', color: 'text-yellow-500' },
        'python': { icon: 'fa-file-code', color: 'text-blue-300' },
        'java': { icon: 'fa-file-code', color: 'text-red-400' },
        'cpp': { icon: 'fa-file-code', color: 'text-blue-500' },
        'php': { icon: 'fa-file-code', color: 'text-purple-400' },
        'json': { icon: 'fa-file-code', color: 'text-gray-500' },
        'xml': { icon: 'fa-file-code', color: 'text-yellow-600' },
        'archive': { icon: 'fa-file-zipper', color: 'text-yellow-600' },
        'exe': { icon: 'fa-file-circle-check', color: 'text-green-500' },
        'dll': { icon: 'fa-gear', color: 'text-gray-500' },
        'sql': { icon: 'fa-database', color: 'text-blue-500' },
        'default': { icon: 'fa-file', color: 'text-gray-500' }
    };

    // 获取文件类型
    function getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) return 'image';
        if (['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv'].includes(extension)) return 'video';
        if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(extension)) return 'audio';
        if (extension === 'pdf') return 'pdf';
        if (['doc', 'docx'].includes(extension)) return 'word';
        if (['xls', 'xlsx'].includes(extension)) return 'excel';
        if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
        if (['txt', 'md', 'rtf'].includes(extension)) return 'text';
        if (extension === 'html') return 'html';
        if (extension === 'css') return 'css';
        if (extension === 'js') return 'js';
        if (extension === 'py') return 'python';
        if (extension === 'java') return 'java';
        if (['c', 'cpp', 'h', 'hpp'].includes(extension)) return 'cpp';
        if (extension === 'php') return 'php';
        if (extension === 'json') return 'json';
        if (extension === 'xml') return 'xml';
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
        if (extension === 'exe') return 'exe';
        if (extension === 'dll') return 'dll';
        if (['sql', 'db', 'sqlite'].includes(extension)) return 'sql';
        
        return 'default';
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 创建文件卡片
    function createFileCard(file) {
        const fileType = getFileType(file);
        const iconInfo = fileIcons[fileType] || fileIcons['default'];
        
        const card = document.createElement('div');
        card.className = 'file-card bg-white rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1';
        card.innerHTML = `
            <div class="w-full flex justify-between items-start mb-2">
                <span class="text-xs font-medium px-2 py-1 rounded ${iconInfo.color.replace('text', 'bg')} bg-opacity-10">
                    ${fileType.toUpperCase()}
                </span>
                <span class="text-xs text-gray-500">${formatFileSize(file.size)}</span>
            </div>
            <i class="file-icon fas ${iconInfo.icon} ${iconInfo.color} text-4xl mb-3"></i>
            <h3 class="text-sm font-medium text-gray-800 text-center truncate w-full" title="${file.name}">${file.name}</h3>
            <p class="text-xs text-gray-500 mt-1">${new Date(file.lastModified).toLocaleDateString()}</p>
        `;
        
        card.addEventListener('click', () => {
            const fileUrl = URL.createObjectURL(file);
            window.open(fileUrl, '_blank');
        });
        
        return card;
    }

    // 渲染文件卡片
    function renderFiles(files, searchTerm = '') {
        fileCardsContainer.innerHTML = '';
        
        if (files.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        const filteredFiles = searchTerm 
            ? files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : files;
            
        if (filteredFiles.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        filteredFiles.forEach(file => {
            const card = createFileCard(file);
            fileCardsContainer.appendChild(card);
        });
    }

    // 处理文件夹选择
    selectFolderBtn.addEventListener('click', () => {
        folderInput.value = ''; // 清除之前的选择
        folderInput.click();
    });

    folderInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        currentFiles = files;
        
        if (files.length === 0) return;
        
        loadingIndicator.classList.remove('hidden');
        setTimeout(() => {
            renderFiles(files);
            loadingIndicator.classList.add('hidden');
        }, 300);
    });

    // 搜索功能
    searchInput.addEventListener('input', (e) => {
        renderFiles(currentFiles, e.target.value);
    });

    // 刷新功能
    refreshBtn.addEventListener('click', () => {
        if (currentFiles.length > 0) {
            loadingIndicator.classList.remove('hidden');
            setTimeout(() => {
                renderFiles(currentFiles, searchInput.value);
                loadingIndicator.classList.add('hidden');
            }, 300);
        }
    });
});
