const configured =
  typeof SUPABASE_URL !== "undefined" &&
  typeof SUPABASE_ANON_KEY !== "undefined" &&
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("COLLER_ICI") &&
  !SUPABASE_ANON_KEY.includes("COLLER_ICI");

const client=configured ? window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY) : null;
let registrations=[];

function getSlotsCount(r){
  if(r.number_sessions) return Number(r.number_sessions);
  if(Array.isArray(r.slots)) return r.slots.length;
  if(r.slots_text) return String(r.slots_text).split(" | ").filter(Boolean).length;
  return 0;
}

function getAmountDue(r){
  if(r.amount_due) return Number(r.amount_due);
  const nb=Math.min(getSlotsCount(r),10);
  const lic={0:0,1:20,2:40,3:60,4:80,5:90,6:120,7:140,8:160,9:180,10:190};
  const non={0:0,1:25,2:50,3:75,4:100,5:115,6:150,7:175,8:200,9:225,10:240};
  return (r.status==="Licencié ESNA"?lic:non)[nb];
}

function countBy(list, getter){
  const result = {};
  list.forEach(item=>{
    const key = getter(item) || "Non renseigné";
    result[key] = (result[key] || 0) + 1;
  });
  return result;
}

function renderStatsList(elementId, data, suffix=""){
  const el = document.getElementById(elementId);
  if(!el) return;
  const entries = Object.entries(data).sort((a,b)=>b[1]-a[1]);
  if(entries.length === 0){
    el.innerHTML = "<p>Aucune donnée.</p>";
    return;
  }
  el.innerHTML = entries.map(([label,value])=>`
    <div class="stat-line">
      <span>${label}</span>
      <strong>${value}${suffix}</strong>
    </div>
  `).join("");
}

function updateStatistics(){
  const sessions = registrations.reduce((sum,r)=>sum + getSlotsCount(r),0);
  const revenue = registrations.reduce((sum,r)=>sum + getAmountDue(r),0);
  const paidRev = registrations.filter(r=>r.payment_status==="Payé").reduce((sum,r)=>sum + getAmountDue(r),0);
  const pendingRev = revenue - paidRev;

  if(document.getElementById("totalSessions")) totalSessions.textContent = sessions;
  if(document.getElementById("totalRevenue")) totalRevenue.textContent = revenue + " €";
  if(document.getElementById("paidRevenue")) paidRevenue.textContent = paidRev + " €";
  if(document.getElementById("pendingRevenue")) pendingRevenue.textContent = pendingRev + " €";

  renderStatsList("categoryStats", countBy(registrations, r=>r.category));
  renderStatsList("paymentStats", countBy(registrations, r=>r.payment_method));

  const slotCounts = {};
  registrations.forEach(r=>{
    let slots = [];
    if(Array.isArray(r.slots)) slots = r.slots;
    else if(r.slots_text) slots = String(r.slots_text).split(" | ");
    slots.forEach(s=>{
      const key = String(s).trim();
      if(key) slotCounts[key] = (slotCounts[key] || 0) + 1;
    });
  });
  renderStatsList("slotStats", slotCounts, "/10");
}

async function load(){
 if(client){
  const {data,error}=await client.from("registrations").select("*").order("created_at",{ascending:false});
  if(error){
    alert("Erreur Supabase : "+error.message);
    registrations=[];
  }else{
    registrations=data||[];
  }
 }else{
  registrations=JSON.parse(localStorage.getItem("esna_registrations_demo")||"[]").reverse();
 }

 total.textContent=registrations.length;
 paid.textContent=registrations.filter(r=>r.payment_status==="Payé").length;
 pending.textContent=registrations.filter(r=>r.payment_status!=="Payé").length;
 updateStatistics();

 let tb=document.querySelector("#registrationsTable tbody");
 tb.innerHTML="";

 registrations.forEach((r,index)=>{
  const slots=r.slots_text||(Array.isArray(r.slots)?r.slots.join(" / "):(r.slots||r.slot||""));
  const id=r.id||"";
  const badge=r.payment_status==="Payé"?"🟢 Payé":"🟠 En attente";
  let tr=document.createElement("tr");
  tr.innerHTML=`<td>${r.player_firstname||""} ${r.player_lastname||""}</td><td>${r.category||""}</td><td>${slots}</td><td>${getSlotsCount(r)}</td><td>${getAmountDue(r)} €</td><td>${r.package||""}</td><td>${r.status||""}</td><td>${r.payment_method||""}</td><td>${badge}</td><td>${r.parent_email||""}</td><td>${r.parent_phone||""}</td><td><button class="paid-btn" onclick="markPaid('${id}',${index})">Paiement reçu</button><button class="delete-btn" onclick="deleteRegistration('${id}',${index})">Supprimer</button></td>`;
  tb.appendChild(tr);
 });
}

async function markPaid(id,visibleIndex){
 if(client){
  const {error}=await client.from("registrations").update({payment_status:"Payé"}).eq("id",id);
  if(error){alert("Erreur : "+error.message);return}
 }else{
  let data=JSON.parse(localStorage.getItem("esna_registrations_demo")||"[]");
  const realIndex=data.length-1-visibleIndex;
  if(data[realIndex]) data[realIndex].payment_status="Payé";
  localStorage.setItem("esna_registrations_demo",JSON.stringify(data));
 }
 load();
}

async function deleteRegistration(id,visibleIndex){
 if(!confirm("Confirmer la suppression de cette inscription ?")) return;
 if(client){
  const {error}=await client.from("registrations").delete().eq("id",id);
  if(error){alert("Erreur suppression : "+error.message);return}
 }else{
  let data=JSON.parse(localStorage.getItem("esna_registrations_demo")||"[]");
  const realIndex=data.length-1-visibleIndex;
  if(realIndex>=0){
    data.splice(realIndex,1);
    localStorage.setItem("esna_registrations_demo",JSON.stringify(data));
  }
 }
 load();
}

function exportCSV(){
 let rows=[["Nom","Prénom","Catégorie","Créneaux","Nombre de séances","Total dû","Formule","Statut","Mode paiement","Référence paiement","Email","Téléphone","Club","Infos médicales","Paiement"],
 ...registrations.map(r=>[r.player_lastname,r.player_firstname,r.category,r.slots_text||(Array.isArray(r.slots)?r.slots.join(" / "):r.slots||r.slot),getSlotsCount(r),getAmountDue(r),r.package,r.status,r.payment_method,r.payment_reference,r.parent_email,r.parent_phone,r.current_club,r.medical_notes,r.payment_status])];

 let csv=rows.map(row=>row.map(v=>`"${String(v||"").replaceAll('"','""')}"`).join(";")).join("\n");
 let a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
 a.download="inscriptions_stage_esna.csv";
 a.click();
}
