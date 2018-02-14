/*
* Fly edge apps can act on routes, or run a single function for 
* every HTTP request. A CDN needs to apply the same logic to every, 
* request, so register a single `respondWith` handler that does it all.
*/
fly.http.respondWith(async function(req){
  const url = normalizeUrl(req.url)
  const headers = normalizeHeaders(req.headers)
  const key = generateCacheKey(req.method, url, headers)

  let body = await fly.cache.getString(key)
  let status = "HIT"

  if(!body){
    body = [url.toString(), new Date()].join(" - ")
    fly.cache.set(key, body, 10)
    status = "MISS"
  }
  return new Response("Cache " + status + ": " + body + "\r\n" + new Date())
})

/*
* URLs can have all kinds of funny inconsistencies. This function cleans them 
* up:
*
* * Removing tracking params that are only used by client side JS
* * Sorting query parameters
*/
const ignoredParams = "utm_source|utm_medium|utm_campaign|utm_content|gclid|cx|ie|cof|siteurl".split("|")
function normalizeUrl(url){
  const u = new URL(url)
  const sp = u.searchParams
  for(const p of ignoredParams){
    sp.delete(p)
  }
  sp.sort()
  u.search = sp.toString()
  return u
}

/*
* Only some headeres matter for caching purposes. For
* everything except the cookie header, grab the useful ones, 
* and sort their values. Cookie headers get special treament.
*/
function normalizeHeaders(headers){
  return headers
}

const staticFilePattern = /^[^?]*\.(7z|avi|bz2|flac|flv|gz|mka|mkv|mov|mp3|mp4|mpeg|mpg|ogg|ogm|opus|rar|tar|tgz|tbz|txz|wav|webm|xz|zip)(\?.*)?$/
function normalizeCookies(url, headers){
  return headers
}

/*
* Cache keys work best as a hash of normalized request data.
* Since this is optimized for speed, MD5 is a reasonable way of hashing
* data to generate a key.
*/
function generateCacheKey(method, url, headers){
  return [method, url.toString()].join(":")
}

/*
* The HTTP caching spec is somewhat complicated. Fortunately,
* there's a pretty good, pure Javascript module for handling 
* all the crusty bits: https://github.com/kornelski/http-cache-semantics
*/
import CachePolicy from 'http-cache-semantics'
