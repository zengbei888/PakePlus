
document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据存储
    let items = JSON.parse(localStorage.getItem('repairItems')) || [];
    
    // DOM元素
    const dataTable = document.getElementById('dataTable');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const addBtn = document.getElementById('addBtn');
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');
    const fileInput = document.getElementById('fileInput');
    const editModal = document.getElementById('editModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const itemForm = document.getElementById('itemForm');
    
    // 渲染表格
    function renderTable(data = items) {
        dataTable.innerHTML = '';
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            row.innerHTML = `
                <th class="py-3 px-4 text-left border-r border-gray-300">${item.materialCode}</td>
                <th class="py-3 px-4 text-left border-r border-gray-300">${item.materialType}</td>
                <th class="py-3 px-4 text-left border-r border-gray-300">${item.materialName}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">${item.materialDesc}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">${item.moistureLevel}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">${item.repairTools}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">${item.tempRange}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">${item.repairCount}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">${item.specialReq}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">${item.operationDate}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">${item.operator}</td>
				<th class="py-3 px-4 text-left border-r border-gray-300">
                    <button class="edit-btn px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-all" data-index="${index}">
                        <i class="fas fa-edit mr-1"></i>编辑
                    </button>
                    <button class="delete-btn px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-all" data-index="${index}">
                        <i class="fas fa-trash-alt mr-1"></i>删除
                    </button>
                </td>
            `;
            dataTable.appendChild(row);
        });
        
        // 添加事件监听
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editItem(parseInt(e.target.closest('button').dataset.index)));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteItem(parseInt(e.target.closest('button').dataset.index)));
        });
    }
    
    // 新增记录
    function addItem() {
        document.getElementById('editIndex').value = '';
        itemForm.reset();
        document.getElementById('operationDate').valueAsDate = new Date();
        editModal.classList.remove('hidden');
    }
    
    // 编辑记录
    function editItem(index) {
        const item = items[index];
        document.getElementById('editIndex').value = index;
        document.getElementById('materialCode').value = item.materialCode;
        document.getElementById('materialType').value = item.materialType;
        document.getElementById('materialName').value = item.materialName;
        document.getElementById('materialDesc').value = item.materialDesc;
        document.getElementById('moistureLevel').value = item.moistureLevel;
        document.getElementById('repairTools').value = item.repairTools;
        document.getElementById('tempRange').value = item.tempRange;
        document.getElementById('repairCount').value = item.repairCount;
        document.getElementById('specialReq').value = item.specialReq;
        document.getElementById('operator').value = item.operator;
        document.getElementById('operationDate').value = item.operationDate;
        editModal.classList.remove('hidden');
    }
    
    // 删除记录
    function deleteItem(index) {
        if (confirm('确定要删除这条记录吗？')) {
            items.splice(index, 1);
            saveData();
            renderTable();
        }
    }
    // 保存数据
    function saveData() {
        localStorage.setItem('repairItems', JSON.stringify(items));
    }
    
    // 保存记录
    function saveItem() {
        const index = document.getElementById('editIndex').value;
        const item = {
            materialCode: document.getElementById('materialCode').value,
            materialType: document.getElementById('materialType').value,
            materialName: document.getElementById('materialName').value,
            materialDesc: document.getElementById('materialDesc').value,
            moistureLevel: document.getElementById('moistureLevel').value,
            repairTools: document.getElementById('repairTools').value,
            tempRange: document.getElementById('tempRange').value,
            repairCount: parseInt(document.getElementById('repairCount').value) || 0,
            specialReq: document.getElementById('specialReq').value,
            operator: document.getElementById('operator').value,
            operationDate: document.getElementById('operationDate').value
        };
        
        if (index === '') {
            items.push(item);
        } else {
            items[index] = item;
        }
        
        saveData();
        renderTable();
        editModal.classList.add('hidden');
    }
    
    // 搜索功能
    function searchItems() {
        const keyword = searchInput.value.trim().toLowerCase();
        if (keyword === '') {
            renderTable();
            return;
        }
        
        const filtered = items.filter(item => 
            item.materialCode.toLowerCase().includes(keyword) ||
            item.materialName.toLowerCase().includes(keyword) ||
            item.materialType.toLowerCase().includes(keyword)
        );
        
        renderTable(filtered);
    }
    
    // 导入Excel
    function importExcel(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            // 转换数据格式
            const importedItems = jsonData.map(item => ({
                materialCode: item['物料编码'] || '',
                materialType: item['物料类型'] || '',
                materialName: item['物料名称'] || '',
                materialDesc: item['物料描述'] || '',
                moistureLevel: item['潮敏级别'] || '1级',
                repairTools: item['返工&维修工具'] || '',
                tempRange: item['温度范围'] || '',
                repairCount: parseInt(item['返工&维修次数']) || 0,
                specialReq: item['特殊要求'] || '',
                operator: item['操作人'] || '',
                operationDate: item['日期'] || new Date().toISOString().split('T')[0]
            }));
            
            if (confirm(`确定导入${importedItems.length}条记录吗？`)) {
                items = importedItems;
                saveData();
                renderTable();
                alert('导入成功！');
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    // 导出Excel
    function exportExcel() {
        if (items.length === 0) {
            alert('没有数据可导出！');
            return;
        }
        
        // 准备数据
        const exportData = items.map(item => ({
            '物料编码': item.materialCode,
            '物料类型': item.materialType,
            '物料名称': item.materialName,
            '物料描述': item.materialDesc,
            '潮敏级别': item.moistureLevel,
            '返工&维修工具': item.repairTools,
            '温度范围': item.tempRange,
            '返工&维修次数': item.repairCount,
            '特殊要求': item.specialReq,
            '日期': item.operationDate,
            '操作人': item.operator
        }));
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "返工维修记录");
        
        // 导出文件
        XLSX.writeFile(wb, `器件返工维修记录_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
    
    // 事件监听
    addBtn.addEventListener('click', addItem);
    searchBtn.addEventListener('click', searchItems);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchItems();
    });
    
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importExcel(e.target.files[0]);
            fileInput.value = '';
        }
    });
    
    exportBtn.addEventListener('click', exportExcel);
    
    closeModal.addEventListener('click', () => editModal.classList.add('hidden'));
    cancelBtn.addEventListener('click', () => editModal.classList.add('hidden'));
    saveBtn.addEventListener('click', saveItem);
    
    // 初始渲染
    renderTable();
});

// 存储数据的数组
let materialData = [];
const STORAGE_KEY = 'material_rework_data';

// DOM元素
const dataTable = document.getElementById('dataTable');
const editModal = document.getElementById('editModal');
const itemForm = document.getElementById('itemForm');
const addBtn = document.getElementById('addBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeModal = document.getElementById('closeModal');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');
const exportBtn = document.getElementById('exportBtn');

// 初始化
function init() {
    // 从localStorage加载数据
    loadFromLocalStorage();
    // 渲染表格
    renderTable();
    // 绑定事件
    bindEvents();
}

// 从localStorage加载数据
function loadFromLocalStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        materialData = JSON.parse(savedData);
    }
}

// 保存数据到localStorage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materialData));
}

// 渲染表格
function renderTable(filteredData = null) {
    const dataToRender = filteredData || materialData;
    dataTable.innerHTML = '';

    if (dataToRender.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="12" class="py-4 px-4 text-center text-gray-500">暂无数据</td>`;
        dataTable.appendChild(emptyRow);
        return;
    }

    dataToRender.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-3 px-4 border-r border-gray-300">${item.materialCode}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.materialType}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.materialName}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.materialDesc}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.moistureLevel}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.repairTools}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.tempRange}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.repairCount}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.specialReq}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.operator}</td>
            <td class="py-3 px-4 border-r border-gray-300">${item.operationDate}</td>
            <td class="py-3 px-4">
                <button class="text-blue-500 hover:text-blue-700 mr-3 edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        dataTable.appendChild(row);
    });

    // 绑定编辑和删除按钮事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editItem(Number(btn.dataset.index)));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteItem(Number(btn.dataset.index)));
    });
}

