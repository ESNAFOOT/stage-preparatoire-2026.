const VERSION_ESNA = "V22 - montant sélection corrigé";

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

function localData(){
  return JSON.parse(localStorage.getItem("esna_registrations_demo")||"[]");
}

async function getData(){
  if(client){
    const {data,error}=await client.from("registrations").select("*");
    if(error){
      console.error("Erreur Supabase lecture planning:", error);
      return [];
    }
    return data||[];
  }
  return localData();
}

function allBookedSlots(data){
  let booked=[];
  data.forEach(r=>{
    if(Array.isArray(r.slots) && r.slots.length > 0){
      booked = booked.concat(r.slots);
    }
  });
  return booked.map(s=>String(s).trim()).filter(Boolean);
}

function getUnitPrice(){
  const statusEl = document.getElementById("status");
  return statusEl && statusEl.value === "Licencié ESNA" ? 20 : 25;
}

function getAmountDue(){
  return selected.length * getUnitPrice();
}

function updateTotalBox(){
  const sessionsEl = document.getElementById("totalSessions");
  const amountEl = document.getElementById("totalAmount");

  if(!sessionsEl || !amountEl) return;

  const nb = selected.length;
  const total = getAmountDue();

  sessionsEl.textContent = nb + " séance" + (nb > 1 ? "s" : "");
  amountEl.textContent = total + " €";
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
  if(checked && !selected.includes(slot)){
    selected.push(slot);
  }
  if(!checked){
    selected = selected.filter(s=>s!==slot);
  }
  updateSelectedView();
}

function updateSelectedView(){
 const selectedSlotsInput = document.getElementById("selectedSlots");
 const selectedSlotsTextEl = document.getElementById("selectedSlotsText");
 const countSelectedEl = document.getElementById("countSelected");
 const recommendedEl = document.getElementById("recommended");
 const packageEl = document.getElementById("package");

 if(selectedSlotsInput){
   selectedSlotsInput.value = selected.join(" | ");
 }
 if(selectedSlotsTextEl){
   selectedSlotsTextEl.textContent = selected.length ? selected.join(" / ") : "Aucun";
 }
 if(countSelectedEl){
   countSelectedEl.textContent = selected.length;
 }

 let rec="Aucune";
 if(selected.length===1) rec="1 séance";
 else if(selected.length<=5 && selected.length>1) rec="5 séances";
 else if(selected.length<=10 && selected.length>5) rec="10 séances";
 else if(selected.length>10) rec="Plusieurs forfaits";

 if(recommendedEl){
   recommendedEl.textContent = rec;
 }
 if(packageEl && ["1 séance","5 séances","10 séances"].includes(rec)){
   packageEl.value = rec;
 }

 updateTotalBox();
}

function paymentReference(){
  const ln = document.getElementById("player_lastname").value.toUpperCase();
  const fn = document.getElementById("player_firstname").value.toUpperCase();
  return "STAGE2026 " + ln + " " + fn;
}

async function sendFormspreeMail(reg){
  if(!FORMSPREE_URL || FORMSPREE_URL.includes("COLLER_ICI")) return;

  const body = `Nouvelle inscription Stage Préparatoire ESNA 2026

Joueur : ${reg.player_firstname} ${reg.player_lastname}
Catégorie : ${reg.category}
Statut : ${reg.status}
Formule : ${reg.package}
Nombre de séances : ${reg.number_sessions}
Total dû : ${reg.amount_due} €
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
      nombre_seances:reg.number_sessions,
      total_du:reg.amount_due+" €",
      mode_paiement:reg.payment_method,
      reference_virement:reg.payment_reference,
      telephone:reg.parent_phone,
      message:body
    })
  }).catch((e)=>console.warn("Formspree non envoyé", e));
}

document.addEventListener("DOMContentLoaded", function(){
  const paymentMethodEl = document.getElementById("payment_method");
  if(paymentMethodEl){
    paymentMethodEl.addEventListener("change",()=>{
      const ribBox = document.getElementById("ribBox");
      if(ribBox){
        ribBox.style.display = paymentMethodEl.value === "Virement bancaire" ? "block" : "none";
      }
    });
  }

  const statusEl = document.getElementById("status");
  if(statusEl){
    statusEl.addEventListener("change", updateTotalBox);
  }

  const form = document.getElementById("registrationForm");
  if(form){
    form.addEventListener("submit", async function(e){
      e.preventDefault();

      if(selected.length===0){alert("Choisis au moins un créneau.");return}

      const packageEl = document.getElementById("package");
      const paymentMethodEl = document.getElementById("payment_method");

      const formule=packageEl.value;
      if(!formule){alert("Choisis une formule.");return}
      if(!paymentMethodEl.value){alert("Choisis un mode de paiement.");return}

      const max=formule==="1 séance"?1:formule==="5 séances"?5:10;
      if(selected.length>max){alert("Tu as sélectionné plus de créneaux que la formule choisie.");return}

      const reg={
        player_lastname:document.getElementById("player_lastname").value,
        player_firstname:document.getElementById("player_firstname").value,
        category:document.getElementById("category").value,
        status:document.getElementById("status").value,
        package:formule,
        parent_email:document.getElementById("parent_email").value,
        parent_phone:document.getElementById("parent_phone").value,
        current_club:document.getElementById("current_club").value,
        medical_notes:document.getElementById("medical_notes").value,
        payment_method:paymentMethodEl.value,
        payment_reference:paymentReference(),
        number_sessions:selected.length,
        amount_due:getAmountDue(),
        slots:selected.slice(),
        slots_text:selected.join(" | "),
        payment_status:"En attente"
      };

      if(client){
        const {error}=await client.from("registrations").insert([reg]);
        if(error){
          console.error("Erreur inscription Supabase:", error);
          document.getElementById("message").innerHTML="❌ Erreur d'enregistrement : "+error.message;
          return;
        }
      }else{
        let d=localData();
        d.push({id:Date.now().toString(),...reg});
        localStorage.setItem("esna_registrations_demo",JSON.stringify(d));
      }

      await sendFormspreeMail(reg);

      let payText=`<div class="rib-confirm"><b>Total dû :</b> ${reg.amount_due} € pour ${reg.number_sessions} séance(s).</div>`;
      if(reg.payment_method==="Virement bancaire"){
        payText+=`<div class="rib-confirm"><b>RIB ESNA :</b><br>IBAN : FR76 1100 6000 1104 0190 0500 126<br>BIC : AGRIFRPP810<br>Référence : ${reg.payment_reference}</div>`;
      } else if(reg.payment_method==="Chèque à l'ordre de l'ESNA"){
        payText+=`<div class="rib-confirm">Merci de remettre le chèque à l'ordre de l'ESNA.</div>`;
      } else {
        payText+=`<div class="rib-confirm">Paiement en espèces à remettre le jour du stage.</div>`;
      }

      document.getElementById("message").innerHTML=`✅ Inscription enregistrée.<br>Un e-mail récapitulatif est envoyé à l'ESNA.<br>${payText}`;
      form.reset();
      selected=[];
      updateSelectedView();

      const ribBox = document.getElementById("ribBox");
      if(ribBox) ribBox.style.display="none";

      loadSlots();
    });
  }

  updateTotalBox();
  loadSlots();
});

setInterval(loadSlots,15000);
