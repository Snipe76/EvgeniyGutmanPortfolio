// ui.js
// Renders UI and attaches event listeners

export class UIRenderer {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.filter = 'all';

        // Task-related elements
        this.listElem = document.querySelector('.task-list');
        this.headerTitle = document.querySelector('.header__title');
        this.filterButtons = document.querySelectorAll('.header__filter');
        this.addButton = document.getElementById('add-task-button') || document.querySelector('.add-task-button');
        console.log('Add button found:', this.addButton); // Debug line
        this.taskModal = document.getElementById('task-modal');
        this.taskForm = document.getElementById('task-form');
        this.cancelTaskButton = document.getElementById('cancel-task');

        // List-related elements
        this.listsContainer = document.getElementById('lists-container');
        this.newListButton = document.getElementById('new-list-button');
        this.listModal = document.getElementById('list-modal');
        this.listForm = document.getElementById('list-form');
        this.cancelListButton = document.getElementById('cancel-list');

        // Subscribe to state changes
        this.stateManager.subscribeToActiveList(this.renderActiveList.bind(this));
        this.stateManager.subscribeToLists(this.renderLists.bind(this));
    }

    renderActiveList(list) {
        this.headerTitle.textContent = list.title;
        this._renderTasks(list.tasks);
        this._updateFilterUI();
    }

    renderLists(lists) {
        this.listsContainer.innerHTML = '';
        lists.forEach(list => {
            const item = this._createListItem(list);
            this.listsContainer.appendChild(item);
        });
    }

    _renderTasks(tasks) {
        this.listElem.innerHTML = '';
        const filtered = this._applyFilter(tasks);
        if (filtered.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'task-list__empty';
            emptyMessage.textContent = this.filter === 'all' ?
                'No tasks yet. Add one below!' :
                `No ${this.filter} tasks`;
            this.listElem.appendChild(emptyMessage);
        } else {
            filtered.forEach((task) => {
                const card = this._createTaskCard(task);
                this.listElem.appendChild(card);
            });
        }
    }

    _applyFilter(tasks) {
        if (this.filter === 'active') return tasks.filter((t) => !t.completed);
        if (this.filter === 'completed') return tasks.filter((t) => t.completed);
        return tasks;
    }

    _createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        if (task.completed) card.classList.add('task-card--completed');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.className = 'task-card__checkbox';
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            task.updatedAt = Date.now();
            this.stateManager.updateTask(task);
        });
        card.appendChild(checkbox);

        // Content
        const content = document.createElement('div');
        content.className = 'task-card__content';
        const title = document.createElement('h3');
        title.className = 'task-card__title';
        title.textContent = task.title;
        content.appendChild(title);
        const metadata = document.createElement('div');
        metadata.className = 'task-card__metadata';
        if (task.dueDate) {
            const dateSpan = document.createElement('span');
            dateSpan.textContent = task.dueDate + (task.dueTime ? ' ' + task.dueTime : '');
            metadata.appendChild(dateSpan);
        }
        if (task.location) {
            const locSpan = document.createElement('span');
            locSpan.textContent = task.location;
            metadata.appendChild(locSpan);
        }
        content.appendChild(metadata);
        card.appendChild(content);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'task-card__actions';
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => this._openEditModal(task));
        actions.appendChild(editBtn);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => this.stateManager.deleteTask(task.id));
        actions.appendChild(delBtn);
        card.appendChild(actions);

        return card;
    }

    _createListItem(list) {
        const item = document.createElement('div');
        item.className = 'list-item';
        if (list.id === this.stateManager.activeList.id) {
            item.classList.add('list-item--active');
        }

        const title = document.createElement('h3');
        title.className = 'list-item__title';
        title.textContent = list.title;
        item.appendChild(title);

        const count = document.createElement('div');
        count.className = 'list-item__count';
        count.textContent = `${list.tasks.length} tasks`;
        item.appendChild(count);

        // Only add delete button if we have more than one list
        if (this.stateManager.lists.length > 1) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'list-item__delete';
            deleteButton.textContent = '×';
            deleteButton.title = 'Delete list';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete list "${list.title}"? This cannot be undone.`)) {
                    this.stateManager.deleteList(list.id);
                }
            });
            item.appendChild(deleteButton);
        }

        // Switch to list when clicked
        item.addEventListener('click', () => {
            this.stateManager.switchList(list.id);
        });

        return item;
    }

    _updateFilterUI() {
        this.filterButtons.forEach((btn) => {
            btn.classList.toggle('header__filter--active', btn.dataset.filter === this.filter);
        });
    }

    attachEventListeners() {
        // Filters
        this.filterButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.filter = btn.dataset.filter;
                this.renderActiveList(this.stateManager.activeList);
            });
        });

        // Add Task
        if (this.addButton) {
            console.log('Attaching click listener to add button');
            this.addButton.addEventListener('click', () => {
                console.log('Add button clicked');
                this._openAddTaskModal();
            });
        } else {
            console.error('Add button not found in DOM');
        }

        // Task Form
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.taskForm);
            const task = {
                id: this.taskForm.dataset.taskId || crypto.randomUUID(),
                title: formData.get('title'),
                dueDate: formData.get('dueDate'),
                dueTime: formData.get('dueTime'),
                location: formData.get('location'),
                notes: formData.get('notes'),
                completed: this.taskForm.elements.completed.checked,
                updatedAt: Date.now()
            };
            if (this.taskForm.dataset.taskId) {
                this.stateManager.updateTask(task);
            } else {
                this.stateManager.addTask(task);
            }
            this.taskModal.close();
        });
        this.cancelTaskButton.addEventListener('click', () => this.taskModal.close());

        // New List Button
        this.newListButton.addEventListener('click', () => this._openNewListModal());

        // List Form
        this.listForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.listForm);
            const listTitle = formData.get('listTitle');
            if (listTitle) {
                const newList = this.stateManager.addList(listTitle);
                this.stateManager.switchList(newList.id);
            }
            this.listModal.close();
        });
        this.cancelListButton.addEventListener('click', () => this.listModal.close());
    }

    _openAddTaskModal() {
        this.taskForm.reset();
        delete this.taskForm.dataset.taskId;
        this.taskModal.querySelector('.task-form__title').textContent = 'Add Task';
        this.taskModal.showModal();
    }

    _openEditModal(task) {
        this.taskModal.querySelector('.task-form__title').textContent = 'Edit Task';
        this.taskForm.dataset.taskId = task.id;
        this.taskForm.elements.title.value = task.title;
        this.taskForm.elements.dueDate.value = task.dueDate;
        this.taskForm.elements.dueTime.value = task.dueTime;
        this.taskForm.elements.location.value = task.location;
        this.taskForm.elements.notes.value = task.notes;
        this.taskForm.elements.completed.checked = task.completed;
        this.taskModal.showModal();
    }

    _openNewListModal() {
        this.listForm.reset();
        this.listModal.showModal();
    }
} 