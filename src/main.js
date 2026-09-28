import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { soundManager } from './audio.js';
import { initParticles } from './particles.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// 1. SILKY SMOOTH MOMENTUM SCROLL (LENIS + GSAP INTEGRATION)
// ==========================================================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 2,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ==========================================================================
// 2. AMBIENT PARTICLES
// ==========================================================================
initParticles();

// ==========================================================================
// 3. SOUND SYSTEM INTEGRATION
// ==========================================================================
const soundBtn = document.getElementById('sound-toggle');
if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    const isPlaying = soundManager.toggleSound();
    soundBtn.classList.toggle('playing', isPlaying);
  });
}

// Add acoustic micro-feedback on buttons
document.querySelectorAll('button, a').forEach((el) => {
  el.addEventListener('mouseenter', () => soundManager.playClick(950));
  el.addEventListener('click', () => soundManager.playClick(620));
});

// ==========================================================================
// 4. CLEAN MAGNETIC BUTTON PHYSICS (NO CURSOR ARTIFACTS/LINES)
// ==========================================================================
document.querySelectorAll('.hover-magnetic').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});

// ==========================================================================
// 5. CINEMATIC PRELOADER SEQUENCE
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loader-bar');
  const percentText = document.getElementById('loader-percent');
  const curtainTop = document.querySelector('.loader-curtain-top');
  const curtainBottom = document.querySelector('.loader-curtain-bottom');
  const loaderContent = document.querySelector('.loader-content');

  let count = { val: 0 };

  const loadTL = gsap.timeline({
    onComplete: () => {
      // Split shutter reveal
      soundManager.playImpact();
      gsap.to(loaderContent, { opacity: 0, scale: 0.9, duration: 0.6, ease: 'power3.in' });
      gsap.to(curtainTop, { yPercent: -100, duration: 1.2, ease: 'power4.inOut', delay: 0.3 });
      gsap.to(curtainBottom, { 
        yPercent: 100, 
        duration: 1.2, 
        ease: 'power4.inOut', 
        delay: 0.3,
        onComplete: () => {
          if (loader) loader.style.display = 'none';
          initHeroEntrance();
        }
      });
    }
  });

  loadTL.to(count, {
    val: 100,
    duration: 1.8,
    ease: 'power2.inOut',
    onUpdate: () => {
      const current = Math.floor(count.val);
      if (bar) bar.style.width = `${current}%`;
      if (percentText) percentText.textContent = `${current < 10 ? '0' + current : current}%`;
    }
  });
});

// ==========================================================================
// 6. HERO ENTRANCE & SCROLL PINNING ANIMATIONS
// ==========================================================================
function initHeroEntrance() {
  const heroImg = document.getElementById('hero-img');
  const words = document.querySelectorAll('.hero-word');
  const badge = document.querySelector('.hero-badge-wrap');
  const subtext = document.querySelector('.hero-subtext');
  const ctas = document.querySelector('.hero-cta-group');
  const scrollIndicator = document.querySelector('.hero-scroll-indicator');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 1. Hero image zoom out 120% -> 100%
  tl.fromTo(heroImg, { scale: 1.25 }, { scale: 1.05, duration: 2.2, ease: 'power2.out' }, 0);

  // 2. Sequential words reveal
  tl.fromTo(words, { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.12 }, 0.4);

  // 3. Badges, subtext and CTAs slide up
  tl.fromTo(badge, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.8);
  tl.fromTo(subtext, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.0);
  tl.fromTo(ctas, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.2);
  tl.fromTo(scrollIndicator, { opacity: 0 }, { opacity: 0.7, duration: 1 }, 1.5);

  // HERO SCROLL SEQUENCE (PIN & FADE CINEMATIC SEQUENCE)
  gsap.to('#hero-heading', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
    scale: 0.78,
    y: -120,
    opacity: 0,
    ease: 'none',
  });

  gsap.to('#hero-img', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
    scale: 1.2,
    y: 100,
    filter: 'contrast(130%) brightness(30%)',
    ease: 'none',
  });
}

