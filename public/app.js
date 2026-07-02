let selectedCow = null;
let cows = [];

async function loadCows(){
  const res = await fetch('/api/cows?slug=sdikb');
  const data = await res.json();
  if(!res.ok) throw new Error(data.error || 'Gagal load kumpulan');
  cows = data.cows;
  renderCows();
}

function renderCows(){
  const grid = document.getElementById('cowGrid');
  const available = cows.filter(c => c.is_available);
  const filled = cows.reduce((sum,c)=>sum+c.filled_slots,0);
  const max = cows.reduce((sum,c)=>sum+c.max_slots,0);
  document.getElementById('slotSummary').textContent = `${filled}/${max} peserta · ${max-filled} slot lagi`;
  document.getElementById('fullNotice').classList.toggle('hidden', available.length > 0);

  grid.innerHTML = cows.map(c => `
    <article class="cow ${c.is_available ? '' : 'disabled'}" onclick="selectCow('${c.id}')">
      <div class="cow-top">
        <div>
          <div class="cow-title">Lembu ${c.cow_no}</div>
          <div class="cow-sub">${c.group_name}</div>
        </div>
        <span class="badge ${c.is_available ? '' : 'full'}">${c.is_available ? `${c.available_slots} SLOT LAGI` : 'PENUH'}</span>
      </div>
      <div class="cow-icon">🐂</div>
      <div class="cow-sub">👥 ${c.filled_slots}/${c.max_slots} Peserta</div>
      <div class="names">
        ${(c.participants || []).length ? c.participants.map((p,i)=>`${i+1}. ${escapeHtml(p.name)}`).join('<br>') : 'Belum ada peserta diluluskan'}
      </div>
    </article>
  `).join('');
}

function selectCow(id){
  const cow = cows.find(c => c.id === id);
  if(!cow || !cow.is_available) return;
  selectedCow = cow;
  document.getElementById('registerPanel').classList.remove('hidden');
  document.getElementById('selectedCow').textContent = `Pilihan: Lembu ${cow.cow_no} · ${cow.group_name} · ${cow.available_slots} slot lagi`;
  document.getElementById('registerPanel').scrollIntoView({behavior:'smooth'});
}

function escapeHtml(str){
  return String(str).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

document.getElementById('registerForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!selectedCow) return alert('Sila pilih kumpulan dahulu');
  const form = Object.fromEntries(new FormData(e.target).entries());
  const res = await fetch('/api/register', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({...form, slug:'sdikb', cow_id:selectedCow.id})
  });
  const data = await res.json();
  if(!res.ok) return alert(data.error || 'Pendaftaran gagal');
  alert('Pendaftaran diterima. Pihak pengurusan akan membuat pengesahan.');
  e.target.reset();
  document.getElementById('registerPanel').classList.add('hidden');
  await loadCows();
});

loadCows().catch(err => alert(err.message));
