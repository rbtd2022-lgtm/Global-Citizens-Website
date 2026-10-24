(()=>{const init=()=>{const fab=document.getElementById('f250-fab'),end=document.querySelector('.gcim-bottom-strip');if(!fab||!end)return;new IntersectionObserver(entries=>{for(const entry of entries)fab.hidden=entry.isIntersecting&&entry.intersectionRatio>=.99;},{threshold:[0,.99,1]}).observe(end);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();})();

(function () {
  function initMenu() {
    var toggle = document.querySelector('.gcim-header__menu-toggle .button-icon');
    var menu = document.querySelector('.gcim-header__menu');
    var close = document.querySelector('.gcim-header__menu-close');
    var overlay = document.querySelector('.gcim-header__overlay');
    if (!toggle || !menu || !overlay) return;

    function setOpen(open) {
      menu.classList.toggle('is-active', open);
      overlay.classList.toggle('is-active', open);
      toggle.classList.toggle('is-active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('has-overlay-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('is-active'));
    });
    if (close) {
      close.disabled = false;
      close.addEventListener('click', function () { setOpen(false); });
    }
    overlay.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();



