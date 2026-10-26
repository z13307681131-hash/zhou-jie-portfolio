from pathlib import Path
import urllib.request,concurrent.futures,re,json
root=Path('public/rondel-assets');root.mkdir(parents=True,exist_ok=True)
urls={f'https://madebysourasith-sudo.github.io/rondel-one-turntable/assets/asset-{i:02}.jpg':f'asset-{i:02}.jpg' for i in range(1,25)}
urls.update({'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js':'three-legacy.min.js','https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js':'lenis.min.js','https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js':'gsap.min.js','https://cdn.tailwindcss.com':'tailwind.js','https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js':'three/three.module.js','https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm':'ogl.js'})
for part in ['geometries/RoundedBoxGeometry.js','geometries/ConvexGeometry.js','math/ConvexHull.js']:
 urls['https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/'+part]='three/addons/'+part
fonturl=re.search(r'<link rel="stylesheet" href="(https://fonts.googleapis.com[^\"]+)"',Path('vendor/rondel/original.html').read_text()).group(1)
css=urllib.request.urlopen(urllib.request.Request(fonturl,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode()
for i,u in enumerate(dict.fromkeys(re.findall(r'url\((https:[^)]+)\)',css))):
 name=f'fonts/font-{i}.woff2';urls[u]=name;css=css.replace(u,'/rondel-assets/'+name)
(root/'fonts.css').write_text(css)
def get(pair):
 u,name=pair;p=root/name;p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():return name,p.stat().st_size
 if name=='tailwind.js':u='https://cdn.tailwindcss.com/3.4.17'
 for attempt in range(3):
  try:
   b=urllib.request.urlopen(u,timeout=60).read();p.write_bytes(b);return name,len(b)
  except Exception:
   if attempt==2:raise
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
 for name,n in ex.map(get,urls.items()): print(name,n,flush=True)
Path('vendor/rondel/assets.json').write_text(json.dumps({u:'/rondel-assets/'+n for u,n in urls.items()},indent=2))
