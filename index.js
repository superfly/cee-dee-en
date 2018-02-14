/*
* Fly edge apps can act on routes, or run a single function for 
* every HTTP request. A CDN needs to apply the same logic to every, 
* request, so register a single `respondWith` handler that does it all.
*/
fly.http.respondWith(async function(req){
  const url = normalizeUrl(req.url)
  const headers = normalizeHeaders(req.headers)
  const key = generateCacheKey(req.method, url, headers)

  return new Response("Cache key: " + key)
})

/*
* URLs can have all kinds of funny inconsistencies. This cleans them 
* up in a reasonably safe way by:
*
* * Sorting query parameters
* * Removing tracking params that are only used by client side JS
*/
function normalizeUrl(url){
  return url
}

function normalizeHeaders(headers){
  return headers
}

function generateCacheKey(method, url, headers){
  return [method, url.toString()].join(":")
}

/*
* The HTTP caching spec is somewhat complicated. Fortunately,
* there's a pretty good, pure Javascript module for handling 
* all the crusty bits: https://github.com/kornelski/http-cache-semantics
*/
import CachePolicy from 'http-cache-semantics'