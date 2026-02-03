// ========================================
// GATITXS GAMING - GOOGLE SHEETS INTEGRATION
// ========================================
// Versión actualizada con nombres de campos correctos

// PASO 1: Configuración
const SHEET_ID = 'TU_SHEET_ID_AQUI'; // Ejemplo: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
const API_KEY = 'TU_API_KEY_AQUI';   // Tu API Key de Google Cloud Console
const SHEET_NAME_USUARIOS = 'Usuarios';
const SHEET_NAME_PREGUNTAS = 'Preguntas';
const APPS_SCRIPT_URL = 'TU_APPS_SCRIPT_URL_AQUI'; // URL del Apps Script desplegado

// ========================================
// FUNCIONES DE GOOGLE SHEETS
// ========================================

// Cargar usuarios desde Google Sheets
async function loadPlayersFromSheet() {
    const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME_USUARIOS}?key=${API_KEY}`;
    
    try {
        showNotification('📊 Cargando datos desde Google Sheets...');
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            throw new Error('Error al conectar con Google Sheets');
        }
        
        const data = await response.json();
        const rows = data.values;
        
        if (!rows || rows.length === 0) {
            throw new Error('No hay datos en la hoja');
        }
        
        // Convertir filas a objeto playersData
        // Estructura: Numero_ID | Total_score | Descuento_Frito | Premios_magicos | Credimiau | Friend_code | Cumpleaños | Nombre_frito | Emoji
        playersData = {};
        
        // Saltar la primera fila (headers)
        rows.slice(1).forEach(row => {
            if (row[0]) { // Solo si hay Numero_ID
                playersData[row[0]] = {
                    Numero_ID: row[0] || '',
                    Total_score: parseInt(row[1]) || 0,
                    Descuento_Frito: row[2] || 'Sin descuentos',
                    Premios_magicos: row[3] || 'Sin premios',
                    Credimiau: row[4] || '0',
                    Friend_code: row[5] || 'N/A',
                    Cumpleaños: row[6] || '01/01/2000',
                    Nombre_frito: row[7] || 'Sin nombre',
                    Emoji: row[8] || '🐱'
                };
            }
        });
        
        console.log('✅ Datos cargados exitosamente:', Object.keys(playersData).length, 'jugadores');
        showNotification('✅ Datos cargados desde Google Sheets');
        
        return true;
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        showNotification('⚠️ Error al conectar con Google Sheets. Usando datos de ejemplo.');
        
        // Usar datos de ejemplo si falla
        useFallbackData();
        return false;
    }
}

// Cargar preguntas de usuarios desde Google Sheets
async function loadQuestionsFromSheet() {
    const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME_PREGUNTAS}?key=${API_KEY}`;
    
    try {
        const response = await fetch(SHEET_URL);
        
        if (!response.ok) {
            return [];
        }
        
        const data = await response.json();
        const rows = data.values;
        
        if (!rows || rows.length === 0) {
            return [];
        }
        
        // Convertir a array de preguntas
        const questions = [];
        rows.slice(1).forEach(row => {
            if (row[0]) {
                questions.push({
                    question: row[0],
                    date: row[1] || new Date().toLocaleString('es-MX'),
                    status: row[2] || 'Pendiente'
                });
            }
        });
        
        return questions;
    } catch (error) {
        console.error('Error cargando preguntas:', error);
        return [];
    }
}

// Guardar cambios en Google Sheets
async function saveToSheet(playerData) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'TU_APPS_SCRIPT_URL_AQUI') {
        console.warn('⚠️ Apps Script URL no configurada. Los cambios no se guardarán en Google Sheets.');
        showNotification('⚠️ Cambios guardados localmente (no sincronizados con Google Sheets)');
        return false;
    }
    
    try {
        showNotification('💾 Guardando en Google Sheets...');
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Necesario para Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update',
                sheet: 'Usuarios',
                data: playerData
            })
        });
        
        console.log('✅ Datos enviados a Google Sheets');
        showNotification('✅ Cambios guardados en Google Sheets');
        
        return true;
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        showNotification('⚠️ Error al guardar en Google Sheets');
        return false;
    }
}

// Agregar nuevo jugador a Google Sheets
async function addPlayerToSheet(newPlayerData) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'TU_APPS_SCRIPT_URL_AQUI') {
        showNotification('⚠️ Apps Script URL no configurada');
        return false;
    }
    
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add',
                sheet: 'Usuarios',
                data: newPlayerData
            })
        });
        
        showNotification('✅ Nuevo jugador agregado a Google Sheets');
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('⚠️ Error al agregar jugador');
        return false;
    }
}

// Eliminar jugador de Google Sheets
async function deletePlayerFromSheet(playerId) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'TU_APPS_SCRIPT_URL_AQUI') {
        showNotification('⚠️ Apps Script URL no configurada');
        return false;
    }
    
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete',
                sheet: 'Usuarios',
                Numero_ID: playerId
            })
        });
        
        showNotification('✅ Jugador eliminado de Google Sheets');
        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('⚠️ Error al eliminar jugador');
        return false;
    }
}

