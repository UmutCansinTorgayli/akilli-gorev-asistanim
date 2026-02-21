// Firebase modülleri
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Firebase Yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyBHnRNBAnsj0vAFSqyIRWCG6NWD-Ln7ZzU",
    authDomain: "akilli-gorev-asistanim.firebaseapp.com",
    projectId: "akilli-gorev-asistanim",
    storageBucket: "akilli-gorev-asistanim.firebasestorage.app",
    messagingSenderId: "978428122280",
    appId: "1:978428122280:web:004f954bc01cea0cf9de9d",
    measurementId: "G-N04777NVGF"
};

// Başlatma
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCol = collection(db, 'tasks');

// Elementler
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const themeToggle = document.getElementById('themeToggle');

// --- 1. LOCAL AI MANTIĞI ---
function getAIAdvice(taskText) {
    const aiLibrary = {
        "proje": ["💡 Projeni modüllere ayır.", "📝 Her gün bir 'Commit' at.", "📑 Dokümantasyonu sona bırakma!"],
        "ders": ["📚 25 dk odaklan, 5 dk mola ver.", "✍️ Kendi notlarını çıkar.", "🎧 Lofi müzik dene."],
        "spor": ["💧 Su içmeyi unutma.", "⏱️ Isınma hareketleri yap.", "📈 Gelişimini not et."],
        "default": ["🚀 Hemen başla!", "🎯 Telefonu uzaklaştır.", "✅ Kendine ödül ver."]
    };

    const text = taskText.toLowerCase();
    if (text.includes("proje") || text.includes("ödev")) return aiLibrary.proje[Math.floor(Math.random() * 3)];
    if (text.includes("ders") || text.includes("sınav") || text.includes("çalış")) return aiLibrary.ders[Math.floor(Math.random() * 3)];
    if (text.includes("spor") || text.includes("gym")) return aiLibrary.spor[Math.floor(Math.random() * 3)];
    return aiLibrary.default[Math.floor(Math.random() * 3)];
}

// --- 2. PROGRESS BAR GÜNCELLEME ---
function updateProgress() {
    const total = document.querySelectorAll('li').length;
    const completed = document.querySelectorAll('.completed').length;
    const progress = total === 0 ? 0 : (completed / total) * 100;
    if (progressBar) progressBar.style.width = progress + "%";
}

// --- 3. EKRANA ÇİZME (RENDER) ---
function renderTask(taskData, id) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span class="priority-badge badge-${taskData.priority || 'Normal'}">${taskData.priority || 'Normal'}</span>
            <span class="${taskData.completed ? 'completed' : ''}">${taskData.text}</span>
        </div>
        <div class="buttons">
            <button class="aiBtn">🪄 AI</button>
            <button class="checkBtn">✔</button>
            <button class="deleteBtn">Sil</button>
        </div>
    `;
    // AI Butonu
    li.querySelector('.aiBtn').addEventListener('click', () => {
        alert(`🤖 Local AI Advice:\n\n${getAIAdvice(taskData.text)}`);
    });

    // Silme
    li.querySelector('.deleteBtn').addEventListener('click', async () => {
        await deleteDoc(doc(db, 'tasks', id));
    });

    // Tamamlama
    li.querySelector('.checkBtn').addEventListener('click', async () => {
        await updateDoc(doc(db, 'tasks', id), {
            completed: !taskData.completed
        });
    });

    taskList.appendChild(li);
    updateProgress();
}

// --- 4. FIREBASE VERİ EKLEME ---
addBtn.addEventListener('click', async () => {
    const text = taskInput.value.trim();
    // HTML'de bu ID'li bir select olduğundan emin olmalısın
    const pSelect = document.getElementById('prioritySelect');
    const priority = pSelect ? pSelect.value : 'Normal'; 
    
    if (text === '') return alert("Boş bırakma!");

    try {
        await addDoc(tasksCol, {
            text: text,
            priority: priority,
            completed: false,
            timestamp: Date.now()
        });
        taskInput.value = '';
    } catch (e) {
        console.error("Hata:", e);
    }
});

// --- 5. GERÇEK ZAMANLI DİNLEME ---
const q = query(tasksCol, orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    taskList.innerHTML = '';
    snapshot.docs.forEach(doc => {
        renderTask(doc.data(), doc.id);
    });
    updateProgress();
});

// --- 6. TEMA DEĞİŞTİRİCİ ---
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', targetTheme);
    });
}