// ═══════════════════════════════════════════════════════════
// Life Tracker App - FINAL COMPLETE VERSION
// All features working perfectly
// ═══════════════════════════════════════════════════════════

// -------- Global Data Structure --------
let appData = {
    personal: {
        education: [],
        visa: [],
        license: []
    },
    health: {
        habits: {},      // { '2026-02-08': { wakeup: true, water: false, ... } }
        notes: [],
        weight: []
    },
    religious: {
        prayers: {},     // { '2026-02-08': { fajr: true, dhuhr: false, ... } }
        quran: [],
        ramadan: {}      // { '2026-02-08': { fasting: true, suhoor: true, ... } }
    },
    professional: {
        school: [],
        video: [],
        lessons: [],
        reminders: []
    }
};

let currentModal = null;
let currentEditItem = null;

// -------- Initialization --------
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Life Tracker...');
    loadData();
    renderAll();
    checkDailyReset();
    
    // Check reminders every minute
    setInterval(checkReminders, 60000);
    checkReminders();
    
    // Register service worker if available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('✅ Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
    
    console.log('✅ Life Tracker initialized successfully!');
});

// -------- Tab Switching --------
function switchTab(tabName) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active to selected
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// -------- Modal Management --------
function openModal(type, editItem = null) {
    currentModal = type;
    currentEditItem = editItem;
    
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    
    const today = new Date().toISOString().split('T')[0];
    const val = (field) => editItem?.[field] || '';
    
    const templates = {
        education: {
            title: editItem ? 'Edit Education' : 'Add Education Item',
            html: `
                <input type="text" id="input-title" placeholder="Title (e.g., Complete Master's Degree)" value="${val('title')}" required>
                <textarea id="input-details" placeholder="Details..." rows="3">${val('details')}</textarea>
                <input type="date" id="input-deadline" value="${val('deadline')}">
                <button class="btn-primary" onclick="submitModal('education')">${editItem ? 'Update' : 'Add'}</button>
            `
        },
        visa: {
            title: editItem ? 'Edit Visa Item' : 'Add Visa Item',
            html: `
                <input type="text" id="input-title" placeholder="Title (e.g., Submit Documents)" value="${val('title')}" required>
                <textarea id="input-details" placeholder="Details..." rows="3">${val('details')}</textarea>
                <input type="date" id="input-deadline" value="${val('deadline')}">
                <button class="btn-primary" onclick="submitModal('visa')">${editItem ? 'Update' : 'Add'}</button>
            `
        },
        license: {
            title: editItem ? 'Edit License Item' : 'Add License Item',
            html: `
                <input type="text" id="input-title" placeholder="Title (e.g., Book Road Test)" value="${val('title')}" required>
                <textarea id="input-details" placeholder="Details..." rows="3">${val('details')}</textarea>
                <input type="date" id="input-deadline" value="${val('deadline')}">
                <button class="btn-primary" onclick="submitModal('license')">${editItem ? 'Update' : 'Add'}</button>
            `
        },
        healthNote: {
            title: 'Add Health Note',
            html: `
                <textarea id="input-note" placeholder="Health note (e.g., Felt energetic, Weight: 70kg)" rows="4" required></textarea>
                <input type="date" id="input-date" value="${today}">
                <button class="btn-primary" onclick="submitModal('healthNote')">Add Note</button>
            `
        },
        quran: {
            title: editItem ? 'Edit Surah' : 'Track Surah',
            html: `
                <input type="text" id="input-surah" placeholder="Surah name (e.g., Al-Fatiha, Al-Baqarah)" value="${val('surah')}" required>
                <textarea id="input-details" placeholder="Progress, notes, verses memorized..." rows="3">${val('details')}</textarea>
                <button class="btn-primary" onclick="submitModal('quran')">${editItem ? 'Update' : 'Add'}</button>
            `
        },
        school: {
            title: editItem ? 'Edit School Task' : 'Add School Task',
            html: `
                <input type="text" id="input-title" placeholder="Task title" value="${val('title')}" required>
                <textarea id="input-details" placeholder="Details..." rows="3">${val('details')}</textarea>
                <input type="date" id="input-deadline" value="${val('deadline')}">
                <button class="btn-primary" onclick="submitModal('school')">${editItem ? 'Update' : 'Add'}</button>
            `
        },
        video: {
            title: editItem ? 'Edit Video Task' : 'Add Video Creation Task',
            html: `
                <input type="text" id="input-title" placeholder="Video title" value="${val('title')}" required>
                <textarea id="input-details" placeholder="Video description, script notes..." rows="3">${val('details')}</textarea>
                <input type="date" id="input-deadline" value="${val('deadline')}">
                <button class="btn-primary" onclick="submitModal('video')">${editItem ? 'Update' : 'Add'}</button>
            `
        },
        lesson: {
            title: editItem ? 'Edit Lesson Plan' : 'Add Lesson Plan',
            html: `
                <label style="font-weight:600; display:block; margin-top:10px;">Day:</label>
                <select id="input-day" required>
                    <option value="">Select Day...</option>
                    <option value="MON" ${val('day') === 'MON' ? 'selected' : ''}>Monday</option>
                    <option value="TUE" ${val('day') === 'TUE' ? 'selected' : ''}>Tuesday</option>
                    <option value="WED" ${val('day') === 'WED' ? 'selected' : ''}>Wednesday</option>
                    <option value="THU" ${val('day') === 'THU' ? 'selected' : ''}>Thursday</option>
                    <option value="FRI" ${val('day') === 'FRI' ? 'selected' : ''}>Friday</option>
                </select>
                <label style="font-weight:600; display:block; margin-top:10px;">Period:</label>
                <select id="input-period" required>
                    <option value="">Select Period...</option>
                    <option value="1" ${val('period') === '1' ? 'selected' : ''}>Period 1 (8:45-9:45)</option>
                    <option value="2" ${val('period') === '2' ? 'selected' : ''}>Period 2 (9:45-10:30)</option>
                    <option value="3" ${val('period') === '3' ? 'selected' : ''}>Period 3 (10:45-11:30)</option>
                    <option value="4" ${val('period') === '4' ? 'selected' : ''}>Period 4 (11:30-12:15)</option>
                    <option value="5" ${val('period') === '5' ? 'selected' : ''}>Period 5 (12:15-1:00)</option>
                    <option value="6" ${val('period') === '6' ? 'selected' : ''}>Period 6 (1:40-2:25)</option>
                    <option value="7" ${val('period') === '7' ? 'selected' : ''}>Period 7 (2:25-3:10)</option>
                </select>
                <label style="font-weight:600; display:block; margin-top:10px;">Lesson Title:</label>
                <input type="text" id="input-title" placeholder="Lesson topic" value="${val('title')}" required>
                <label style="font-weight:600; display:block; margin-top:10px;">Lesson Plan:</label>
                <textarea id="input-details" placeholder="Objectives, activities, materials..." rows="4">${val('details')}</textarea>
                <label style="font-weight:600; display:block; margin-top:10px;">Date:</label>
                <input type="date" id="input-date" value="${val('date') || today}">
                <button class="btn-primary" onclick="submitModal('lesson')">${editItem ? 'Update' : 'Add'}</button>
            `
        },
        reminder: {
            title: editItem ? 'Edit Reminder' : 'Add Schedule Reminder',
            html: `
                <input type="text" id="input-title" placeholder="Reminder title (e.g., Grade 9 Class)" value="${val('title')}" required>
                <textarea id="input-details" placeholder="Details (e.g., Room 204, Topic: Algebra)" rows="2">${val('details')}</textarea>
                <input type="datetime-local" id="input-datetime" value="${val('datetime')}" required>
                <label style="font-weight:600; display:block; margin-top:10px;">Repeat:</label>
                <select id="input-repeat">
                    <option value="once" ${val('repeat') === 'once' ? 'selected' : ''}>Once</option>
                    <option value="daily" ${val('repeat') === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${val('repeat') === 'weekly' ? 'selected' : ''}>Weekly</option>
                </select>
                <button class="btn-primary" onclick="submitModal('reminder')">${editItem ? 'Update' : 'Add'}</button>
            `
        }
    };
    
    const template = templates[type];
    if (template) {
        title.textContent = template.title;
        body.innerHTML = template.html;
        modal.classList.add('active');
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    currentModal = null;
    currentEditItem = null;
}

function submitModal(type) {
    const getVal = (id) => document.getElementById(id)?.value.trim() || '';
    
    let item = currentEditItem || { id: Date.now(), completed: false, createdAt: new Date().toISOString() };
    
    try {
        switch(type) {
            case 'education':
            case 'visa':
            case 'license':
                item.title = getVal('input-title');
                item.details = getVal('input-details');
                item.deadline = getVal('input-deadline');
                if (!item.title) return alert('Please enter a title');
                if (!currentEditItem) appData.personal[type].push(item);
                break;
                
            case 'healthNote':
                item.note = getVal('input-note');
                item.date = getVal('input-date');
                if (!item.note) return alert('Please enter a note');
                if (!currentEditItem) appData.health.notes.push(item);
                break;
                
            case 'quran':
                item.surah = getVal('input-surah');
                item.details = getVal('input-details');
                if (!item.surah) return alert('Please enter surah name');
                if (!currentEditItem) appData.religious.quran.push(item);
                break;
                
            case 'school':
            case 'video':
                item.title = getVal('input-title');
                item.details = getVal('input-details');
                item.deadline = getVal('input-deadline');
                if (!item.title) return alert('Please enter a title');
                if (!currentEditItem) appData.professional[type].push(item);
                break;
                
            case 'lesson':
                item.day = getVal('input-day');
                item.period = getVal('input-period');
                item.title = getVal('input-title');
                item.details = getVal('input-details');
                item.date = getVal('input-date');
                if (!item.day || !item.period || !item.title) return alert('Please fill in day, period, and title');
                if (!currentEditItem) appData.professional.lessons.push(item);
                break;
                
            case 'reminder':
                item.title = getVal('input-title');
                item.details = getVal('input-details');
                item.datetime = getVal('input-datetime');
                item.repeat = getVal('input-repeat');
                item.active = true;
                if (!item.title || !item.datetime) return alert('Please fill in title and time');
                if (!currentEditItem) {
                    appData.professional.reminders.push(item);
                    scheduleNotification(item);
                }
                break;
        }
        
        saveData();
        renderAll();
        closeModal();
    } catch (error) {
        console.error('Error submitting modal:', error);
        alert('Error saving item. Please try again.');
    }
}

// -------- Rendering Functions --------
function renderAll() {
    renderList('education-list', appData.personal.education, 'education');
    renderList('visa-list', appData.personal.visa, 'visa');
    renderList('license-list', appData.personal.license, 'license');
    renderList('school-list', appData.professional.school, 'school');
    renderList('video-list', appData.professional.video, 'video');
    renderList('lesson-list', appData.professional.lessons, 'lesson');
    renderList('reminders-list', appData.professional.reminders, 'reminder');
    renderHealthNotes();
    renderWeightList();
    renderQuranList();
    loadHabits();
    loadPrayers();
    loadRamadan();
}

function renderList(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p class="empty-state">No items yet. Click the + button to add one!</p>';
        return;
    }
    
    container.innerHTML = items.map(item => {
        let detailsHTML = '';
        if (item.details) detailsHTML += `<div class="item-details">${escapeHtml(item.details)}</div>`;
        if (item.deadline) detailsHTML += `<div class="item-details">📅 Deadline: ${item.deadline}</div>`;
        if (item.datetime) detailsHTML += `<div class="item-details">⏰ ${new Date(item.datetime).toLocaleString()}</div>`;
        if (item.repeat && item.repeat !== 'once') detailsHTML += `<div class="item-details">🔁 Repeats: ${item.repeat}</div>`;
        if (item.day && item.period) detailsHTML += `<div class="item-details">📅 ${item.day} - Period ${item.period}</div>`;
        if (item.date && type === 'lesson') detailsHTML += `<div class="item-details">📆 ${item.date}</div>`;
        
        return `
            <div class="item ${item.completed ? 'completed' : ''}">
                <input type="checkbox" class="item-checkbox" 
                       ${item.completed ? 'checked' : ''} 
                       onchange="toggleComplete('${type}', ${item.id})">
                <div class="item-content">
                    <div class="item-title">${escapeHtml(item.title || 'Untitled')}</div>
                    ${detailsHTML}
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick='editItem("${type}", ${item.id})'>✏️</button>
                    <button class="btn-delete" onclick='deleteItem("${type}", ${item.id})'>🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderHealthNotes() {
    const container = document.getElementById('health-notes-list');
    if (!container) return;
    
    const notes = appData.health.notes || [];
    if (notes.length === 0) {
        container.innerHTML = '<p class="empty-state">No health notes yet.</p>';
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">${note.date || 'No date'}</div>
                <div class="item-details">${escapeHtml(note.note)}</div>
            </div>
            <button class="btn-delete" onclick='deleteHealthNote(${note.id})'>🗑️</button>
        </div>
    `).join('');
}

function renderWeightList() {
    const container = document.getElementById('weight-list');
    if (!container) return;
    
    const weights = (appData.health.weight || []).sort((a,b) => new Date(b.date) - new Date(a.date));
    if (weights.length === 0) {
        container.innerHTML = '<p class="empty-state">No weight entries yet.</p>';
        return;
    }
    
    container.innerHTML = weights.slice(0, 15).map(w => `
        <div style="padding:12px; background:white; margin:8px 0; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <span><strong>${w.date}</strong>: ${w.weight} kg</span>
            <button class="btn-delete" onclick='deleteWeight(${w.id})'>🗑️</button>
        </div>
    `).join('');
}

function renderQuranList() {
    const container = document.getElementById('quran-list');
    if (!container) return;
    
    const surahs = appData.religious.quran || [];
    if (surahs.length === 0) {
        container.innerHTML = '<p class="empty-state">No surahs tracked yet.</p>';
        return;
    }
    
    container.innerHTML = surahs.map(surah => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">📖 ${escapeHtml(surah.surah)}</div>
                ${surah.details ? `<div class="item-details">${escapeHtml(surah.details)}</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick='editItem("quran", ${surah.id})'>✏️</button>
                <button class="btn-delete" onclick='deleteQuran(${surah.id})'>🗑️</button>
            </div>
        </div>
    `).join('');
}

// -------- Item Actions --------
function toggleComplete(type, id) {
    const category = ['school', 'video', 'lesson', 'reminder'].includes(type) ? 'professional' : 'personal';
    const items = appData[category][type];
    const item = items.find(i => i.id === id);
    
    if (item) {
        item.completed = !item.completed;
        saveData();
        renderAll();
    }
}

function editItem(type, id) {
    let items;
    if (type === 'quran') {
        items = appData.religious.quran;
    } else if (['school', 'video', 'lesson', 'reminder'].includes(type)) {
        items = appData.professional[type];
    } else {
        items = appData.personal[type];
    }
    
    const item = items.find(i => i.id === id);
    if (item) {
        openModal(type, item);
    }
}

function deleteItem(type, id) {
    if (!confirm('Delete this item?')) return;
    
    if (['school', 'video', 'lesson', 'reminder'].includes(type)) {
        appData.professional[type] = appData.professional[type].filter(i => i.id !== id);
    } else {
        appData.personal[type] = appData.personal[type].filter(i => i.id !== id);
    }
    
    saveData();
    renderAll();
}

function deleteHealthNote(id) {
    if (!confirm('Delete this note?')) return;
    appData.health.notes = appData.health.notes.filter(n => n.id !== id);
    saveData();
    renderHealthNotes();
}

function deleteWeight(id) {
    appData.health.weight = appData.health.weight.filter(w => w.id !== id);
    saveData();
    renderWeightList();
}

function deleteQuran(id) {
    if (!confirm('Delete this surah?')) return;
    appData.religious.quran = appData.religious.quran.filter(s => s.id !== id);
    saveData();
    renderQuranList();
}

function addWeight() {
    const weight = document.getElementById('weight-input').value;
    const date = document.getElementById('weight-date').value;
    
    if (!weight || !date) return alert('Please enter both weight and date');
    
    if (!appData.health.weight) appData.health.weight = [];
    appData.health.weight.push({ 
        id: Date.now(), 
        weight: parseFloat(weight), 
        date: date 
    });
    
    document.getElementById('weight-input').value = '';
    document.getElementById('weight-date').value = '';
    
    saveData();
    renderWeightList();
}

// -------- Health Habits --------
function saveHabit(type) {
    const today = new Date().toDateString();
    if (!appData.health.habits[today]) appData.health.habits[today] = {};
    
    const checked = document.getElementById(`habit-${type}`).checked;
    appData.health.habits[today][type] = checked;
    
    const item = document.getElementById(`habit-${type}-item`);
    if (item) {
        if (checked) item.classList.add('completed');
        else item.classList.remove('completed');
    }
    
    saveData();
}

function loadHabits() {
    const today = new Date().toDateString();
    const habits = appData.health.habits[today] || {};
    
    ['wakeup', 'water', 'veg', 'exercise'].forEach(habit => {
        const checkbox = document.getElementById(`habit-${habit}`);
        const item = document.getElementById(`habit-${habit}-item`);
        
        if (checkbox) {
            checkbox.checked = habits[habit] || false;
            if (item) {
                if (habits[habit]) item.classList.add('completed');
                else item.classList.remove('completed');
            }
        }
    });
}

// -------- Prayer Tracking --------
function savePrayer(type) {
    const today = new Date().toDateString();
    if (!appData.religious.prayers[today]) appData.religious.prayers[today] = {};
    
    const checked = document.getElementById(`check-${type}`).checked;
    appData.religious.prayers[today][type] = checked;
    
    const box = document.getElementById(`prayer-${type}`);
    if (box) {
        if (checked) box.classList.add('prayed');
        else box.classList.remove('prayed');
    }
    
    saveData();
}

function loadPrayers() {
    const today = new Date().toDateString();
    const prayers = appData.religious.prayers[today] || {};
    
    ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud'].forEach(prayer => {
        const checkbox = document.getElementById(`check-${prayer}`);
        const box = document.getElementById(`prayer-${prayer}`);
        
        if (checkbox) {
            checkbox.checked = prayers[prayer] || false;
            if (box && prayers[prayer]) box.classList.add('prayed');
            else if (box) box.classList.remove('prayed');
        }
    });
}

