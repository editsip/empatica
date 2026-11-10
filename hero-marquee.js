(() => {
  const marquee = document.querySelector('.hero-marquee');
  if (!marquee) return;

  const storageKey = 'empatica-header-marquee';
  const requested = new URLSearchParams(location.search).get('marquee');
  let preference = requested === 'on' || requested === 'off' ? requested : null;

  try {
    if (preference) {
      sessionStorage.setItem(storageKey, preference);
    } else {
      preference = sessionStorage.getItem(storageKey);
    }
  } catch {
    // The URL still applies when browser storage is unavailable.
  }

  if (preference === 'off') return;

  const symbols = [
    'presenza', 'relazioni', 'materia', 'studio', 'identita', 'audiovisivo',
    'esperienze', 'idea', 'linguaggio', 'costruzione', 'imprese', 'enti',
    'lavori', 'contatti', 'facilitazione', 'accesso', 'pratica', 'ufficio',
    'freccia', 'chiudi', 'movimento',
  ];
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const strip = document.createElement('div');
  strip.className = 'marquee-strip';

  for (const symbol of symbols) {
    const icon = document.createElementNS(svgNamespace, 'svg');
    icon.setAttribute('class', 'sign');
    icon.setAttribute('viewBox', '0 0 40 40');
    icon.setAttribute('focusable', 'false');

    const use = document.createElementNS(svgNamespace, 'use');
    use.setAttribute('href', `segni.svg#${symbol}`);
    icon.append(use);
    strip.append(icon);
  }

  marquee.querySelector('.marquee-track').append(strip, strip.cloneNode(true));

  marquee.hidden = false;
})();
