const configured=SUPABASE_URL&&!SUPABASE_URL.includes("COLLER_ICI")&&SUPABASE_ANON_KEY&&!SUPABASE_ANON_KEY.includes("COLLER_ICI");
const client=configured?supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
let registrations=[];

function login(){
 if(adminPassword.value===ADMIN_PASSWORD){
  sessionStorage.setItem("esna_admin_ok","1");
  showAdmin();
 }else{
  loginMessage.textContent="Mot de passe incorrect.";
 }
}
function logout(){sessionStorage.removeItem("esna_admin_ok"); location.reload()}
function showAdmin(){
 loginBox.style.display="none";
 adminPanel.style.display="block";
 load();
}
if(sessionStorage.getItem("esna_admin_ok")==="1") showAdmin();

async function load(){
 if(client){
  let r=await client.from("registrations").select("*").order("created_at",{ascending:false});
  registrations=r.data||[];
 }else{
  registrations=JSON.parse(localStorage.getItem("esna_registrations_demo")||"[]").reverse();
 }

 total.textContent=registrations.length;
 paid.textContent=registrations.filter(r=>r.payment_status==="Payé").length;
 pending.textContent=registrations.filter(r=>r.payment_status!=="Payé").length;

 let tb=document.querySelector("#registrationsTable tbody");
 tb.innerHTML="";
 registrations.forEach((r, index)=>{
  const slots=r.slots_text || (Array.isArray(r.slots)?r.slots.join(" / "):(r.slots||r.slot||""));
  let tr=document.createElement("tr");
  tr.innerHTML=`<td>${r.player_firstname||""} ${r.player_lastname||""}</td><td>${r.category||""}</td><td>${slots}</td><td>${r.package||""}</td><td>${r.status||""}</td><td>${r.parent_email||""}</td><td>${r.parent_phone||""}</td><td>${r.payment_status||"En attente"}</td><td><button class="delete-btn" onclick="deleteRegistration('${r.id || ""}', ${index})">Supprimer</button></td>`;
  tb.appendChild(tr);
 });
}

async function deleteRegistration(id, visibleIndex){
 const ok = confirm("Confirmer la suppression de cette inscription ? Les places seront libérées.");
 if(!ok) return;

 if(client){
  if(!id){
   alert("Impossible de supprimer : identifiant manquant.");
   return;
  }
  const { error } = await client.from("registrations").delete().eq("id", id);
  if(error){
   alert("Erreur suppression : " + error.message + "\n\nPense à relancer le fichier supabase.sql dans Supabase pour autoriser la suppression.");
   return;
  }
 }else{
  // En mode démonstration, la liste affichée est inversée.
  // On supprime donc dans la vraie liste avec l'index corrigé.
  let data = JSON.parse(localStorage.getItem("esna_registrations_demo")||"[]");
  const realIndex = data.length - 1 - visibleIndex;
  if(realIndex >= 0){
    data.splice(realIndex, 1);
    localStorage.setItem("esna_registrations_demo", JSON.stringify(data));
  }
 }

 await load();
 alert("Inscription supprimée.");
}

function exportCSV(){
 let rows=[["Nom","Prénom","Catégorie","Créneaux","Formule","Statut","Email","Téléphone","Club","Infos médicales","Paiement"],...registrations.map(r=>[r.player_lastname,r.player_firstname,r.category,r.slots_text||(Array.isArray(r.slots)?r.slots.join(" / "):r.slots||r.slot),r.package,r.status,r.parent_email,r.parent_phone,r.current_club,r.medical_notes,r.payment_status])];
 let csv=rows.map(row=>row.map(v=>`"${String(v||"").replaceAll('"','""')}"`).join(";")).join("\n");
 let a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})); a.download="inscriptions_stage_esna.csv"; a.click();
}
