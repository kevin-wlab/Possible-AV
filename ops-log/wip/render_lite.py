import asyncio
from playwright.async_api import async_playwright
HIDE='header.nav,.copy,.card,.labels,#veil,.hud,#focusl,#lead{display:none!important}'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':1600,'height':1000})
        errs=[]; pg.on('pageerror', lambda e: errs.append('PE '+str(e)))
        await pg.goto('http://localhost:8765/index.html#snap'); await pg.add_style_tag(content=HIDE)
        await pg.wait_for_timeout(15000)
        n=await pg.evaluate('document.querySelectorAll(".card").length')
        for i in range(0,n+1):
            await pg.evaluate(f'(()=>{{const f=document.getElementById("floor"),span=f.offsetHeight-innerHeight;scrollTo(0,f.offsetTop+span*{i}/{n})}})()')
            await pg.wait_for_timeout(4000)
            await pg.screenshot(path=f'/tmp/lite/raw{i}.png',timeout=180000)
        print(n,errs[:5]); await b.close()
asyncio.run(main())
