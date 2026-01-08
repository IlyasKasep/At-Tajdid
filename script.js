// =======================================================
// KONFIGURASI OTOMATIS SAAT HALAMAN DIMUAT
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    // Jalankan fungsi galeri jika ada elemennya (index.html)
    if (document.getElementById('galeriFoto')) {
        loadGallery();
    }

    // Jalankan fungsi profil jika ada (index.html)
    if (document.getElementById('profilContent')) {
        bacaProfilSekolah();
    }

    // Inisialisasi form pendaftaran (pendaftaran.html)
    initPendaftaran();

    // Inisialisasi form berita (admin.html)
    initFormBerita();
});

// =======================================================
// BAGIAN 1: PENDAFTARAN (Halaman Pendaftaran)
// =======================================================
function initPendaftaran() {
    const formPendaftaran = document.getElementById('formPendaftaran');
    if (!formPendaftaran) return;

    formPendaftaran.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerText = "Sedang Memproses...";
        btn.disabled = true;

        const dataSiswa = {
            namaAnak: document.getElementById('namaAnak').value,
            tglLahir: document.getElementById('tglLahir').value,
            namaWali: document.getElementById('namaWali').value,
            noWA: document.getElementById('noWA').value,
            alamat: document.getElementById('alamat').value,
            waktuDaftar: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            // 1. Simpan ke Firebase
            await db.collection('pendaftaran').add(dataSiswa);

            // 2. Isi data ke template PDF
            document.getElementById('pdfNama').innerText = ": " + dataSiswa.namaAnak;
            document.getElementById('pdfTgl').innerText = ": " + dataSiswa.tglLahir;
            document.getElementById('pdfWali').innerText = ": " + dataSiswa.namaWali;
            document.getElementById('pdfWA').innerText = ": " + dataSiswa.noWA;
            document.getElementById('pdfAlamat').innerText = ": " + dataSiswa.alamat;

            // 3. Generate PDF
            const element = document.getElementById('formulirCetak');
            element.style.display = 'block'; // Munculkan sebentar untuk dicapture

            const opsi = {
                margin: 10,
                filename: `Formulir_${dataSiswa.namaAnak}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opsi).from(element).save();
            element.style.display = 'none'; // Sembunyikan kembali

            alert("Pendaftaran Berhasil! Formulir Anda sedang diunduh secara otomatis.");
            formPendaftaran.reset();

        } catch (error) {
            console.error("Detail Error:", error);
            alert("Gagal: " + error.message);
        } finally {
            btn.innerText = "KIRIM PENDAFTARAN";
            btn.disabled = false;
        }
    });
}

// =======================================================
// BAGIAN 2: ADMIN & LOGIN (Halaman Admin)
// =======================================================

// Proteksi halaman admin
if (window.location.pathname.includes('admin.html')) {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });
}

// Logout admin
function logoutAdmin() {
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
    });
}

// Inisialisasi form berita
function initFormBerita() {
    const formBerita = document.getElementById('formBerita');
    if (!formBerita) return; // Keluar jika bukan halaman admin

    formBerita.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerText = "Sedang Mengirim...";
        btn.disabled = true;

        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            alert("Sesi login habis. Silakan login kembali.");
            window.location.href = "login.html";
            return;
        }

        try {
            await db.collection('berita').add({
                judul: document.getElementById('judulBerita').value,
                fotoUrl: document.getElementById('linkFoto').value,
                deskripsi: document.getElementById('deskripsiBerita').value,
                tanggal: firebase.firestore.FieldValue.serverTimestamp(),
                adminEmail: currentUser.email
            });
            alert("Berita berhasil dipublikasikan!");
            formBerita.reset();

            // Reload daftar berita jika fungsi loadBerita ada
            if (typeof loadBerita === "function") loadBerita(); 
        } catch (err) {
            console.error("Gagal simpan ke Firestore:", err);
            alert("Gagal: " + err.message);
        } finally {
            btn.innerText = "PUBLIKASIKAN BERITA";
            btn.disabled = false;
        }
    });
}

// =======================================================
// BAGIAN 3: TAMPILAN GALERI (Halaman Index)
// =======================================================
async function loadGallery() {
    const galeriContainer = document.getElementById('galeriFoto');
    if (!galeriContainer) return;

    try {
        const snapshot = await db.collection('berita')
                                 .orderBy('tanggal', 'desc')
                                 .limit(6)
                                 .get();

        galeriContainer.innerHTML = '';

        snapshot.forEach(doc => {
            const data = doc.data();
            galeriContainer.innerHTML += `
                <div class="galeri-item" style="margin-bottom: 20px;">
                    <img src="${data.fotoUrl}" alt="${data.judul}" 
                         style="width:100%; border-radius:10px; height:200px; object-fit:cover;">
                    <h3 style="margin-top:10px;">${data.judul}</h3>
                    <p style="font-size:0.9rem; color:#666;">${data.deskripsi || ''}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Gagal memuat galeri:", error);
        galeriContainer.innerHTML = "<p>Gagal memuat kegiatan terbaru.</p>";
    }
}

// =======================================================
// OPTIONAL: Mengambil 3 kegiatan terbaru saja
// =======================================================
// const snapshot = await db.collection('berita')
//                          .orderBy('tanggal', 'desc')
//                          .limit(3)
//                          .get();
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        // Toggle Menu saat hamburger diklik
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Tutup menu saat salah satu link diklik (untuk mobile)
        document.querySelectorAll('nav ul li a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Fungsi Smooth Scroll untuk Browser Lama (Opsional)
    // Sebenarnya sudah ditangani oleh CSS 'scroll-behavior: smooth'
});