# seo_patch.py : idempotent text fixes applied after every build (port bodies + web/ref).
# Mirrors what was changed on Webflow on 2026-11-15: Blog + Touring in nav/footer,
# Industries -> /industries, and "New York" in the hero sub-line of each page.
import glob, sys
R = [
    # nav
    ('<a href="/#industries">Industries</a><a href="/work">Work</a><a href="/about">About</a></nav>',
     '<a href="/industries">Industries</a><a href="/work">Work</a><a href="/touring-av">Touring</a><a href="/blog">Blog</a><a href="/about">About</a></nav>'),
    ('<a href="#industries">Industries</a><a href="/work">Work</a><a href="/about">About</a></nav>',
     '<a href="/industries">Industries</a><a href="/work">Work</a><a href="/touring-av">Touring</a><a href="/blog">Blog</a><a href="/about">About</a></nav>'),
    # footer, Company column
    ('<a href="/#industries">Industries</a><a href="/work">Work</a><a href="/about">About</a><a href="/get-a-quote">Contact</a>',
     '<a href="/industries">Industries</a><a href="/work">Work</a><a href="/touring-av">Touring</a><a href="/blog">Blog</a><a href="/about">About</a><a href="/get-a-quote">Contact</a>'),
    # hero sub-lines
    ('Rented, sold or installed, and run by our engineers.', 'Rented, sold or installed in New York, and run by our engineers.'),
    ('playback stations. Rented, sold or installed, and set up by our crew.', 'playback stations. Rented, sold or installed across New York City, and set up by our crew.'),
    ('Designed, built and installed by our own crew.', 'Designed, built and installed by our own crew in Brooklyn, New York.'),
    ('with the sensors and tracking behind them. Rented, installed and run by our crew.', 'with the sensors and tracking behind them. Rented, installed and run by our crew in New York.'),
    ('Rented or installed, and built, focused and run by our crew.', 'Rented or installed in New York, and built, focused and run by our crew.'),
    ('the visuals on the screen behind it. Rented and run by our crew.', 'the visuals on the screen behind it. Rented and run by our crew in New York.'),
    ('the workstations that run the show. Rented, sold or installed by our crew.', 'the workstations that run the show. Rented, sold or installed by our crew in New York.'),
    ('and home theater. Rented, sold or installed, and set up by our crew.', 'and home theater. Rented, sold or installed in New York, and set up by our crew.'),
    ('Nine services, one crew. Pick one', 'Nine services, one New York crew. Pick one'),
    ('then bring and run all of it.</p>', 'then bring and run all of it, in New York and on the road.</p>'),
    ('How we plan, build and run events: costs', 'How we plan, build and run events in New York: costs'),
    ('What we do, how a job runs and what it costs.', 'What we do, how a job runs in New York and what it costs.'),
    ('Every job is scoped to your space', 'Every New York job is scoped to your space'),
    ('logistics, all in-house. One crew plans it', 'logistics, all in-house in Brooklyn, New York. One crew plans it'),
]
files = sys.argv[1:] or (glob.glob('/home/claude/pav-hero/port/*.body.html') + glob.glob('/home/claude/possible-av/web/ref/**/*.html', recursive=True))
n = 0
for f in files:
    s = open(f).read(); t = s
    for a, b in R:
        if b not in t: t = t.replace(a, b)
    if t != s: open(f, 'w').write(t); n += 1
print('patched', n, 'files')