// Guardar pregunta de usuario
async function saveQuestionToSheet(question) {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'TU_APPS_SCRIPT_URL_AQUI') {
        return false;
    }
    
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add',
                sheet: 'Preguntas',
                data: {
                    question: question,
                    date: new Date().toLocaleString('es-MX'),
                    status: 'Pendiente'
                }
            })
        });
        
        return true;
    } catch (error) {
        console.error('Error guardando pregunta:', error);
        return false;
    }
}

// Datos de respaldo si Google Sheets no está disponible
function useFallbackData() {
    playersData = {
        "6436GF": {
            Numero_ID: "6436GF",
            Total_score: 9999,
            Descuento_Frito: "Admin privileges",
            Premios_magicos: "All access",
            Credimiau: "Unlimited",
            Friend_code: "ADMIN2024",
            Cumpleaños: "01/01/2000",
            Nombre_frito: "Admin Gatita",
            Emoji: "👑"
        },
        "0001GF": {
            Numero_ID: "0001GF",
            Total_score: 1250,
            Descuento_Frito: "20% OFF próximo pedido, 2x1 papas",
            Premios_magicos: "Peluche GF, Sticker pack limitado",
            Credimiau: "350",
            Friend_code: "LUNA2024",
            Cumpleaños: "15/03/2005",
            Nombre_frito: "Luna Frita",
            Emoji: "🐱"
        },
        "0002GF": {
            Numero_ID: "0002GF",
            Total_score: 890,
            Descuento_Frito: "15% OFF próxima compra",
            Premios_magicos: "Pin coleccionable, Llavero GF",
            Credimiau: "200",
            Friend_code: "MICHI2024",
            Cumpleaños: "22/07/2006",
            Nombre_frito: "Michi Supreme",
            Emoji: "😺"
        }
    };
}

// ========================================
// INTEGRACIÓN CON FUNCIONES EXISTENTES
// ========================================

// Modificar saveProfile() para guardar en Sheets
const _originalSaveProfile = window.saveProfile;
window.saveProfile = async function() {
    if (_originalSaveProfile) _originalSaveProfile();
    
    if (currentPlayer) {
        await saveToSheet(currentPlayer);
    }
};

// Modificar addNewPlayer() para agregar a Sheets
const _originalAddNewPlayer = window.addNewPlayer;
window.addNewPlayer = async function() {
    const newId = prompt('Ingresa el nuevo Player ID (formato: ####GF):');
    if (!newId) return;

    if (playersData[newId]) {
        showNotification('⚠️ Este ID ya existe');
        return;
    }

    const newPlayer = {
        Numero_ID: newId,
        Total_score: 0,
        Descuento_Frito: 'Sin descuentos',
        Premios_magicos: 'Sin premios',
        Credimiau: '0',
        Friend_code: 'NEW' + Date.now().toString().slice(-4),
        Cumpleaños: '01/01/2000',
        Nombre_frito: 'Nuevo Jugador',
        Emoji: '🐱'
    };

    playersData[newId] = newPlayer;
    await addPlayerToSheet(newPlayer);
    
    if (window.refreshAdminTable) refreshAdminTable();
    showNotification('✅ Nuevo usuario agregado');
};

// Modificar deletePlayer() para eliminar de Sheets
const _originalDeletePlayer = window.deletePlayer;
window.deletePlayer = async function(playerId) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
        delete playersData[playerId];
        await deletePlayerFromSheet(playerId);
        
        if (window.refreshAdminTable) refreshAdminTable();
        showNotification('🗑️ Usuario eliminado');
    }
};

// ========================================
// INICIALIZACIÓN
// ========================================

// Cargar datos al iniciar la página
window.addEventListener('load', async function() {
    console.log('🚀 Iniciando Gatitxs Gaming...');
    
    // Intentar cargar desde Google Sheets
    const sheetsLoaded = await loadPlayersFromSheet();
    
    if (!sheetsLoaded) {
        console.log('📦 Usando datos de ejemplo locales');
    }
    
    // Cargar preguntas de usuarios
    const questions = await loadQuestionsFromSheet();
    if (questions.length > 0) {
        window.userQuestions = questions;
    }
});

// Auto-sincronización cada 5 minutos (opcional)
if (SHEET_ID !== 'TU_SHEET_ID_AQUI' && API_KEY !== 'TU_API_KEY_AQUI') {
    setInterval(async () => {
        console.log('🔄 Auto-sincronizando datos...');
        await loadPlayersFromSheet();
    }, 5 * 60 * 1000); // 5 minutos
}

console.log('✅ Google Sheets Integration cargado');
console.log('Configuración:', {
    sheetId: SHEET_ID === 'TU_SHEET_ID_AQUI' ? '❌ No configurado' : '✅ Configurado',
    apiKey: API_KEY === 'TU_API_KEY_AQUI' ? '❌ No configurado' : '✅ Configurado',
    appsScript: APPS_SCRIPT_URL === 'TU_APPS_SCRIPT_URL_AQUI' ? '❌ No configurado' : '✅ Configurado'
});