// ==========================================================================
// 7. FLOATING NAVIGATION BAR SCROLL LOGIC
// ==========================================================================
const navbar = document.getElementById('navbar');
let lastScrollY = 0;

lenis.on('scroll', ({ scroll }) => {
  if (scroll > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  if (scroll > 400 && scroll > lastScrollY) {
    navbar.classList.add('hidden');
  } else {
    navbar.classList.remove('hidden');
  }
  lastScrollY = scroll;
});

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileDrawer = document.getElementById('mobile-drawer');
const drawerClose = document.getElementById('drawer-close');

if (menuToggle && mobileDrawer && drawerClose) {
  menuToggle.addEventListener('click', () => mobileDrawer.classList.add('open'));
  drawerClose.addEventListener('click', () => mobileDrawer.classList.remove('open'));
  document.querySelectorAll('.drawer-link').forEach((link) => {
    link.addEventListener('click', () => mobileDrawer.classList.remove('open'));
  });
}

// ==========================================================================
// 8. DUAL INFINITE MARQUEE WITH SCROLL VELOCITY ACCELERATION
// ==========================================================================
const trackLeft = document.querySelector('#marquee-left .marquee-track');
const trackRight = document.querySelector('#marquee-right .marquee-track');

if (trackLeft && trackRight) {
  let leftPos = 0;
  let rightPos = -50;
  let velocityFactor = 1;

  ScrollTrigger.create({
    trigger: '#marquee-banner',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      // Dynamic scroll velocity effect
      const vel = Math.abs(self.getVelocity() / 300);
      velocityFactor = 1 + Math.min(vel, 4);
    }
  });

  function animateMarquee() {
    leftPos -= 0.8 * velocityFactor;
    rightPos += 0.8 * velocityFactor;

    if (leftPos <= -50) leftPos = 0;
    if (rightPos >= 0) rightPos = -50;

    trackLeft.style.transform = `translateX(${leftPos}%)`;
    trackRight.style.transform = `translateX(${rightPos}%)`;

    // Gradually return velocity to normal
    velocityFactor += (1 - velocityFactor) * 0.05;
    requestAnimationFrame(animateMarquee);
  }
  requestAnimationFrame(animateMarquee);
}

// ==========================================================================
// 9. ABOUT SECTION: GROWING PROGRESS LINE & EXPANDING EDITORIAL IMAGE
// ==========================================================================
const aboutLine = document.getElementById('about-line');
const aboutCard = document.getElementById('about-img-card');
const aboutImg = document.getElementById('about-img');

if (aboutLine) {
  gsap.to(aboutLine, {
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top 70%',
      end: 'bottom 40%',
      scrub: 1,
    },
    height: '100%',
    ease: 'none',
  });
}

if (aboutCard && aboutImg) {
  gsap.fromTo(aboutCard, 
    { width: '78%', rotate: 2, borderRadius: '28px' },
    {
      scrollTrigger: {
        trigger: '#about-stage',
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: 1,
      },
      width: '100%',
      rotate: 0,
      borderRadius: '8px',
      ease: 'power2.out',
    }
  );

  gsap.fromTo(aboutImg,
    { scale: 1.25 },
    {
      scrollTrigger: {
        trigger: '#about-stage',
        start: 'top 80%',
        end: 'bottom 50%',
        scrub: 1,
      },
      scale: 1.05,
      ease: 'none',
    }
  );
}

// ==========================================================================
// 10. STATISTICS BLUR-TO-SHARP COUNTER ANIMATION
// ==========================================================================
const statNumbers = document.querySelectorAll('.counter-value');
statNumbers.forEach((el) => {
  const target = parseInt(el.getAttribute('data-target'), 10);
  
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      el.classList.add('revealed');
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.floor(obj.val).toLocaleString();
        }
      });
    }
  });
});

// ==========================================================================
// 11. PROGRAMS SECTION: STACKED CARDS SPREAD & 3D MOUSE TILT
// ==========================================================================
const programCards = document.querySelectorAll('.programs-stack .program-card');

