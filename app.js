/* ================= Catatan Keuangan — logika inti ================= */

const KEY_TRANSAKSI = 'ck_transaksi';
const KEY_RIWAYAT = 'ck_riwayat';
const KEY_BULAN_AKTIF = 'ck_bulan_aktif';

const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const NAMA_HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function bulanKeyDari(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function labelBulan(bulanKey) {
  const [tahun, bulan] = bulanKey.split('-').map(Number);
  return `${NAMA_BULAN[bulan - 1]} ${tahun}`;
}

function formatRupiah(angka) {
  const n = Number(angka) || 0;
  return 'Rp' + n.toLocaleString('id-ID');
}

function ambilArray(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function simpanArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

/* Cek apakah bulan berjalan sudah berganti sejak terakhir dibuka.
   Kalau ganti bulan: total & simpan catatan bulan lama ke riwayat,
   lalu kosongkan catatan supaya bulan baru mulai dari nol. */
function cekPergantianBulan() {
  const bulanSekarang = bulanKeyDari(new Date());
  const bulanAktif = localStorage.getItem(KEY_BULAN_AKTIF);

  if (!bulanAktif) {
    localStorage.setItem(KEY_BULAN_AKTIF, bulanSekarang);
    return;
  }

  if (bulanAktif !== bulanSekarang) {
    const transaksiLama = ambilArray(KEY_TRANSAKSI);
    const masuk = transaksiLama.filter(t => t.jenis === 'masuk').reduce((a, t) => a + t.nominal, 0);
    const keluar = transaksiLama.filter(t => t.jenis === 'keluar').reduce((a, t) => a + t.nominal, 0);

    if (transaksiLama.length > 0) {
      const riwayat = ambilArray(KEY_RIWAYAT);
      riwayat.unshift({
        bulan: bulanAktif,
        masuk,
        keluar,
        saldo: masuk - keluar,
        jumlahCatatan: transaksiLama.length
      });
      simpanArray(KEY_RIWAYAT, riwayat);
    }

    simpanArray(KEY_TRANSAKSI, []);
    localStorage.setItem(KEY_BULAN_AKTIF, bulanSekarang);
  }
}

/* Tanggal & bulan selalu diambil otomatis dari waktu saat disimpan —
   pengguna tidak perlu memilih tanggal sendiri. */
function tambahTransaksi(jenis, nominal, keterangan) {
  const sekarang = new Date();
  const list = ambilArray(KEY_TRANSAKSI);
  list.unshift({
    id: Date.now(),
    jenis,
    nominal: Number(nominal),
    keterangan: keterangan || '',
    tanggal: sekarang.toISOString().slice(0, 10)
  });
  simpanArray(KEY_TRANSAKSI, list);
}

function hapusTransaksi(id) {
  const list = ambilArray(KEY_TRANSAKSI).filter(t => t.id !== id);
  simpanArray(KEY_TRANSAKSI, list);
}

function formatTanggalIndo(tanggalISO) {
  const d = new Date(tanggalISO + 'T00:00:00');
  return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function ringkasBulanIni() {
  const list = ambilArray(KEY_TRANSAKSI);
  const masuk = list.filter(t => t.jenis === 'masuk').reduce((a, t) => a + t.nominal, 0);
  const keluar = list.filter(t => t.jenis === 'keluar').reduce((a, t) => a + t.nominal, 0);
  return { masuk, keluar, saldo: masuk - keluar, list };
}