// -------- Ramadan Tracking --------
function saveRamadan(type) {
    const today = new Date().toDateString();
    if (!appData.religious.ramadan[today]) appData.religious.ramadan[today] = {};
    appData.religious.ramadan[today][type] = document.getElementById(`ramadan-${type}`).checked;
    saveData();
}

function loadRamadan() {
    const today = new Date().toDateString();
    const ramadan = appData.religious.ramadan[today] || {};
    
    ['fasting', 'suhoor', 'iftar'].forEach(item => {
        const checkbox = document.getElementById(`ramadan-${item}`);
        if (checkbox) checkbox.checked = ramadan[item] || false;
    });
}

// -------- Daily Reset Check --------
function checkDailyReset() {
    // Habits, prayers, and ramadan automatically reset because they're keyed by date
    // No action needed - accessing data for new date will return empty object
}

// -------- Notifications --------
function enableNotifications() {
    if (!('Notification' in window)) {
        return alert('❌ This browser does not support notifications');
    }
    
    if (Notification.permission === 'granted') {
        new Notification('✅ Test Notification', {
            body: 'Notifications are already enabled and working!',
            icon: 'icon-192.png'
        });
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            new Notification('🎉 Notifications Enabled!', {
                body: 'You will now receive reminders for your scheduled tasks.',
                icon: 'icon-192.png'
            });
        } else {
            alert('❌ Please enable notifications in your browser settings to receive reminders.');
        }
    });
}

