const header=document.querySelector(".site-header");
const menu=document.querySelector(".menu-button");
menu?.addEventListener("click",()=>{const open=header.classList.toggle("menu-open");menu.setAttribute("aria-expanded",String(open))});

document.querySelectorAll(".lang-btn[data-lang]").forEach(btn=>{
  if(btn.dataset.lang==="az")btn.classList.add("active");
  btn.addEventListener("click",()=>showToast(btn.dataset.lang==="ru"?"Rus dili demo mərhələsində hazırlanır.":"Azərbaycan dili aktivdir."));
});

const carBudget=document.querySelector("#carBudget");
const serviceBudget=document.querySelector("#serviceBudget");
const reserveBudget=document.querySelector("#reserveBudget");
const totalBudget=document.querySelector("#totalBudget");
const formatAZN=value=>`${Math.round(value).toLocaleString("az-AZ")} AZN`;
function updateBudget(){
  const price=document.querySelector("#vehiclePrice");
  if(!price)return;
  const rate=Number(document.querySelector("#exchangeRate")?.value||1.7);
  const vehicle=Number(price.value||0)*rate;
  const usdFees=["localLogistics","shipping","inspectionFee","serviceFee","insuranceFee"].reduce((sum,id)=>sum+Number(document.querySelector(`#${id}`)?.value||0),0)*rate;
  const customs=Number(document.querySelector("#customsReserve")?.value||0);
  if(carBudget)carBudget.textContent=formatAZN(vehicle);
  if(serviceBudget)serviceBudget.textContent=formatAZN(usdFees);
  if(reserveBudget)reserveBudget.textContent=formatAZN(customs);
  if(totalBudget)totalBudget.textContent=formatAZN(vehicle+usdFees+customs);
}
document.querySelector("#calculator")?.addEventListener("input",updateBudget);updateBudget();

async function loadPublicSettings(){
  try{
    const {settings}=await apiJson("/api/public/settings");
    const map={exchangeRate:"exchangeRate",localLogisticsUsd:"localLogistics",shippingUsd:"shipping",inspectionFeeUsd:"inspectionFee",serviceFeeUsd:"serviceFee",insuranceFeeUsd:"insuranceFee",customsReserveAzn:"customsReserve"};
    Object.entries(map).forEach(([key,id])=>{
      const input=document.querySelector(`#${id}`);
      if(input&&settings[key]!==undefined)input.value=settings[key];
    });
    updateBudget();
  }catch{}
}
loadPublicSettings();

const toast=document.querySelector("#toast");
let toastTimer;
function showToast(message){if(!toast)return;toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),3200)}
async function apiJson(path,options={}){
  const response=await fetch(path,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(payload.error||"Sorğu tamamlanmadı.");
  return payload;
}
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));

const quickPrice=document.querySelector("#quickVehiclePrice");
const quickTotal=document.querySelector("#quickTotal");
function updateQuickBudget(){
  if(!quickPrice||!quickTotal)return;
  const vehicle=Number(quickPrice.value||0)*1.7;
  const variableFees=Math.max(5700,Math.min(7800,vehicle*.18));
  const customs=Math.max(4500,Math.min(11000,vehicle*.2));
  quickTotal.textContent=`${Math.round(vehicle+variableFees+customs).toLocaleString("az-AZ")} ₼`;
}
quickPrice?.addEventListener("input",updateQuickBudget);updateQuickBudget();

document.querySelector("#quickTrackForm")?.addEventListener("submit",event=>{
  event.preventDefault();
  const code=document.querySelector("#quickTrackCode")?.value.trim();
  if(!code)return showToast("Sifariş kodunu daxil edin.");
  localStorage.setItem("arasAutoTrackCode",code);
  window.location.href=`izleme/?code=${encodeURIComponent(code)}`;
});

