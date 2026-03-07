// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = "https://xgkzsqrwarhogddsiusr.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhna3pzcXJ3YXJob2dkZHNpdXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTU4NDEsImV4cCI6MjA4NzA5MTg0MX0.SrzYwEOvDER18mBiumtc6pY6zJF6XnB8vSZeh0D9DCY";
const supabaseClient =
  typeof supabase !== "undefined"
    ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// Parsing Nama Tamu dari URL (?to=Nama+Tamu)
const urlParams = new URLSearchParams(window.location.search);
const namaTamu = urlParams.get("to");
const guestElement = document.getElementById("guest-name");

if (guestElement) {
  if (namaTamu) {
    // .replace(/\+/g, " ") berfungsi mengubah tanda + di URL jadi spasi
    let namaBersih = namaTamu.replace(/\+/g, " ").replace(/ dan /g, " & ");
    guestElement.innerText = namaBersih;
  } else {
    // Jika di URL tidak ada nama, tampilkan teks default
    guestElement.innerText = "Tamu Undangan";
  }
}

// --- INISIALISASI ---
AOS.init({ duration: 1000, once: false, mirror: true });

// --- FUNGSI BUKA UNDANGAN ---
function bukaUndangan() {
  document.getElementById("cover").style.transform = "translateY(-100%)";
  document.body.classList.remove("overflow-hidden");
  document.getElementById("main-content").classList.remove("hidden");
  document.getElementById("music-container").classList.remove("hidden");
  playMusic();
  setTimeout(() => {
    AOS.refresh();
  }, 500);
}

// --- MUSIK ---
const audio = document.getElementById("wedding-music");
let isPlaying = false;

function playMusic() {
  audio.play();
  isPlaying = true;
  document.getElementById("music-icon").innerText = "⏸️";
}

function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    document.getElementById("music-icon").innerText = "🎵";
  } else {
    audio.play();
    document.getElementById("music-icon").innerText = "⏸️";
  }
  isPlaying = !isPlaying;
}

// --- COUNTDOWN ---
const target = new Date("April 04, 2026 08:00:00").getTime();
setInterval(() => {
  const now = new Date().getTime();
  const d = target - now;
  const days = Math.floor(d / (1000 * 60 * 60 * 24));
  const hours = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((d % (1000 * 60)) / (1000));

  // Tambahkan pengecekan if (container)
  const countdownContainer = document.getElementById("countdown");
  if (countdownContainer) {
    countdownContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[#735933] rounded-2xl shadow-xl" >
            <span class="text-2xl md:text-3xl">${days}</span>
            <p class="text-[10px] md:text-xs uppercase tracking-wide">Hari</p>
        </div>
        <div class="flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[#735933] rounded-2xl shadow-xl" >
            <span class="text-2xl md:text-3xl">${hours}</span>
            <p class="text-[10px] md:text-xs uppercase tracking-wide">Jam</p>
        </div>
        <div class="flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[#735933] rounded-2xl shadow-xl" >
            <span class="text-2xl md:text-3xl">${mins}</span>
            <p class="text-[10px] md:text-xs uppercase tracking-wide">Menit</p>
        </div>
        <div class="flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[#735933] rounded-2xl shadow-xl" >
            <span class="text-2xl md:text-3xl">${secs}</span>
            <p class="text-[10px] md:text-xs uppercase tracking-wide">Detik</p>
        </div>
    `;
  }
}, 1000);

// --- LOGIKA DATABASE (SUPABASE) ---
async function fetchWishes() {
  const { data, error } = await supabaseClient
    .from("ucapan")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("wish-container");
  
  // 1. Pastikan container ada di HTML agar tidak error null
  if (!container) return; 

  // 2. Cek apakah ada error dari Supabase
  if (error) {
    console.error("Error fetching:", error);
    container.innerHTML = "<p class='text-red-500'>Gagal memuat ucapan.</p>";
    return;
  }

  // 3. Cek apakah data ada DAN jumlahnya lebih dari 0
  if (data && data.length > 0) {
    container.innerHTML = data
      .map(
        (i) => `
          <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#8b5e3c] mb-4">
              <p class="font-bold text-[#8b5e3c] text-sm">${i.nama}</p>
              <p class="text-gray-700 text-sm mt-1">${i.pesan}</p>
          </div>
        `
      )
      .join("");
  } else {
    // 4. Jika data kosong (data.length === 0)
    container.innerHTML = `
      <div class="text-center py-10 opacity-50">
        <p class="text-sm italic">Belum ada ucapan doa.</p>
        <p class="text-xs">Jadilah yang pertama mendoakan pengantin!</p>
      </div>
    `;
  }
}

document.getElementById("wish-form").onsubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btn-submit");
  const nama = document.getElementById("name").value;
  const pesan = document.getElementById("message").value;

  btn.disabled = true;
  btn.innerText = "Mengirim...";

  if (supabaseClient) {
    await supabaseClient.from("ucapan").insert([{ nama, pesan }]);
    await fetchWishes();
  }

  btn.disabled = false;
  btn.innerText = "Kirim Ucapan";
  document.getElementById("wish-form").reset();
};

fetchWishes(); // Load pertama kali

function copyRek(rek, btn) {
  const originalText = btn.innerHTML;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(rek).then(() => {
      showSuccess(btn, originalText);
    });
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = rek;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showSuccess(btn, originalText);
    } catch (err) {
      console.error('Gagal menyalin', err);
    }
    document.body.removeChild(textArea);
  }
}

function showSuccess(btn, originalText) {
  btn.innerHTML = "Berhasil disalin";
  btn.classList.add("bg-green-600");
  btn.classList.remove("bg-[#8b5e3c]");

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.classList.remove("bg-green-600");
    btn.classList.add("bg-[#8b5e3c]");
  }, 2000); 
}

function getMaps(){
window.open("https://www.google.com/maps/place/6%C2%B012'28.5%22S+106%C2%B038'13.0%22E/@-6.2081207,106.6364455,19z/data=!4m4!3m3!8m2!3d-6.2079167!4d106.6369444?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D", "_blank");

}