// 打开模态框
function openModal(isEdit = false, index = -1) {
    if (isEdit && index >= 0) {
        const item = materialData[index];
        document.getElementById('editIndex').value = index;
        document.getElementById('materialCode').value = item.materialCode;
        document.getElementById('materialType').value = item.materialType;
        document.getElementById('materialName').value = item.materialName;
        document.getElementById('materialDesc').value = item.materialDesc;
        document.getElementById('moistureLevel').value = item.moistureLevel;
        document.getElementById('repairTools').value = item.repairTools;
        document.getElementById('tempRange').value = item.tempRange;
        document.getElementById('repairCount').value = item.repairCount;
        document.getElementById('specialReq').value = item.specialReq;
        document.getElementById('operator').value = item.operator;
        document.getElementById('operationDate').value = item.operationDate;
    } else {
        // 重置表单
        itemForm.reset();
        document.getElementById('editIndex').value = -1;
        // 设置默认日期为今天
        document.getElementById('operationDate').valueAsDate = new Date();
    }
    editModal.classList.remove('hidden');
}

// 关闭模态框
function closeModalFunc() {
    editModal.classList.add('hidden');
}

// 保存数据
function saveItem() {
    const index = Number(document.getElementById('editIndex').value);
    const newItem = {
        materialCode: document.getElementById('materialCode').value,
        materialType: document.getElementById('materialType').value,
        materialName: document.getElementById('materialName').value,
        materialDesc: document.getElementById('materialDesc').value,
        moistureLevel: document.getElementById('moistureLevel').value,
        repairTools: document.getElementById('repairTools').value,
        tempRange: document.getElementById('tempRange').value,
        repairCount: document.getElementById('repairCount').value,
        specialReq: document.getElementById('specialReq').value,
        operator: document.getElementById('operator').value,
        operationDate: document.getElementById('operationDate').value
    };

    if (index >= 0) {
        // 编辑现有项
        materialData[index] = newItem;
    } else {
        // 添加新项
        materialData.push(newItem);
    }

    // 保存到localStorage
    saveToLocalStorage();
    // 重新渲染表格
    renderTable();
    // 关闭模态框
    closeModalFunc();
    
    // 询问用户是否要导出Excel
    if (index === -1 && confirm('记录已保存，是否要导出Excel文件？')) {
        exportToExcel();
    }
}