document.querySelectorAll(".vehicle-photo button").forEach(button=>button.addEventListener("click",event=>{event.preventDefault();button.textContent=button.textContent==="♡"?"♥":"♡";showToast("Nümunə seçilmişlər siyahısı yeniləndi.")}));

document.querySelector("#leadForm")?.addEventListener("submit",event=>{
  event.preventDefault();
  const data=Object.fromEntries(new FormData(event.currentTarget));
  localStorage.setItem("arasAutoDemoLead",JSON.stringify(data));
  const note=document.querySelector("#formNote");
  if(note){note.textContent="Sorğu göndərilir. WhatsApp pəncərəsi də açılır.";note.style.color="#53d492"}
  apiJson("/api/leads",{method:"POST",body:JSON.stringify(data)}).then(()=>showToast("Sorğu admin panelə düşdü.")).catch(error=>showToast(error.message));
  const message=`Salam, Auto Import Platform seçim sorğusu:%0AAd: ${encodeURIComponent(data.name||"")}%0ATelefon: ${encodeURIComponent(data.phone||"")}%0ABüdcə: ${encodeURIComponent(data.budget||"")}%0ATip: ${encodeURIComponent(data.type||"")}%0Aİstək: ${encodeURIComponent(data.message||"")}`;
  window.open(`https://wa.me/994702250125?text=${message}`,"_blank","noopener");
});

document.querySelector("#quickLinkForm")?.addEventListener("submit",event=>{
  event.preventDefault();
  const url=new FormData(event.currentTarget).get("listingUrl");
  localStorage.setItem("arasAutoListingUrl",String(url||""));
  window.open(`https://wa.me/994702250125?text=Salam%2C%20bu%20elan%C4%B1%20yoxlama%C4%9F%C4%B1n%C4%B1z%C4%B1%20ist%C9%99yir%C9%99m%3A%20${encodeURIComponent(url||"")}`,"_blank","noopener");
  showToast("Elan linki WhatsApp üçün hazırlandı.");
});

document.querySelector("#listingAnalyzer")?.addEventListener("submit",event=>{
  event.preventDefault();
  const url=document.querySelector("#analyzerUrl")?.value.trim();
  const budget=document.querySelector("#analyzerBudget")?.value;
  const priority=document.querySelector("#analyzerPriority")?.value;
  if(!url)return showToast("Elan linkini daxil edin.");
  localStorage.setItem("arasAutoAnalysis",JSON.stringify({url,budget,priority,createdAt:new Date().toISOString()}));
  const result=document.querySelector("#analyzerResult");
  if(result)result.hidden=false;
  showToast("İlkin risk hesabatı hazırlandı.");
});

document.querySelector("#trackForm")?.addEventListener("submit",event=>{
  event.preventDefault();
  const code=document.querySelector("#trackCode")?.value.trim();
  if(!code)return showToast("Nümunə kodu daxil edin: AA-NUMUNE-2406");
  loadTrackOrder(code);
});
const incomingTrackCode=new URLSearchParams(window.location.search).get("code");
if(incomingTrackCode&&document.querySelector("#trackCode")){
  document.querySelector("#trackCode").value=incomingTrackCode;
  loadTrackOrder(incomingTrackCode);
}

function renderTrackOrder(order){
  const result=document.querySelector("#trackResult");
  if(!result)return;
  result.hidden=false;
  const stages=Array.isArray(order.stages)?order.stages:[];
  result.innerHTML=`<div class="calc-head"><div><small>Sifariş izləmə</small><h2>${escapeHtml(order.vehicle||"Avtomobil sifarişi")}</h2></div><span class="demo-pill dark-pill">${escapeHtml(order.status||"AKTİV")}</span></div>
    <div class="dashboard-kpis"><div><span>Sifariş kodu</span><b>${escapeHtml(order.code)}</b></div><div><span>Hazırkı mərhələ</span><b>${escapeHtml(order.currentStage||"-")}</b></div><div><span>Növbəti yeniləmə</span><b>${escapeHtml(order.nextUpdate||"-")}</b></div></div>
    <div class="track-list">${stages.map(stage=>`<article class="${stage.state==="done"?"done":stage.state==="current"?"current":""}"><i></i><div><strong>${escapeHtml(stage.title)}</strong><p>${escapeHtml(stage.description||"")}</p></div></article>`).join("")}</div>`;
}
async function loadTrackOrder(code){
  try{
    const {order}=await apiJson(`/api/track/${encodeURIComponent(code)}`);
    renderTrackOrder(order);
    showToast("Sifariş tapıldı.");
  }catch(error){
    const result=document.querySelector("#trackResult");
    if(result)result.hidden=true;
    showToast(error.message);
  }
}