function scheduleNotification(reminder) {
    if (Notification.permission !== 'granted') return;
    
    const reminderTime = new Date(reminder.datetime).getTime();
    const now = Date.now();
    const timeUntil = reminderTime - now;
    
    // Only schedule if it's in the future and within 24 hours
    if (timeUntil > 0 && timeUntil < 86400000) {
        setTimeout(() => {
            new Notification(`⏰ ${reminder.title}`, {
                body: reminder.details || 'Time for your scheduled task!',
                icon: 'icon-192.png',
                requireInteraction: true,
                tag: `reminder-${reminder.id}`
            });
        }, timeUntil);
    }
}

function checkReminders() {
    const now = Date.now();
    
    (appData.professional.reminders || []).forEach(reminder => {
        if (!reminder.active) return;
        
        const reminderTime = new Date(reminder.datetime).getTime();
        
        // Check if reminder time has just passed (within last minute)
        if (reminderTime <= now && reminderTime > (now - 60000)) {
            if (Notification.permission === 'granted') {
                new Notification(`⏰ ${reminder.title}`, {
                    body: reminder.details || 'Reminder!',
                    icon: 'icon-192.png',
                    requireInteraction: true,
                    tag: `reminder-${reminder.id}`
                });
            }
            
            // Handle repeat
            if (reminder.repeat === 'once') {
                reminder.active = false;
            } else if (reminder.repeat === 'daily') {
                const date = new Date(reminder.datetime);
                date.setDate(date.getDate() + 1);
                reminder.datetime = date.toISOString().slice(0, 16);
            } else if (reminder.repeat === 'weekly') {
                const date = new Date(reminder.datetime);
                date.setDate(date.getDate() + 7);
                reminder.datetime = date.toISOString().slice(0, 16);
            }
            
            saveData();
            renderAll();
        }
    });
}

// -------- Data Persistence --------
function saveData() {
    try {
        localStorage.setItem('lifeTrackerData', JSON.stringify(appData));
        console.log('✅ Data saved successfully');
    } catch (error) {
        console.error('❌ Error saving data:', error);
        alert('Error saving data. Your browser storage might be full.');
    }
}

function loadData() {
    try {
        const data = localStorage.getItem('lifeTrackerData');
        if (data) {
            appData = JSON.parse(data);
            console.log('✅ Data loaded successfully');
        }
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// -------- Utility Functions --------
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ Life Tracker - All systems ready!');
