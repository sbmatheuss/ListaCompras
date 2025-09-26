// Elementos do DOM
const itemInput = document.getElementById('itemInput');
const addButton = document.getElementById('addButton');
const shoppingList = document.getElementById('shoppingList');
const notification = document.getElementById('notification');
const notificationClose = document.getElementById('notificationClose');
const backButton = document.getElementById('backButton');

// Contador para IDs únicos
let itemCounter = 5;

// Array para armazenar os itens
let items = [
    { id: 1, text: 'Pão de forma', completed: false },
    { id: 2, text: 'Café preto', completed: false },
    { id: 3, text: 'Suco de laranja', completed: false },
    { id: 4, text: 'Bolacha', completed: false }
];

// Função para criar um novo item da lista
function createListItem(item) {
    const listItem = document.createElement('div');
    listItem.className = 'list-item';
    listItem.dataset.item = item.text.toLowerCase().replace(/\s+/g, '-');
    
    listItem.innerHTML = `
        <div class="item-content">
            <input type="checkbox" id="item-${item.id}" class="item-checkbox" ${item.completed ? 'checked' : ''}>
            <label for="item-${item.id}" class="item-label">${item.text}</label>
        </div>
        <button class="delete-button" data-item="${item.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        </button>
    `;
    
    return listItem;
}

// Função para renderizar a lista
function renderList() {
    shoppingList.innerHTML = '';
    items.forEach(item => {
        const listItem = createListItem(item);
        shoppingList.appendChild(listItem);
    });
    
    // Adicionar event listeners para os novos elementos
    addEventListeners();
}

// Função para adicionar event listeners
function addEventListeners() {
    // Event listeners para checkboxes
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const itemId = parseInt(this.id.replace('item-', ''));
            const item = items.find(item => item.id === itemId);
            if (item) {
                item.completed = this.checked;
                saveToLocalStorage();
            }
        });
    });
    
    // Event listeners para botões de deletar
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.dataset.item);
            deleteItem(itemId);
        });
    });
}

// Função para adicionar um novo item
function addItem() {
    const text = itemInput.value.trim();
    
    if (text === '') {
        itemInput.focus();
        return;
    }
    
    // Verificar se o item já existe
    const existingItem = items.find(item => 
        item.text.toLowerCase() === text.toLowerCase()
    );
    
    if (existingItem) {
        alert('Este item já está na lista!');
        itemInput.focus();
        return;
    }
    
    // Criar novo item
    const newItem = {
        id: itemCounter++,
        text: text,
        completed: false
    };
    
    items.push(newItem);
    itemInput.value = '';
    
    // Renderizar lista e salvar
    renderList();
    saveToLocalStorage();
    
    // Animar o novo item
    const newListItem = shoppingList.lastElementChild;
    newListItem.style.opacity = '0';
    newListItem.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        newListItem.style.transition = 'all 0.3s ease';
        newListItem.style.opacity = '1';
        newListItem.style.transform = 'translateY(0)';
    }, 10);
}

// Função para deletar um item
function deleteItem(itemId) {
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
        renderList();
        saveToLocalStorage();
        showNotification();
    }
}

// Função para mostrar notificação
function showNotification() {
    notification.classList.add('show');
    
    // Auto-hide após 3 segundos
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

// Função para esconder notificação
function hideNotification() {
    notification.classList.remove('show');
}

// Função para salvar no localStorage
function saveToLocalStorage() {
    localStorage.setItem('quicklist-items', JSON.stringify(items));
}

// Função para carregar do localStorage
function loadFromLocalStorage() {
    const savedItems = localStorage.getItem('quicklist-items');
    if (savedItems) {
        items = JSON.parse(savedItems);
        // Atualizar o contador para evitar IDs duplicados
        if (items.length > 0) {
            itemCounter = Math.max(...items.map(item => item.id)) + 1;
        }
    }
}

// Função para validar entrada
function validateInput() {
    const text = itemInput.value.trim();
    addButton.disabled = text === '';
}

// Event Listeners principais
addButton.addEventListener('click', addItem);

itemInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addItem();
    }
});

itemInput.addEventListener('input', validateInput);

notificationClose.addEventListener('click', hideNotification);

backButton.addEventListener('click', function() {
    // Simular navegação de volta
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // Se não houver histórico, apenas recarregar a página
        window.location.reload();
    }
});

// Fechar notificação ao clicar fora dela
document.addEventListener('click', function(e) {
    if (notification.classList.contains('show') && 
        !notification.contains(e.target)) {
        hideNotification();
    }
});

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Esc para fechar notificação
    if (e.key === 'Escape' && notification.classList.contains('show')) {
        hideNotification();
    }
    
    // Ctrl/Cmd + Enter para adicionar item rapidamente
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        itemInput.focus();
    }
});

// Função para limpar itens completados
function clearCompleted() {
    items = items.filter(item => !item.completed);
    renderList();
    saveToLocalStorage();
}

// Função para marcar todos como completados
function toggleAllCompleted() {
    const allCompleted = items.every(item => item.completed);
    items.forEach(item => {
        item.completed = !allCompleted;
    });
    renderList();
    saveToLocalStorage();
}

// Adicionar funcionalidades extras via console (para desenvolvimento)
window.quicklistUtils = {
    clearCompleted,
    toggleAllCompleted,
    exportData: () => JSON.stringify(items),
    importData: (data) => {
        try {
            items = JSON.parse(data);
            renderList();
            saveToLocalStorage();
            return true;
        } catch (e) {
            console.error('Erro ao importar dados:', e);
            return false;
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    renderList();
    validateInput();
    
    // Focar no input ao carregar a página
    setTimeout(() => {
        itemInput.focus();
    }, 100);
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registrado com sucesso:', registration.scope);
            })
            .catch(function(error) {
                console.log('Falha ao registrar ServiceWorker:', error);
            });
    });
}

// Função para detectar se está em dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Ajustar comportamento para mobile
if (isMobile()) {
    // Prevenir zoom ao focar no input
    itemInput.addEventListener('focus', function() {
        if (isMobile()) {
            document.querySelector('meta[name=viewport]').setAttribute(
                'content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );
        }
    });
    
    itemInput.addEventListener('blur', function() {
        if (isMobile()) {
            document.querySelector('meta[name=viewport]').setAttribute(
                'content', 
                'width=device-width, initial-scale=1.0'
            );
        }
    });
}

// Animação de entrada
document.body.style.opacity = '0';
window.addEventListener('load', function() {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '1';
});