const catalogControls=["catalogSearch","yearFilter","fuelFilter","bodyFilter"].map(id=>document.querySelector(`#${id}`)).filter(Boolean);
function filterCatalog(){
  const query=(document.querySelector("#catalogSearch")?.value||"").toLowerCase().trim();
  const year=document.querySelector("#yearFilter")?.value||"";
  const fuel=document.querySelector("#fuelFilter")?.value||"";
  const body=document.querySelector("#bodyFilter")?.value||"";
  let visible=0;
  document.querySelectorAll("[data-vehicle]").forEach(card=>{
    const matches=(!query||card.dataset.vehicle.toLowerCase().includes(query))&&(!year||card.dataset.year===year)&&(!fuel||card.dataset.fuel===fuel)&&(!body||card.dataset.body===body);
    card.hidden=!matches;
    if(matches)visible++;
  });
  const empty=document.querySelector("#catalogEmpty");
  if(empty)empty.hidden=visible!==0;
}
catalogControls.forEach(control=>control.addEventListener("input",filterCatalog));
document.querySelector("#resetFilters")?.addEventListener("click",()=>{
  catalogControls.forEach(control=>control.value="");
  filterCatalog();
});

function renderPublicVehicle(vehicle){
  const title=vehicle.title||"Avtomobil";
  const year=String(vehicle.year||"");
  const fuel=vehicle.fuel||"";
  const body=vehicle.body||"";
  const score=Number(vehicle.riskScore||75);
  const fuelKey=fuel.toLowerCase().includes("hibrid")?"hybrid":fuel.toLowerCase().includes("dizel")?"diesel":fuel.toLowerCase().includes("elektr")?"electric":fuel.toLowerCase().includes("lpg")?"lpg":"petrol";
  const bodyKey=body.toLowerCase().includes("sedan")?"sedan":body.toLowerCase().includes("minivan")?"minivan":body.toLowerCase().includes("het")?"hatchback":"suv";
  const dataVehicle=escapeHtml([title,fuel,body,year].join(" ").toLowerCase());
  return `<article class="vehicle-card" data-vehicle="${dataVehicle}" data-year="${escapeHtml(year)}" data-fuel="${fuelKey}" data-body="${bodyKey}" data-model="${escapeHtml(title)}" data-price="≈ ${Number(vehicle.bakuPriceAzn||0).toLocaleString("az-AZ")} ₼" data-risk="${score}">
    <div class="vehicle-photo"><img src="${escapeHtml(vehicle.image||"../assets/hero-v2.jpg")}" alt="${escapeHtml(title)}"><span class="demo-pill">${escapeHtml(vehicle.status||"AKTİV")}</span><button aria-label="Seçilmişlərə əlavə et">♡</button></div>
    <div class="vehicle-body"><small>${escapeHtml(year)} · ${escapeHtml(fuel)} · ${escapeHtml(vehicle.mileage||"-")}</small><h3>${escapeHtml(title)}</h3>
      <div class="vehicle-intelligence"><span class="risk-badge ${score>=85?"safe":score>=75?"medium":"watch"}"><b>${score}</b>/100 · Risk balı</span><span>${score>=85?"Aşağı risk":score>=75?"Əlavə yoxlama":"Diqqətli seçim"}</span></div>
      <div class="price-stack"><span>Xaricdə <b>${Number(vehicle.priceUsd||0).toLocaleString("az-AZ")} USD</b></span><span>Təxmini Bakı büdcəsi <strong>≈ ${Number(vehicle.bakuPriceAzn||0).toLocaleString("az-AZ")} ₼</strong></span><small>${escapeHtml(vehicle.note||"Yekun məbləğ VIN və sənədlər təsdiqləndikdən sonra dəqiqləşir.")}</small></div>
      <div class="spec-row"><span>${escapeHtml(fuel)}</span><span>${escapeHtml(body)}</span><span>${escapeHtml(year)}</span></div>
      <div class="vehicle-tools"><button type="button" data-compare>＋ Müqayisə et</button><button type="button" data-alert>♧ Qiyməti izlə</button></div>
      <a class="vehicle-cta" href="https://wa.me/994702250125?text=${encodeURIComponent(`Salam, ${title} üzrə təklif istəyirəm.`)}">Bu avtomobil üzrə təklif al ↗</a>
    </div></article>`;
}
async function loadPublicVehicles(){
  const grid=document.querySelector(".catalog-grid");
  if(!grid)return;
  try{
    const {vehicles}=await apiJson("/api/public/vehicles");
    if(Array.isArray(vehicles)&&vehicles.length){
      grid.innerHTML=vehicles.map(renderPublicVehicle).join("");
      const intro=document.querySelector(".filter-intro b");
      if(intro)intro.textContent=`${vehicles.length} aktiv seçim`;
      filterCatalog();
    }
  }catch{}
}
loadPublicVehicles();

