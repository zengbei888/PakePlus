
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
                <td class="py-3 px-4">${item.materialCode}</td>
                <td class="py-3 px-4">${item.materialType}</td>
                <td class="py-3 px-4">${item.materialName}</td>
				<td class="py-3 px-4">${item.materialDesc}</td>
				<td class="py-3 px-4">${item.moistureLevel}</td>
				<td class="py-3 px-4">${item.repairTools}</td>
				<td class="py-3 px-4">${item.tempRange}</td>
				<td class="py-3 px-4">${item.repairCount}</td>
				<td class="py-3 px-4">${item.specialReq}</td>
				<td class="py-3 px-4">${item.operationDate}</td>
				<td class="py-3 px-4">${item.operator}</td>
				<td class="py-3 px-4">
                    <button class="edit-btn px-3 py-1 bg-blue-100 text-blue-600 rounded mr-2 hover:bg-blue-200 transition" data-index="${index}">
                        <i class="fas fa-edit mr-1"></i>编辑
                    </button>
                    <button class="delete-btn px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition" data-index="${index}">
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
