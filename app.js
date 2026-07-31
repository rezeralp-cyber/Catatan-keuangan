/* ================= Buku Kas — logika inti ================= */

const KEY_TRANSAKSI = 'bukukas_transaksi';
const KEY_RIWAYAT = 'bukukas_riwayat';
const KEY_BULAN_AKTIF = 'bukukas_bulan_aktif';

const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

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

function tambahTransaksi(jenis, nominal, keterangan, tanggalISO) {
  const list = ambilArray(KEY_TRANSAKSI);
  list.unshift({
    id: Date.now(),
    jenis,
    nominal: Number(nominal),
    keterangan: keterangan || '',
    tanggal: tanggalISO
  });
  simpanArray(KEY_TRANSAKSI, list);
}

function hapusTransaksi(id) {
  const list = ambilArray(KEY_TRANSAKSI).filter(t => t.id !== id);
  simpanArray(KEY_TRANSAKSI, list);
}

function formatTanggalIndo(tanggalISO) {
  const d = new Date(tanggalISO + 'T00:00:00');
  return `${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
