const { createApp } = Vue;

createApp({
    data() {
        return {
            currentDate: this.getTodayString(),
            dayData: {
                title: '',
                notes: '',
                habits: {
                    mood: null,
                    trabajo: null,
                    amor: null,
                    escritura: null,
                    lectura: null,
                    ajedrez: null,
                    gimnasio: null
                }
            },
            moods: [
                { value: 1, emoji: '😢', label: 'Muy mal' },
                { value: 2, emoji: '😕', label: 'Mal' },
                { value: 3, emoji: '😐', label: 'Normal' },
                { value: 4, emoji: '😊', label: 'Bien' },
                { value: 5, emoji: '😄', label: 'Muy bien' }
            ],
            booleanHabits: [
                { key: 'trabajo', label: 'Trabajo', emoji: '💻' },
                { key: 'amor', label: 'Amor', emoji: '❤️' },
                { key: 'escritura', label: 'Escritura', emoji: '✍️' },
                { key: 'lectura', label: 'Lectura', emoji: '📘' },
                { key: 'ajedrez', label: 'Ajedrez', emoji: '♟️' },
                { key: 'gimnasio', label: 'Gimnasio', emoji: '🏋️' }
            ],
            googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwdGPe9rUNAEjLhfl64LebzsrDc1PacscJYmLL2HWLMV-cxgDpub8WEycKhQ4CADP7ZTw/exec',
            isSyncing: false,
            syncStatus: ''
        };
    },
    computed: {
        formattedDate() {
            const date = new Date(this.currentDate + 'T00:00:00');
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            return date.toLocaleDateString('es-ES', options);
        },
        renderedNotes() {
            if (!this.dayData.notes) return '<p class="empty-note">Sin notas...</p>';
            return marked.parse(this.dayData.notes);
        }
    },
    methods: {
        getTodayString() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        previousDay() {
            const date = new Date(this.currentDate + 'T00:00:00');
            date.setDate(date.getDate() - 1);
            this.currentDate = this.dateToString(date);
            this.loadDayData();
        },
        nextDay() {
            const date = new Date(this.currentDate + 'T00:00:00');
            date.setDate(date.getDate() + 1);
            this.currentDate = this.dateToString(date);
            this.loadDayData();
        },
        goToToday() {
            this.currentDate = this.getTodayString();
            this.loadDayData();
        },
        dateToString(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        setMood(value) {
            this.dayData.habits.mood = value;
            this.saveDayData();
        },
        toggleHabit(habitKey, value) {
            if (this.dayData.habits[habitKey] === value) {
                this.dayData.habits[habitKey] = null;
            } else {
                this.dayData.habits[habitKey] = value;
            }
            this.saveDayData();
        },
        toggleHabitSwitch(habitKey, event) {
            this.dayData.habits[habitKey] = event.target.checked ? true : null;
            this.saveDayData();
        },
        async saveDayData() {
            // Guardar en localStorage primero
            const data = JSON.stringify(this.dayData);
            localStorage.setItem(`habit-tracker-${this.currentDate}`, data);

            // Sincronizar con Google Sheets
            await this.syncToGoogleSheets();
        },
        async syncToGoogleSheets() {
            if (this.isSyncing) return;

            this.isSyncing = true;
            this.syncStatus = 'Sincronizando...';

            try {
                const response = await fetch(this.googleScriptUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'save',
                        date: this.currentDate,
                        title: this.dayData.title,
                        notes: this.dayData.notes,
                        habits: this.dayData.habits
                    })
                });

                this.syncStatus = '✓ Sincronizado';
                setTimeout(() => {
                    this.syncStatus = '';
                }, 2000);
            } catch (error) {
                console.error('Error al sincronizar:', error);
                this.syncStatus = '✗ Error al sincronizar';
                setTimeout(() => {
                    this.syncStatus = '';
                }, 3000);
            } finally {
                this.isSyncing = false;
            }
        },
        async loadFromGoogleSheets() {
            try {
                const response = await fetch(`${this.googleScriptUrl}?date=${this.currentDate}`);
                const result = await response.json();

                if (result.success && result.data) {
                    return result.data;
                }
                return null;
            } catch (error) {
                console.error('Error al cargar desde Google Sheets:', error);
                return null;
            }
        },
        async loadDayData() {
            // Primero intentar cargar desde Google Sheets
            const googleData = await this.loadFromGoogleSheets();

            if (googleData) {
                this.dayData = {
                    title: googleData.title || '',
                    notes: googleData.notes || '',
                    habits: googleData.habits || {
                        mood: null,
                        trabajo: null,
                        amor: null,
                        escritura: null,
                        lectura: null,
                        ajedrez: null,
                        gimnasio: null
                    }
                };
                // Guardar en localStorage también
                const data = JSON.stringify(this.dayData);
                localStorage.setItem(`habit-tracker-${this.currentDate}`, data);
            } else {
                // Si no hay datos en Google Sheets, cargar desde localStorage
                const saved = localStorage.getItem(`habit-tracker-${this.currentDate}`);
                if (saved) {
                    this.dayData = JSON.parse(saved);
                } else {
                    this.dayData = {
                        title: '',
                        notes: '',
                        habits: {
                            mood: null,
                            trabajo: null,
                            amor: null,
                            escritura: null,
                            lectura: null,
                            ajedrez: null,
                            gimnasio: null
                        }
                    };
                }
            }
        }
    },
    mounted() {
        this.loadDayData();
    }
}).mount('#app');