function renderPublicDelivery(delivery){
  const title=delivery.title||"Təhvil verilmiş avtomobil";
  const date=delivery.date?new Intl.DateTimeFormat("az-AZ",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(delivery.date)):"Tarix dəqiqləşir";
  const summary=String(delivery.summary||"Yoxlama, sənədləşmə və təhvil mərhələləri tamamlandı.");
  const points=summary.split(/\n|;/).map(item=>item.trim()).filter(Boolean).slice(0,3);
  const list=points.length?points:["Ekspert yoxlaması tamamlandı","Logistika mərhələləri izlənildi","Bakı təhvili rəsmiləşdirildi"];
  return `<article class="delivery-card"><div class="delivery-image"><img src="${escapeHtml(delivery.image||"../assets/hero-v2.jpg")}" alt="${escapeHtml(title)}"><span>TƏHVİL</span></div><div><small>${escapeHtml(date)}</small><h2>${escapeHtml(title)}</h2><p><b>${escapeHtml(delivery.customer||"Auto Import Platform müştərisi")}</b> üçün tamamlanmış sifariş</p><ul>${list.map(item=>`<li>${escapeHtml(item)}</li>`).join("")}</ul><a href="../izleme/">Status tarixçəsinə bax ↗</a></div></article>`;
}
async function loadPublicDeliveries(){
  const grid=document.querySelector("[data-delivery-grid]");
  if(!grid)return;
  try{
    const {deliveries}=await apiJson("/api/public/deliveries");
    if(Array.isArray(deliveries)&&deliveries.length)grid.innerHTML=deliveries.map(renderPublicDelivery).join("");
  }catch{}
}
loadPublicDeliveries();

