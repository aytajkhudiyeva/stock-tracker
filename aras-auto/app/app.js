const views=[...document.querySelectorAll("[data-view]")];
const navButtons=[...document.querySelectorAll(".bottom-nav [data-go]")];
const showView=name=>{
  const target=views.some(view=>view.dataset.view===name)?name:"home";
  views.forEach(view=>view.classList.toggle("active",view.dataset.view===target));
  navButtons.forEach(button=>button.classList.toggle("active",button.dataset.go===target));
  history.replaceState(null,"",`${location.pathname}?tab=${target}`);
  scrollTo({top:0,behavior:"smooth"});
};
document.addEventListener("click",event=>{
  const trigger=event.target.closest("[data-go]");
  if(trigger)showView(trigger.dataset.go);
});
showView(new URLSearchParams(location.search).get("tab")||"home");

const toast=document.querySelector("#appToast");
let toastTimer;
function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}

const savedFavorites=new Set(JSON.parse(localStorage.getItem("arasAppFavorites")||"[]"));
const favoriteButtons=[...document.querySelectorAll(".favorite")];
favoriteButtons.forEach((button,index)=>{
  if(savedFavorites.has(index)){button.classList.add("active");button.textContent="♥"}
  button.addEventListener("click",()=>{
    if(savedFavorites.has(index)){savedFavorites.delete(index);button.classList.remove("active");button.textContent="♡"}
    else{savedFavorites.add(index);button.classList.add("active");button.textContent="♥"}
    localStorage.setItem("arasAppFavorites",JSON.stringify([...savedFavorites]));
    document.querySelector("#favoriteCount").textContent=`${savedFavorites.size} avtomobil`;
    showToast(savedFavorites.has(index)?"Seçilmişlərə əlavə edildi.":"Seçilmişlərdən çıxarıldı.");
  });
});
document.querySelector("#favoriteCount").textContent=`${savedFavorites.size} avtomobil`;

const search=document.querySelector("#carSearch");
const filterButtons=[...document.querySelectorAll("[data-filter]")];
let activeFilter="all";
function filterCars(){
  const query=(search.value||"").toLowerCase().trim();
  document.querySelectorAll("[data-car]").forEach(card=>{
    const name=card.dataset.name;
    card.hidden=Boolean((query&&!name.includes(query))||(activeFilter!=="all"&&!name.includes(activeFilter)));
  });
}
search?.addEventListener("input",filterCars);
filterButtons.forEach(button=>button.addEventListener("click",()=>{
  activeFilter=button.dataset.filter;
  filterButtons.forEach(item=>item.classList.toggle("active",item===button));
  filterCars();
}));

const price=document.querySelector("#appPrice");
function updateBudget(){
  const vehicle=Number(price.value||0)*1.7;
  const service=Math.max(5700,Math.min(7800,vehicle*.19));
  const customs=Math.max(4500,Math.min(11000,vehicle*.2));
  const format=value=>`${Math.round(value).toLocaleString("az-AZ")} ₼`;
  document.querySelector("#appCar").textContent=format(vehicle);
  document.querySelector("#appService").textContent=format(service);
  document.querySelector("#appCustoms").textContent=format(customs);
  document.querySelector("#appTotal").textContent=format(vehicle+service+customs);
}
price?.addEventListener("input",updateBudget);
updateBudget();

document.querySelector("#appTrack")?.addEventListener("submit",event=>{
  event.preventDefault();
  const code=document.querySelector("#appTrackCode").value.trim().toUpperCase();
  document.querySelector("#appTimeline").hidden=code!=="AA-NUMUNE-2406";
  showToast(code==="AA-NUMUNE-2406"?"Nümunə sifariş tapıldı.":"Bu demo kodu tapılmadı.");
});
document.querySelector("#notifyButton")?.addEventListener("click",()=>showToast("Yeni bildiriş yoxdur."));

let installPrompt;
const installButton=document.querySelector("#installButton");
addEventListener("beforeinstallprompt",event=>{
  event.preventDefault();
  installPrompt=event;
  installButton.hidden=false;
});
installButton?.addEventListener("click",async()=>{
  if(!installPrompt)return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt=null;
  installButton.hidden=true;
});
addEventListener("appinstalled",()=>showToast("Aras Auto telefona əlavə edildi."));

if("serviceWorker" in navigator){
  addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
