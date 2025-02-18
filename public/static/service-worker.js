// if your browser supports service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js").then(res=>{
        // on every reload this function is being called
        console.log(res)        
        console.log('service worker registered')
    })
 }

setTimeout(() => {
    const img = new Image();
    img.src = 'always.jpeg';
    document.body.appendChild(img);
}, 3000);

// This code executes in its own worker or thread
self.addEventListener("install", event => {
    // this event triggers only once the tab is opened
    // if n tabs are opened, this will be triggered n times on the begining

    // self.skipWaiting() forces a service worker to activate immediately
    self.skipWaiting();
    console.log("Service worker installed");
 });

 self.addEventListener("activate", event => { 
    // this event is not being triggered 
    console.log("Service worker activated");
    // waitUntil() tells the browser that work is ongoing until the promise settles, and it shouldn't terminate the service worker if it wants that work to complete.
    event.waitUntil(clients.claim());
 });

const urlsToCache = ["/", 'sw.js', "index.html", "always.jpeg", "afterAllThisTime.jpeg"];
self.addEventListener("install", event => {
   event.waitUntil(
      caches.open("chamber-of-secrets")
      .then(cache => {
         return cache.addAll(urlsToCache);
      })
   );
});

const simpleResponse = new Response("Body of the HTTP response");

const options = {
   status: 200,
   headers: {
	'Content-type': 'text/html'
   }
};
const htmlResponse = new Response("<b>HTML</b> content", options)

self.addEventListener('fetch', event => {
    // for getting image from internet,
    // on first call it gets cached and trigger fetch event
    // from second call takes 0ms to load and do not trigger fetch event

    // for getting image from internal folders
    // on every call it triggers fetch event
    // on every call it takes more than 1ms time
    console.log(event.request.url)
    event.respondWith(
        caches.match(event.request)
        .then(cacheResponse => {
            return cacheResponse || fetch(event.request);
        })
    )
})