const vehicleRiskScores=[86,74,91,88,77,69,93,81,72];
document.querySelectorAll("[data-vehicle]").forEach((card,index)=>{
  const model=card.querySelector("h3")?.textContent.trim()||`Avtomobil ${index+1}`;
  const price=card.querySelector(".price-stack strong")?.textContent.trim()||"—";
  const score=vehicleRiskScores[index%vehicleRiskScores.length];
  card.dataset.model=model;
  card.dataset.price=price;
  card.dataset.risk=String(score);
  const body=card.querySelector(".vehicle-body");
  if(!body||body.querySelector(".vehicle-tools"))return;
  body.insertAdjacentHTML("afterbegin",`<div class="vehicle-intelligence"><span class="risk-badge ${score>=85?"safe":score>=75?"medium":"watch"}"><b>${score}</b>/100 · Risk balı</span><span>${score>=85?"Aşağı risk":score>=75?"Əlavə yoxlama":"Diqqətli seçim"}</span></div>`);
  body.insertAdjacentHTML("beforeend",`<div class="vehicle-tools"><button type="button" data-compare>＋ Müqayisə et</button><button type="button" data-alert>♧ Qiyməti izlə</button></div>`);
});

const getCompareList=()=>JSON.parse(localStorage.getItem("arasAutoCompare")||"[]");
function saveCompareList(list){
  localStorage.setItem("arasAutoCompare",JSON.stringify(list));
  renderCompareDock();
}
function renderCompareDock(){
  const list=getCompareList();
  let dock=document.querySelector(".compare-dock");
  if(!list.length){dock?.remove();return}
  if(!dock){
    document.body.insertAdjacentHTML("beforeend",`<aside class="compare-dock"><div><small>MÜQAYİSƏ SİYAHISI</small><strong id="compareCount"></strong></div><div class="compare-mini" id="compareMini"></div><button type="button" id="openCompare">Müqayisəni aç ↗</button></aside>`);
    dock=document.querySelector(".compare-dock");
  }
  dock.querySelector("#compareCount").textContent=`${list.length}/3 avtomobil`;
  dock.querySelector("#compareMini").innerHTML=list.map(item=>`<span>${item.model}</span>`).join("");
}
document.addEventListener("click",event=>{
  const compareButton=event.target.closest("[data-compare]");
  if(compareButton){
    const card=compareButton.closest("[data-vehicle]");
    const item={model:card.dataset.model,price:card.dataset.price,risk:card.dataset.risk,year:card.dataset.year,fuel:card.dataset.fuel,body:card.dataset.body};
    const list=getCompareList();
    if(list.some(entry=>entry.model===item.model)){
      saveCompareList(list.filter(entry=>entry.model!==item.model));
      compareButton.textContent="＋ Müqayisə et";
      return showToast("Avtomobil müqayisədən çıxarıldı.");
    }
    if(list.length>=3)return showToast("Eyni anda maksimum 3 avtomobil müqayisə edilə bilər.");
    saveCompareList([...list,item]);
    compareButton.textContent="✓ Seçildi";
    showToast("Avtomobil müqayisəyə əlavə edildi.");
  }
  const alertButton=event.target.closest("[data-alert]");
  if(alertButton){
    const model=alertButton.closest("[data-vehicle]")?.dataset.model;
    openPriceAlert(model);
  }
  if(event.target.closest("#openCompare"))openCompareModal();
});
renderCompareDock();

const dashboardSaved=document.querySelector("#dashboardSaved");
if(dashboardSaved){
  const comparisons=getCompareList();
  const alerts=JSON.parse(localStorage.getItem("arasAutoAlerts")||"[]");
  const analysis=JSON.parse(localStorage.getItem("arasAutoAnalysis")||"null");
  const blocks=[];
  if(comparisons.length)blocks.push(`<div class="saved-block"><b>Müqayisə</b>${comparisons.map(item=>`<span>${item.model}<small>${item.price} · ${item.risk}/100</small></span>`).join("")}</div>`);
  if(alerts.length)blocks.push(`<div class="saved-block"><b>Qiymət bildirişləri</b>${alerts.map(item=>`<span>${item.model}<small>Hədəf: ${item.target||"göstərilməyib"} AZN</small></span>`).join("")}</div>`);
  if(analysis)blocks.push(`<div class="saved-block"><b>Son elan analizi</b><span>${analysis.priority}<small>Büdcə: ${analysis.budget} AZN</small></span></div>`);
  if(blocks.length)dashboardSaved.innerHTML=blocks.join("");
}

