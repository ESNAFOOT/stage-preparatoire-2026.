const slotsData=[
["Lundi 3 août","10h-12h"],["Lundi 3 août","14h-16h"],
["Mardi 4 août","10h-12h"],["Mardi 4 août","14h-16h"],
["Mercredi 5 août","10h-12h"],["Mercredi 5 août","14h-16h"],
["Jeudi 6 août","10h-12h"],["Jeudi 6 août","14h-16h"],
["Vendredi 7 août","10h-12h"],["Vendredi 7 août","14h-16h"],
["Mardi 11 août","10h-12h"],["Mardi 11 août","14h-16h"],
["Jeudi 13 août","10h-12h"],["Jeudi 13 août","14h-16h"],
["Mardi 18 août","10h-12h"],["Mardi 18 août","14h-16h"],
["Jeudi 20 août","10h-12h"],["Jeudi 20 août","14h-16h"],
["Mardi 25 août","10h-12h"],["Mardi 25 août","14h-16h"],
["Jeudi 27 août","10h-12h"],["Jeudi 27 août","14h-16h"]
];

const configured=SUPABASE_URL && !SUPABASE_URL.includes("COLLER_ICI") && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("COLLER_ICI");
const client=configured ? supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY) : null;
let selected=[];

if(HELLOASSO_PAYMENT_URL && !HELLOASSO_PAYMENT_URL.includes("COLLER_ICI")) document.getElementById("helloasso").href=HELLOASSO_PAYMENT_URL;

function localData(){return JSON.parse(localStorage.getItem("esna_registrations_demo")||"[]")}
async function getData(){if(client){let r=await client.from("registrations").select("slots");if(!r.error)return r.data||[]}return localData()}
function allBookedSlots(data){let booked=[];data.forEach(r=>{if(Array.isArray(r.slots))booked=booked.concat(r.slots);else if(r.slots)booked=booked.concat(String(r.slots).split(" | "));else if(r.slot)booked.push(r.slot)});return booked}

async function loadSlots(){
 const c=document.getElementById("slots");c.innerHTML="";
 const booked=allBookedSlots(await getData());
 slotsData.forEach(([d,h])=>{
  const key=d+" - "+h; const count=booked.filter(s=>s===key).length; const left=MAX_PLACES_PER_SLOT-count;
  const div=document.createElement("div"); div.className="slot-card";
  div.innerHTML=`<label class="slot-label"><input type="checkbox" ${selected.includes(key)?"checked":""} ${left<=0&&!selected.includes(key)?"disabled":""} onchange="toggleSlot('${key}',this.checked)"><span><h3>${d}</h3><p>${h}</p><p class="${left>0?'available':'full'}">
  ${left>0 ? '✅ ' + left + ' place' + (left>1?'s':'') + ' restante' + (left>1?'s':'') + ' / ' + MAX_PLACES_PER_SLOT : '❌ Complet'}
</p></span></label>`;
  c.appendChild(div);
 });
 updateSelectedView();
}

function toggleSlot(slot, checked){if(checked&&!selected.includes(slot))selected.push(slot); if(!checked)selected=selected.filter(s=>s!==slot); updateSelectedView()}
function updateSelectedView(){
 selectedSlots.value=selected.join(" | "); selectedSlotsText.textContent=selected.length?selected.join(" / "):"Aucun"; countSelected.textContent=selected.length;
 let rec="Aucune"; if(selected.length===1)rec="1 séance"; else if(selected.length<=5&&selected.length>1)rec="5 séances"; else if(selected.length<=10&&selected.length>5)rec="10 séances"; else if(selected.length>10)rec="Plusieurs forfaits";
 recommended.textContent=rec; if(["1 séance","5 séances","10 séances"].includes(rec)) package.value=rec;
}

registrationForm.addEventListener("submit",async e=>{
 e.preventDefault(); if(selected.length===0){alert("Choisis au moins un créneau.");return}
 const formule=package.value; if(!formule){alert("Choisis une formule.");return}
 const max=formule==="1 séance"?1:formule==="5 séances"?5:10;
 if(selected.length>max){alert("Tu as sélectionné plus de créneaux que la formule choisie.");return}
 const reg={player_lastname:player_lastname.value,player_firstname:player_firstname.value,category:category.value,status:status.value,package:formule,parent_email:parent_email.value,parent_phone:parent_phone.value,current_club:current_club.value,medical_notes:medical_notes.value,slots:selected,slots_text:selected.join(" | "),payment_status:"En attente"};
 if(client){let r=await client.from("registrations").insert([reg]);if(r.error){message.textContent="Erreur : "+r.error.message;return}}else{let d=localData();d.push({id:Date.now().toString(),...reg});localStorage.setItem("esna_registrations_demo",JSON.stringify(d))}
 message.textContent="✅ Inscription enregistrée."; e.target.reset(); selected=[]; updateSelectedView(); loadSlots();
});
loadSlots();

// Actualisation automatique des places restantes toutes les 15 secondes
setInterval(loadSlots, 15000);
