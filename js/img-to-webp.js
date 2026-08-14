document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const resultArea = document.getElementById('result-area');
    const message = document.getElementById('message');

    let uploadedFiles = [];
    let convertedResults = [];

    function setMessage(text, type) {
        message.textContent = text;
        message.className = `json-message ${type || ''}`.trim();
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function updateQualityValue() {
        qualityValue.textContent = qualitySlider.value;
    }

    function handleFileSelect(files) {
        const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
        const newFiles = Array.from(files).filter(file => validTypes.includes(file.type));
        
        if (newFiles.length === 0) {
            setMessage('请选择有效的图片文件（PNG、JPG、JPEG、GIF、WebP）。', 'error');
            return;
        }

        uploadedFiles = [...uploadedFiles, ...newFiles];
        updateUploadArea();
        setMessage(`已选择 ${uploadedFiles.length} 张图片，点击转换按钮开始转换。`, 'success');
    }

    function updateUploadArea() {
        const uploadContent = uploadArea.querySelector('.upload-content');
        
        if (uploadedFiles.length > 0) {
            uploadContent.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>已选择 ${uploadedFiles.length} 张图片</p>
                <p class="upload-hint">点击继续添加更多图片</p>
            `;
        } else {
            uploadContent.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>点击或拖拽图片到此处</p>
                <p class="upload-hint">支持 PNG、JPG、JPEG、GIF 格式</p>
            `;
        }
    }

    async function convertToWebP(file, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob(function(blob) {
                        if (blob) {
                            resolve({
                                originalFile: file,
                                webpBlob: blob,
                                originalSize: file.size,
                                webpSize: blob.size,
                                width: img.width,
                                height: img.height,
                                quality: quality
                            });
                        } else {
                            reject(new Error('转换失败'));
                        }
                    }, 'image/webp', quality / 100);
                };
                img.onerror = function() {
                    reject(new Error('图片加载失败'));
                };
                img.src = event.target.result;
            };
            reader.onerror = function() {
                reject(new Error('文件读取失败'));
            };
            reader.readAsDataURL(file);
        });
    }

    async function convertAll() {
        if (uploadedFiles.length === 0) {
            setMessage('请先上传图片。', 'error');
            return;
        }

        const quality = parseInt(qualitySlider.value);
        convertBtn.disabled = true;
        convertBtn.textContent = '转换中...';
        setMessage('正在转换图片...', 'info');

        try {
            convertedResults = [];
            
            for (const file of uploadedFiles) {
                try {
                    const result = await convertToWebP(file, quality);
                    convertedResults.push(result);
                } catch (error) {
                    console.error(`转换 ${file.name} 失败:`, error);
                    setMessage(`转换 ${file.name} 失败: ${error.message}`, 'error');
                }
            }

            if (convertedResults.length > 0) {
                displayResults();
                downloadAllBtn.disabled = false;
                const totalOriginalSize = convertedResults.reduce((sum, r) => sum + r.originalSize, 0);
                const totalWebPSize = convertedResults.reduce((sum, r) => sum + r.webpSize, 0);
                const compression = ((1 - totalWebPSize / totalOriginalSize) * 100).toFixed(1);
                setMessage(`成功转换 ${convertedResults.length} 张图片，压缩率: ${compression}%`, 'success');
            } else {
                setMessage('转换失败，请重试。', 'error');
            }
        } catch (error) {
            setMessage(`转换过程中出现错误: ${error.message}`, 'error');
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = '转换';
        }
    }

    function displayResults() {
        if (convertedResults.length === 0) {
            resultArea.innerHTML = `
                <div class="empty-result">
                    <p>暂无转换结果</p>
                    <p class="empty-hint">上传图片后点击转换按钮</p>
                </div>
            `;
            return;
        }

        resultArea.innerHTML = convertedResults.map((result, index) => {
            const compression = ((1 - result.webpSize / result.originalSize) * 100).toFixed(1);
            const webpUrl = URL.createObjectURL(result.webpBlob);
            
            return `
                <div class="result-item">
                    <div class="result-preview">
                        <img src="${webpUrl}" alt="${result.originalFile.name}">
                    </div>
                    <div class="result-info">
                        <h4>${result.originalFile.name}</h4>
                        <div class="result-details">
                            <div class="detail-item">
                                <span class="detail-label">原始大小:</span>
                                <span class="detail-value">${formatFileSize(result.originalSize)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">WebP大小:</span>
                                <span class="detail-value">${formatFileSize(result.webpSize)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">压缩率:</span>
                                <span class="detail-value ${compression > 0 ? 'success' : 'warning'}">${compression}%</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">尺寸:</span>
                                <span class="detail-value">${result.width} × ${result.height}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">质量:</span>
                                <span class="detail-value">${result.quality}%</span>
                            </div>
                        </div>
                        <button class="download-btn" data-index="${index}">下载WebP</button>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定下载按钮事件
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                downloadSingle(index);
            });
        });
    }

    function downloadSingle(index) {
        const result = convertedResults[index];
        if (!result) return;

        const link = document.createElement('a');
        const originalName = result.originalFile.name.replace(/\.[^/.]+$/, '');
        link.href = URL.createObjectURL(result.webpBlob);
        link.download = `${originalName}.webp`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function downloadAll() {
        if (convertedResults.length === 0) return;

        convertedResults.forEach((result, index) => {
            setTimeout(() => {
                downloadSingle(index);
            }, index * 200); // 延迟下载避免浏览器阻止
        });

        setMessage('开始下载所有转换后的图片...', 'success');
    }

    function clearAll() {
        uploadedFiles = [];
        convertedResults = [];
        fileInput.value = '';
        updateUploadArea();
        displayResults();
        downloadAllBtn.disabled = true;
        setMessage('等待上传图片。', '');
    }

    // 事件监听
    fileInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files);
    });

    // 阻止file-input的点击事件冒泡到upload-area
    fileInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.backgroundColor = '#f0f4ff';
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.backgroundColor = '';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.backgroundColor = '';
        handleFileSelect(e.dataTransfer.files);
    });

    qualitySlider.addEventListener('input', updateQualityValue);

    convertBtn.addEventListener('click', convertAll);
    clearBtn.addEventListener('click', clearAll);
    downloadAllBtn.addEventListener('click', downloadAll);
});