function openCompareModal(){
  const list=getCompareList();
  if(!list.length)return;
  document.querySelector(".platform-modal")?.remove();
  const rows=[
    ["Təxmini Bakı büdcəsi","price"],
    ["Platforma Risk Balı","risk"],
    ["İstehsal ili","year"],
    ["Yanacaq","fuel"],
    ["Ban növü","body"]
  ];
  document.body.insertAdjacentHTML("beforeend",`<div class="platform-modal"><div class="modal-backdrop" data-close-modal></div><section class="compare-modal"><header><div><small>SMART COMPARE</small><h2>Avtomobil müqayisəsi</h2></div><button type="button" data-close-modal>×</button></header><div class="compare-table"><div class="compare-row compare-head"><b>Meyar</b>${list.map(item=>`<strong>${item.model}</strong>`).join("")}</div>${rows.map(([label,key])=>`<div class="compare-row"><b>${label}</b>${list.map(item=>`<span>${key==="risk"?`${item[key]}/100`:item[key]}</span>`).join("")}</div>`).join("")}</div><footer><button class="btn btn-outline-dark" type="button" id="clearCompare">Siyahını təmizlə</button><a class="btn btn-red" href="https://wa.me/994702250125?text=Salam%2C%20m%C3%BCqayis%C9%99%20etdiyim%20avtomobill%C9%99r%20%C3%BCzr%C9%99%20ekspert%20r%C9%99yi%20ist%C9%99yir%C9%99m.">Ekspert rəyi al ↗</a></footer></section></div>`);
}
function openPriceAlert(model){
  document.querySelector(".platform-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend",`<div class="platform-modal"><div class="modal-backdrop" data-close-modal></div><section class="alert-modal"><header><div><small>QİYMƏT BİLDİRİŞİ</small><h2>${model}</h2></div><button type="button" data-close-modal>×</button></header><p>Qiymət dəyişəndə və daha sərfəli alternativ tapılanda sizə bildiriş hazırlansın.</p><form id="priceAlertForm"><label>Telefon nömrəsi<input name="phone" required placeholder="+994 50 000 00 00"></label><label>Hədəf Bakı büdcəsi<input name="target" type="number" placeholder="məs. 45000"></label><label class="consent"><input type="checkbox" required><span>Qiymət bildirişi üçün əlaqəyə razıyam.</span></label><button class="btn btn-red full" type="submit">Bildirişi aktivləşdir</button></form></section></div>`);
  document.querySelector("#priceAlertForm")?.addEventListener("submit",event=>{
    event.preventDefault();
    const data=Object.fromEntries(new FormData(event.currentTarget));
    const alerts=JSON.parse(localStorage.getItem("arasAutoAlerts")||"[]");
    alerts.push({model,...data,createdAt:new Date().toISOString()});
    localStorage.setItem("arasAutoAlerts",JSON.stringify(alerts));
    document.querySelector(".platform-modal")?.remove();
    showToast("Qiymət bildirişi kabinetə əlavə edildi.");
  });
}
document.addEventListener("click",event=>{
  if(event.target.closest("[data-close-modal]"))document.querySelector(".platform-modal")?.remove();
  if(event.target.closest("#clearCompare")){
    saveCompareList([]);
    document.querySelector(".platform-modal")?.remove();
    showToast("Müqayisə siyahısı təmizləndi.");
  }
});

document.querySelectorAll("[data-tilt]").forEach(card=>{
  card.addEventListener("pointermove",event=>{
    const box=card.getBoundingClientRect();
    const x=(event.clientX-box.left)/box.width-.5;
    const y=(event.clientY-box.top)/box.height-.5;
    card.style.transform=`rotateY(${x*8}deg) rotateX(${-y*8}deg)`;
  });
  card.addEventListener("pointerleave",()=>card.style.transform="");
});

