// Fungsi untuk mengambil data Profil/Visi Misi dari Firestore
async function loadProfile() {
    try {
        const doc = await db.collection('settings').doc('profile').get();
        if (doc.exists) {
            document.getElementById('profilContent').innerText = doc.data().visiMisi;
        } else {
            document.getElementById('profilContent').innerText = "Data profil belum diatur di database.";
        }
    } catch (error) {
        console.error("Gagal memuat profil:", error);
    }
}

// Fungsi untuk mengambil data Galeri Kegiatan
async function loadGallery() {
    const galeriContainer = document.getElementById('galeriFoto');
    try {
        const snapshot = await db.collection('kegiatan').orderBy('tanggal', 'desc').limit(3).get();
        galeriContainer.innerHTML = ''; // Hapus loader
        
        snapshot.forEach(doc => {
            const data = doc.data();
            galeriContainer.innerHTML += `
                <div class="galeri-item">
                    <img src="${data.imageUrl}" alt="${data.judul}" style="width:100%; border-radius:10px;">
                    <h3>${data.judul}</h3>
                    <p>${data.deskripsi.substring(0, 100)}...</p>
                </div>
            `;
        });
    } catch (error) {
        galeriContainer.innerHTML = "Gagal memuat galeri.";
    }
}

// Jalankan saat halaman dibuka
window.onload = () => {
    loadProfile();
    loadGallery();
};