programCards.forEach((card, i) => {
  gsap.fromTo(card, 
    { y: 80, opacity: 0.6, scale: 0.95 },
    {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        end: 'top 45%',
        scrub: 0.5,
      },
      y: 0,
      opacity: 1,
      scale: 1,
      ease: 'power2.out',
    }
  );
});

// 3D Tilt for interactive cards
document.querySelectorAll('.tilt-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -7;
    const rotY = ((x - centerX) / centerX) * 7;

    gsap.to(card, {
      rotateX: rotX,
      rotateY: rotY,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.4)',
    });
  });
});

// ==========================================================================
// 12. FULLSCREEN PINNED SECTION ("DISCIPLINE CREATES FREEDOM.")
// ==========================================================================
const cinematicSection = document.getElementById('cinematic-quote');
const cinematicImg = document.getElementById('cinematic-img');

if (cinematicSection && cinematicImg) {
  gsap.to(cinematicImg, {
    scrollTrigger: {
      trigger: cinematicSection,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
    scale: 1.25,
    y: 80,
    ease: 'none',
  });
}

// ==========================================================================
// 13. HORIZONTAL SCROLL EXPERIENCE (PINNED HORIZONTAL SCROLL)
// ==========================================================================
const horizontalTrack = document.getElementById('horizontal-track');
const horizontalWrapper = document.getElementById('horizontal-wrapper');

if (horizontalTrack && horizontalWrapper) {
  function getScrollAmount() {
    return -(horizontalTrack.scrollWidth - window.innerWidth + (window.innerWidth < 768 ? 40 : 120));
  }

  const tween = gsap.to(horizontalTrack, {
    x: getScrollAmount,
    ease: 'none',
  });

  ScrollTrigger.create({
    trigger: '#horizontal-wrapper',
    start: 'top top',
    end: () => `+=${horizontalTrack.scrollWidth - window.innerWidth + 600}`,
    pin: true,
    animation: tween,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });

  // Parallax on images inside horizontal cards
  document.querySelectorAll('.h-img').forEach((img) => {
    gsap.to(img, {
      xPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#horizontal-wrapper',
        start: 'top top',
        end: () => `+=${horizontalTrack.scrollWidth - window.innerWidth + 600}`,
        scrub: 1,
      }
    });
  });
}

// ==========================================================================
// 14. TRAINER SECTION HOVER & INTERACTIVE DOSSIER MODAL
// ==========================================================================
const trainerData = {
  vance: {
    name: 'MARCUS VANCE',
    role: 'HEAD OF BIOMECHANICS & OLYMPIC FORGE',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=1000&auto=format&fit=crop',
    bio: 'Former Olympic weightlifting coach with 14 years refining neuromuscular recruitment. Marcus applies clinical biomechanics to eliminate mechanical leaks and build bone-dense structural power.',
    specs: [
      'Senior Olympic Biomechanics Master Coach',
      'MSc Clinical Biomechanics, Imperial College London',
      'Supervised 14 National & International Power Records'
    ]
  },
  rostova: {
    name: 'ELENA ROSTOVA',
    role: 'DIRECTOR OF COMBAT & METABOLIC PEAK',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1000&auto=format&fit=crop',
    bio: 'Former world kickboxing contender and tactical endurance adviser. Elena specializes in lactate buffering, explosive deceleration mechanics, and mental fortitude under maximal fatigue.',
    specs: [
      'World Combat Games Silver Medalist',
      'Tactical Conditioning Consultant to Elite Response Units',
      'Master of High-Threshold Glycolytic Conditioning'
    ]
  },
  thorne: {
    name: 'KAELEN THORNE',
    role: 'DIRECTOR OF ATHLETIC DEVELOPMENT',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    bio: 'Specialist in rotational torque transfer, sprint mechanics, and connective tendon stiffness. Kaelen architects athletes who move like predators across all kinematic planes.',
    specs: [
      'Ex-Premier League Performance Director',
      'Certified Strength & Conditioning Specialist (CSCS*D)',
      'Creator of the Multi-Planar Reactive Shock Protocol'
    ]
  },
  sterling: {
    name: 'DAVID STERLING',
    role: 'DIRECTOR OF NEUROMUSCULAR RECOVERY',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
    bio: 'Pioneer of neuro-fascial restoration, contrast thermal hydrotherapy, and biomarker telemetry. David guarantees that your systemic recovery outpaces your most brutal training sessions.',
    specs: [
      'Doctor of Physical Therapy (DPT)',
      'Sub-Zero Cryotherapy & Hypobaric Recovery Fellow',
      'Biomarker Consultant to Fortune 50 Founders'
    ]
  }
};