document.querySelector("#vinForm")?.addEventListener("submit",event=>{
  event.preventDefault();
  const vin=document.querySelector("#vinCode")?.value.trim().toUpperCase();
  if(!vin||vin.length!==17)return showToast("VIN 17 simvoldan ibarət olmalıdır.");
  window.open(`https://wa.me/994702250125?text=Salam%2C%20VIN%20yoxlama%20%C3%BC%C3%A7%C3%BCn%3A%20${encodeURIComponent(vin)}`,"_blank","noopener");
  showToast("VIN yoxlama sorğusu hazırlandı.");
});

if(!document.querySelector(".contact-dock")){
  document.body.insertAdjacentHTML("beforeend",'<div class="contact-dock" aria-label="Sürətli əlaqə"><a class="dock-phone" href="tel:+994702250125"><span>Telefon</span><b>+994 70 225 01 25</b></a><a class="dock-whatsapp" href="https://wa.me/994702250125?text=Salam%2C%20Auto%20Import%20Platform%20xidm%C9%99ti%20haqq%C4%B1nda%20m%C9%99lumat%20almaq%20ist%C9%99yir%C9%99m." target="_blank" rel="noopener"><i>◔</i><span>WhatsApp-da yaz</span></a></div>');
}

if(!document.querySelector(".autobot")){
  document.body.insertAdjacentHTML("beforeend",`
    <section class="autobot" aria-label="AutoBot köməkçisi">
      <button class="autobot-launcher" type="button" aria-expanded="false"><span class="bot-orb"><i></i></span><b>AutoBot</b><small>Onlayn köməkçi</small></button>
      <div class="autobot-panel" hidden>
        <header><span class="bot-orb"><i></i></span><div><b>AutoBot</b><small><i></i> Hazır cavab köməkçisi</small></div><button type="button" class="autobot-close" aria-label="Bağla">×</button></header>
        <div class="autobot-messages" aria-live="polite"><p class="bot-message">Salam! Koreyadan avtomobil sifarişi, xərc, VIN, izləmə və ofis barədə sürətli cavab verə bilərəm.</p></div>
        <div class="autobot-questions">
          <button data-bot-question="recommend">Büdcəmə maşın tap</button>
          <button data-bot-question="time">Maşın neçə günə gəlir?</button>
          <button data-bot-question="price">Qiymətə nələr daxildir?</button>
          <button data-bot-question="listing">Elan linki göndərə bilərəm?</button>
          <button data-bot-question="vin">VIN necə yoxlanılır?</button>
          <button data-bot-question="office">Ofis haradadır?</button>
          <button data-bot-question="contract">Müqavilə varmı?</button>
        </div>
        <form class="autobot-budget" id="autobotBudget" hidden>
          <label>Büdcəniz (AZN)<input name="budget" type="number" required value="45000"></label>
          <label>Avtomobil tipi<select name="type"><option>SUV</option><option>Sedan</option><option>Minivan</option><option>Fərqi yoxdur</option></select></label>
          <label>Telefon<input name="phone" required placeholder="+994 50 000 00 00"></label>
          <button type="submit">3 uyğun seçim hazırla ↗</button>
        </form>
        <a class="autobot-human" href="https://wa.me/994702250125?text=Salam%2C%20AutoBot-dan%20menecer%C9%99%20ke%C3%A7ir%C9%99m." target="_blank" rel="noopener">Canlı menecerə keç · WhatsApp ↗</a>
        <small class="autobot-note">AutoBot hazır məlumat bazasından cavab verir; yekun qiymət və hüquqi şərtləri menecer təsdiqləyir.</small>
      </div>
    </section>`);
}