// 编辑项目
function editItem(index) {
    openModal(true, index);
}

// 删除项目
function deleteItem(index) {
    if (confirm('确定要删除这条记录吗？')) {
        materialData.splice(index, 1);
        saveToLocalStorage();
        renderTable();
    }
}

// 搜索功能
function searchItems() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
        renderTable();
        return;
    }

    const filtered = materialData.filter(item => {
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        );
    });

    renderTable(filtered);
}

// 导入Excel
function importFromExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // 验证导入的数据结构
            if (jsonData.length > 0) {
                const requiredFields = ['物料编码', '物料类型', '物料名称', '操作人', '日期'];
                const firstItem = jsonData[0];
                const hasRequiredFields = requiredFields.every(field => 
                    Object.keys(firstItem).includes(field)
                );

                if (!hasRequiredFields) {
                    alert('导入的Excel文件格式不正确，缺少必要的列');
                    return;
                }

                // 转换数据格式以匹配我们的结构
                const convertedData = jsonData.map(item => ({
                    materialCode: item['物料编码'] || '',
                    materialType: item['物料类型'] || '',
                    materialName: item['物料名称'] || '',
                    materialDesc: item['物料描述'] || '',
                    moistureLevel: item['潮敏等级'] || 'N/A级',
                    repairTools: item['返工维修工具'] || '',
                    tempRange: item['温度范围'] || '',
                    repairCount: item['返工维修次数'] || 0,
                    specialReq: item['特殊要求'] || '',
                    operator: item['操作人'] || '',
                    operationDate: item['日期'] ? new Date(item['日期']).toISOString().split('T')[0] : ''
                }));

                // 合并数据
                materialData = [...materialData, ...convertedData];
                saveToLocalStorage();
                renderTable();
                alert(`成功导入 ${convertedData.length} 条记录`);
            } else {
                alert('Excel文件中没有数据');
            }
        } catch (error) {
            console.error('导入失败:', error);
            alert('导入失败，请检查文件格式是否正确');
        }
    };
    reader.readAsArrayBuffer(file);
}

// 导出到Excel
function exportToExcel() {
    if (materialData.length === 0) {
        alert('没有数据可导出');
        return;
    }

    // 准备导出的数据（转换为中文表头）
    const exportData = materialData.map(item => ({
        '物料编码': item.materialCode,
        '物料类型': item.materialType,
        '物料名称': item.materialName,
        '物料描述': item.materialDesc,
        '潮敏等级': item.moistureLevel,
        '返工维修工具': item.repairTools,
        '温度范围': item.tempRange,
        '返工维修次数': item.repairCount,
        '特殊要求': item.specialReq,
        '操作人': item.operator,
        '日期': item.operationDate
    }));

    // 创建工作簿和工作表
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '器件返工维修数据');

    // 生成文件名（包含当前日期）
    const today = new Date();
    const fileName = `器件返工维修数据_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2,'0')}${today.getDate().toString().padStart(2,'0')}.xlsx`;

    // 导出文件
    XLSX.writeFile(workbook, fileName);
}

// 绑定事件
function bindEvents() {
    // 新增按钮
    addBtn.addEventListener('click', () => openModal());
    
    // 保存按钮
    saveBtn.addEventListener('click', saveItem);
    
    // 取消和关闭按钮
    cancelBtn.addEventListener('click', closeModalFunc);
    closeModal.addEventListener('click', closeModalFunc);
    
    // 搜索按钮
    searchBtn.addEventListener('click', searchItems);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchItems();
    });
    
    // 导入导出
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importFromExcel);
    exportBtn.addEventListener('click', exportToExcel);
    
    // 点击模态框外部关闭
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModalFunc();
    });
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);