const trainerModal = document.getElementById('trainer-modal');
const tModalClose = document.getElementById('trainer-modal-close');
const tModalImg = document.getElementById('t-modal-img');
const tModalName = document.getElementById('t-modal-name');
const tModalRole = document.getElementById('t-modal-role');
const tModalBio = document.getElementById('t-modal-bio');
const tModalSpecs = document.getElementById('t-modal-specs');
const tModalBookBtn = document.getElementById('t-modal-book-btn');

document.querySelectorAll('.trainer-card').forEach((card) => {
  card.addEventListener('click', () => {
    const key = card.getAttribute('data-trainer');
    const data = trainerData[key];
    if (!data) return;

    if (tModalImg) tModalImg.src = data.image;
    if (tModalName) tModalName.textContent = data.name;
    if (tModalRole) tModalRole.textContent = data.role;
    if (tModalBio) tModalBio.textContent = data.bio;
    if (tModalSpecs) {
      tModalSpecs.innerHTML = data.specs.map((item) => `<li>${item}</li>`).join('');
    }

    trainerModal.classList.add('open');
  });
});

if (tModalClose && trainerModal) {
  tModalClose.addEventListener('click', () => trainerModal.classList.remove('open'));
  trainerModal.addEventListener('click', (e) => {
    if (e.target === trainerModal) trainerModal.classList.remove('open');
  });
}

// ==========================================================================
// 15. BEFORE / AFTER TRANSFORMATION COMPARISON SLIDER
// ==========================================================================
const baContainer = document.getElementById('ba-container');
const baAfterLayer = document.getElementById('ba-after-layer');
const baHandle = document.getElementById('ba-handle');
const baPercent = document.getElementById('ba-percent');

if (baContainer && baAfterLayer && baHandle) {
  let isDragging = false;

  function updateSlider(clientX) {
    const rect = baContainer.getBoundingClientRect();
    let posX = clientX - rect.left;
    posX = Math.max(0, Math.min(posX, rect.width));
    const percentage = (posX / rect.width) * 100;

    baAfterLayer.style.width = `${percentage}%`;
    baHandle.style.left = `${percentage}%`;
    if (baPercent) baPercent.textContent = `${Math.round(percentage)}%`;
  }

  baContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSlider(e.clientX);
    soundManager.playClick(1100);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Support
  baContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSlider(e.touches[0].clientX);
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    updateSlider(e.touches[0].clientX);
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// ==========================================================================
// 16. MEMBERSHIP BILLING SWITCH & PRICE UPDATE
// ==========================================================================
const billingToggle = document.getElementById('billing-toggle');
const labelMonthly = document.getElementById('label-monthly');
const labelAnnual = document.getElementById('label-annual');
const priceAmounts = document.querySelectorAll('.price-amount-box .amount');

if (billingToggle) {
  let isAnnual = false;

  billingToggle.addEventListener('click', () => {
    isAnnual = !isAnnual;
    billingToggle.classList.toggle('annual', isAnnual);
    labelMonthly.classList.toggle('active', !isAnnual);
    labelAnnual.classList.toggle('active', isAnnual);

    priceAmounts.forEach((el) => {
      const targetVal = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
      gsap.to(el, {
        scale: 0.8,
        opacity: 0.3,
        duration: 0.2,
        onComplete: () => {
          el.textContent = targetVal;
          gsap.to(el, { scale: 1, opacity: 1, duration: 0.3 });
        }
      });
    });
  });
}

// ==========================================================================
// 17. TESTIMONIALS SLIDER
// ==========================================================================
const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.testi-dots .dot');
const prevBtn = document.getElementById('testi-prev');
const nextBtn = document.getElementById('testi-next');
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((s, idx) => {
    s.classList.toggle('active', idx === index);
  });
  dots.forEach((d, idx) => {
    d.classList.toggle('active', idx === index);
  });
  currentSlide = index;
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    const nextIdx = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(nextIdx);
  });

  nextBtn.addEventListener('click', () => {
    const nextIdx = (currentSlide + 1) % slides.length;
    showSlide(nextIdx);
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(idx);
    });
  });
}

