/*intialize variables*/
var urlContainer = document.querySelector(".url-container");

/*get urls in current window*/
function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}

/*store urls*/
function storeUrls(time, urls) {
  let storingUrls = browser.storage.local.set({ [time] : urls });
  storingUrls.then(() => {
    displayUrls(time, urls, true);
  }, onError);
}

/* generic error handler */
function onError(error) {
  console.log(error);
}

displayStored(); //show everything that is stored when opening extension

/*display all stored items*/
function displayStored() {
  let gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    let urlKeys = Object.keys(results);
    for (let i = urlKeys.length-1; i >= 0; i --) {
      let curValue = results[urlKeys[i]];
      displayUrls(urlKeys[i], curValue, false);
    }
  }, onError);
}

/*display time/urls in popup box*/
function displayUrls(time, urls, update) {
  let docFrag = document.createDocumentFragment();
  let timeTitle = document.createElement('button');
  let deleteBtn = document.createElement('button');
  let container = document.createElement('div');
  let dropMenu = document.createElement('ul');

  timeTitle.setAttribute('class','dropdown-btn');
  timeTitle.setAttribute('id', time+'-dropdown-btn');
  deleteBtn.setAttribute('class', 'delete-btn');
  deleteBtn.setAttribute('id', time);
  dropMenu.setAttribute('class', 'dropdown-menu');
  dropMenu.setAttribute('id', time+'-dropdown-menu');
  container.setAttribute('class', 'single-container');
  container.setAttribute('id', time+'-single-container');
  timeTitle.textContent = time;
  deleteBtn.textContent = 'X';
  container.appendChild(deleteBtn);
  container.appendChild(timeTitle);

  for(let i = 0; i < urls.length; i++){
    let a = document.createElement('a');
    let li = document.createElement('li');
    let url = urls[i].url;
    a.setAttribute('href',url);
    a.textContent = urls[i].title;
    li.appendChild(a);
    dropMenu.appendChild(li);
  }
  container.appendChild(dropMenu);
  docFrag.appendChild(container);
  if(update){ 
    urlContainer.insertBefore(docFrag, urlContainer.firstChild); 
  } else{
    urlContainer.appendChild(docFrag);
  }

}

/*click*/
document.addEventListener("click", (e) => {
  if (e.target.id === "save") {
      let urls = [];
      getCurrentWindowTabs().then((tabs) => {
        for( let tab of tabs ){
          urls.push(tab);
        }
        storeUrls((new Date()).toLocaleString(), urls);
      })
  } else if(e.target.id === "clear") {
    browser.storage.local.clear().then(() => {
      while(urlContainer.firstChild) {
        urlContainer.removeChild(urlContainer.firstChild);
      }
    });

  } else if(e.target.className === "delete-btn") {
    browser.storage.local.remove(e.target.id).then(() => {
      let singleContainer = document.getElementById(e.target.id+'-single-container');
      urlContainer.removeChild(singleContainer);
    });
  } else if(e.target.className === "dropdown-btn") {
    let targetId = e.target.id.replace("dropdown-btn","dropdown-menu");
    let element = document.getElementById(targetId);
    if(element.className.includes('show')){
      element.classList.remove("show");
    } else {
      element.classList.add("show");
    }
  }
});