const botAnswers={
  recommend:"Əla. Büdcə, avtomobil tipi və telefonunuzu yazın; uyğun 3 seçim üçün sorğu hazırlayım.",
  time:"Orta müddət avtomobilin yerləşdiyi şəhər, ixrac sənədləri və gəmi qrafikindən asılıdır. Avtomobil seçildikdən sonra sizə yazılı mərhələ və vaxt planı verilir.",
  price:"Təxmini Bakı büdcəsinə avtomobilin alış qiyməti, Koreya daxili logistika, ekspert yoxlaması, ixrac sənədləri, daşınma, xidmət haqqı və gömrük ehtiyatı daxil edilir.",
  listing:"Bəli. Encar, K Car və ya başqa saytdan tapdığınız elanın linkini göndərin. Komanda tarixçə, risk və yekun büdcə üzrə yoxlayacaq.",
  vin:"17 simvolluq VIN-i VIN yoxlama bölməsinə daxil edin. Tarixçə məlumatı fiziki ekspert baxışı ilə birlikdə qiymətləndirilməlidir.",
  office:"Əhatə dairəsi: Bakı, Azərbaycan. Telefon: +994 70 225 01 25. Əlaqə səhifəsində xəritə də var.",
  contract:"Bəli. Xidmət, ödəniş mərhələləri, dəyişən xərclər və tərəflərin öhdəlikləri yazılı müqavilədə göstərilir. Saytda müqavilə nümunəsi mövcuddur."
};
const bot=document.querySelector(".autobot");
const botLauncher=bot?.querySelector(".autobot-launcher");
const botPanel=bot?.querySelector(".autobot-panel");
const setBotOpen=open=>{
  if(!botPanel||!botLauncher)return;
  botPanel.hidden=!open;
  botLauncher.setAttribute("aria-expanded",String(open));
  bot.classList.toggle("open",open);
};
botLauncher?.addEventListener("click",()=>setBotOpen(botPanel.hidden));
bot?.querySelector(".autobot-close")?.addEventListener("click",()=>setBotOpen(false));
bot?.querySelectorAll("[data-bot-question]").forEach(button=>button.addEventListener("click",()=>{
  const answer=botAnswers[button.dataset.botQuestion];
  const messages=bot.querySelector(".autobot-messages");
  messages.insertAdjacentHTML("beforeend",`<p class="user-message">${button.textContent}</p><p class="bot-message">${answer}</p>`);
  if(button.dataset.botQuestion==="recommend")bot.querySelector("#autobotBudget").hidden=false;
  messages.scrollTop=messages.scrollHeight;
}));
bot?.querySelector("#autobotBudget")?.addEventListener("submit",event=>{
  event.preventDefault();
  const data=Object.fromEntries(new FormData(event.currentTarget));
  localStorage.setItem("arasAutoBotLead",JSON.stringify({...data,createdAt:new Date().toISOString()}));
  const messages=bot.querySelector(".autobot-messages");
  messages.insertAdjacentHTML("beforeend",`<p class="user-message">${data.budget} AZN · ${data.type}</p><p class="bot-message">Sorğunuz hazırdır. İlkin olaraq aşağı riskli hibrid SUV, qənaətcil sedan və alternativ elektrik modelini müqayisə edəcəyik. Menecer nəticəni ${data.phone} nömrəsinə dəqiqləşdirəcək.</p>`);
  event.currentTarget.hidden=true;
  messages.scrollTop=messages.scrollHeight;
  showToast("AutoBot seçim sorğusunu kabinetə əlavə etdi.");
});

const adminAlertCount=document.querySelector("#adminAlertCount");
if(adminAlertCount)adminAlertCount.textContent=String(JSON.parse(localStorage.getItem("arasAutoAlerts")||"[]").length);
const adminLeadCount=document.querySelector("#adminLeadCount");
if(adminLeadCount){
  const localLeads=["arasAutoDemoLead","arasAutoBotLead","arasAutoAnalysis"].filter(key=>localStorage.getItem(key)).length;
  adminLeadCount.textContent=String(12+localLeads);
}
document.querySelector("#newVehicleButton")?.addEventListener("click",()=>showToast("Canlı sistemdə burada avtomobil əlavəetmə forması açılacaq."));