// ==========================================================================
// 18. FINAL DRAMATIC SECTION SCROLL ZOOM
// ==========================================================================
const finalImg = document.getElementById('final-img');
const finalHeading = document.getElementById('final-heading');

if (finalImg && finalHeading) {
  gsap.to(finalImg, {
    scrollTrigger: {
      trigger: '#final-cta',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: 1,
    },
    scale: 1,
    filter: 'contrast(125%) brightness(45%)',
    ease: 'none',
  });

  gsap.fromTo(finalHeading,
    { scale: 0.88, opacity: 0.7 },
    {
      scrollTrigger: {
        trigger: '#final-cta',
        start: 'top 70%',
        end: 'bottom 85%',
        scrub: 1,
      },
      scale: 1.05,
      opacity: 1,
      ease: 'power2.out',
    }
  );
}

// ==========================================================================
// 19. CONCIERGE APPLICATION MODAL
// ==========================================================================
const appModal = document.getElementById('app-modal');
const modalClose = document.getElementById('modal-close');
const applyButtons = document.querySelectorAll('.btn-apply, #btn-inquire-nav, #btn-inquire-mobile');
const appTierSelect = document.getElementById('applicant-tier');
const appForm = document.getElementById('application-form');
const modalFormView = document.getElementById('modal-form-view');
const modalSuccessView = document.getElementById('modal-success-view');
const btnSuccessClose = document.getElementById('btn-success-close');

applyButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tier = btn.getAttribute('data-tier');
    if (tier && appTierSelect) {
      for (let i = 0; i < appTierSelect.options.length; i++) {
        if (appTierSelect.options[i].value.toLowerCase().includes(tier.toLowerCase())) {
          appTierSelect.selectedIndex = i;
          break;
        }
      }
    }
    if (trainerModal) trainerModal.classList.remove('open');
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (appModal) appModal.classList.add('open');
  });
});

if (modalClose && appModal) {
  modalClose.addEventListener('click', () => appModal.classList.remove('open'));
  appModal.addEventListener('click', (e) => {
    if (e.target === appModal) appModal.classList.remove('open');
  });
}

if (appForm) {
  appForm.addEventListener('submit', (e) => {
    e.preventDefault();
    soundManager.playImpact();
    if (modalFormView) modalFormView.style.display = 'none';
    if (modalSuccessView) modalSuccessView.style.display = 'block';
  });
}

if (btnSuccessClose && appModal) {
  btnSuccessClose.addEventListener('click', () => {
    appModal.classList.remove('open');
    setTimeout(() => {
      if (modalFormView) modalFormView.style.display = 'block';
      if (modalSuccessView) modalSuccessView.style.display = 'none';
      if (appForm) appForm.reset();
    }, 500);
  });
}

// Back to top smooth scroll
const btnBackTop = document.getElementById('btn-back-top');
if (btnBackTop) {
  btnBackTop.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 1.5 });
  });
}

// Smooth scroll for nav anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      lenis.scrollTo(targetEl, { offset: -60, duration: 1.4 });
    }
  });
});
