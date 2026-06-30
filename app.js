const VERSION_COMPTEUR_ESNA = "V18 - slots uniquement";
console.log(VERSION_COMPTEUR_ESNA);
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

const configured =
  typeof SUPABASE_URL !== "undefined" &&
  typeof SUPABASE_ANON_KEY !== "undefined" &&
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("COLLER_ICI") &&
  !SUPABASE_ANON_KEY.includes("COLLER_ICI");

const client = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let selected=[];

if(document.getElementById("payment_method")){
  payment_method.addEventListener("change",()=>{
    ribBox.style.display = payment_method.value === "Virement bancaire" ? "block" : "none";
  });
}

function localData(){
  return JSON.parse(localStorage.getItem("esna_registrations_demo")||"[]");
}

async function getData(){
  if(client){
    // On récupère toutes les colonnes pour éviter les erreurs si une ancienne inscription n'a pas le même format.
    const {data,error}=await client.from("registrations").select("*");
    if(error){
      console.error("Erreur Supabase lecture planning:", error);
      return [];
    }
    return data||[];
  }
  return localData();
}

// Correction V16 : compte les créneaux quel que soit le format enregistré dans Supabase.
function allBookedSlots(data){
  let booked=[];

  data.forEach(r=>{
    // V18 : on compte uniquement la colonne "slots".
    // La colonne "slots_text" sert seulement à l'affichage dans l'admin.
    if(Array.isArray(r.slots) && r.slots.length > 0){
      booked = booked.concat(r.slots);
    }
  });

  return booked.map(s=>String(s).trim()).filter(Boolean);
}

async function loadSlots(){
 const c=document.getElementById("slots");
 if(!c) return;

 c.innerHTML="";
 const rows = await getData();
 const booked = allBookedSlots(rows);

 slotsData.forEach(([d,h])=>{
  const key=d+" - "+h;
  const count=booked.filter(s=>s===key).length;
  const left=Math.max(0, MAX_PLACES_PER_SLOT-count);

  const div=document.createElement("div");
  div.className="slot-card";
  div.innerHTML=`<label class="slot-label">
    <input type="checkbox" ${selected.includes(key)?"checked":""} ${left<=0&&!selected.includes(key)?"disabled":""} onchange="toggleSlot('${key}',this.checked)">
    <span>
      <h3>${d}</h3>
      <p>${h}</p>
      <p class="${left>0?'available':'full'}">${left>0?'✅ '+left+' place'+(left>1?'s':'')+' restante'+(left>1?'s':'')+' / '+MAX_PLACES_PER_SLOT:'❌ Complet'}</p>
    </span>
  </label>`;
  c.appendChild(div);
 });

 updateSelectedView();
}

function toggleSlot(slot, checked){
  if(checked&&!selected.includes(slot)) selected.push(slot);
  if(!checked) selected=selected.filter(s=>s!==slot);
  updateSelectedView();
}

function updateSelectedView(){
 if(!document.getElementById("selectedSlots")) return;

 selectedSlots.value=selected.join(" | ");
 selectedSlotsText.textContent=selected.length?selected.join(" / "):"Aucun";
 countSelected.textContent=selected.length;

 let rec="Aucune";
 if(selected.length===1) rec="1 séance";
 else if(selected.length<=5&&selected.length>1) rec="5 séances";
 else if(selected.length<=10&&selected.length>5) rec="10 séances";
 else if(selected.length>10) rec="Plusieurs forfaits";

 recommended.textContent=rec;
 if(["1 séance","5 séances","10 séances"].includes(rec)) package.value=rec;
}

function paymentReference(){
  return "STAGE2026 " + player_lastname.value.toUpperCase() + " " + player_firstname.value.toUpperCase();
}

async function sendFormspreeMail(reg){
  if(!FORMSPREE_URL || FORMSPREE_URL.includes("COLLER_ICI")) return;

  const body = `Nouvelle inscription Stage Préparatoire ESNA 2026

Joueur : ${reg.player_firstname} ${reg.player_lastname}
Catégorie : ${reg.category}
Statut : ${reg.status}
Formule : ${reg.package}
Créneaux : ${reg.slots_text}
Mode de paiement : ${reg.payment_method}
Statut paiement : ${reg.payment_status}
Référence virement : ${reg.payment_reference}

Email parent : ${reg.parent_email}
Téléphone parent : ${reg.parent_phone}
Club actuel : ${reg.current_club}
Informations médicales : ${reg.medical_notes}`;

  await fetch(FORMSPREE_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({
      _subject:"Nouvelle inscription - Stage préparatoire ESNA 2026",
      email:reg.parent_email,
      joueur:reg.player_firstname+" "+reg.player_lastname,
      categorie:reg.category,
      creneaux:reg.slots_text,
      mode_paiement:reg.payment_method,
      reference_virement:reg.payment_reference,
      telephone:reg.parent_phone,
      message:body
    })
  }).catch((e)=>console.warn("Formspree non envoyé", e));
}

if(document.getElementById("registrationForm")){
registrationForm.addEventListener("submit",async e=>{
 e.preventDefault();

 if(selected.length===0){alert("Choisis au moins un créneau.");return}
 const formule=package.value;
 if(!formule){alert("Choisis une formule.");return}
 if(!payment_method.value){alert("Choisis un mode de paiement.");return}

 const max=formule==="1 séance"?1:formule==="5 séances"?5:10;
 if(selected.length>max){alert("Tu as sélectionné plus de créneaux que la formule choisie.");return}

 const reg={
  player_lastname:player_lastname.value,
  player_firstname:player_firstname.value,
  category:category.value,
  status:status.value,
  package:formule,
  parent_email:parent_email.value,
  parent_phone:parent_phone.value,
  current_club:current_club.value,
  medical_notes:medical_notes.value,
  payment_method:payment_method.value,
  payment_reference:paymentReference(),
  slots:selected.slice(),
  slots_text:selected.join(" | "),
  payment_status:"En attente"
 };

 if(client){
  const {error}=await client.from("registrations").insert([reg]);
  if(error){
    console.error("Erreur inscription Supabase:", error);
    message.innerHTML="❌ Erreur d'enregistrement : "+error.message;
    return;
  }
 }else{
  let d=localData();
  d.push({id:Date.now().toString(),...reg});
  localStorage.setItem("esna_registrations_demo",JSON.stringify(d));
 }

 await sendFormspreeMail(reg);

 let payText="";
 if(reg.payment_method==="Virement bancaire"){
  payText=`<div class="rib-confirm"><b>RIB ESNA :</b><br>IBAN : FR76 1100 6000 1104 0190 0500 126<br>BIC : AGRIFRPP810<br>Référence : ${reg.payment_reference}</div>`;
 } else if(reg.payment_method==="Chèque à l'ordre de l'ESNA"){
  payText=`<div class="rib-confirm">Merci de remettre le chèque à l'ordre de l'ESNA.</div>`;
 } else {
  payText=`<div class="rib-confirm">Paiement en espèces à remettre le jour du stage.</div>`;
 }

 message.innerHTML=`✅ Inscription enregistrée.<br>Un e-mail récapitulatif est envoyé à l'ESNA.<br>${payText}`;
 e.target.reset();
 selected=[];
 updateSelectedView();
 if(document.getElementById("ribBox")) ribBox.style.display="none";
 loadSlots();
});
}

loadSlots();
setInterval(loadSlots,15000);
