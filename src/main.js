import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

document.documentElement.classList.add('js')
gsap.registerPlugin(ScrollTrigger)

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

const WA = '919645774936'
const EMAIL = 'adithkp03@gmail.com'

/* ---------- smooth scroll ---------- */
let lenis = null
if (!reduce) {
  lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(t => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrollToTarget = (target, immediate) => {
  const el = typeof target === 'string' ? $(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: target === '#top' ? 0 : -60, duration: immediate ? 0 : 1.4 })
  else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href')
  if (id.length < 2) return
  e.preventDefault()
  closeMenu()
  setTimeout(() => scrollToTarget(id), menuOpen ? 350 : 0)
  history.replaceState(null, '', id)
})

/* ---------- nav + menu ---------- */
const nav = $('#nav'), toggle = $('#nav-toggle'), menu = $('#menu')
let menuOpen = false
function openMenu() {
  menuOpen = true; menu.hidden = false
  requestAnimationFrame(() => menu.classList.add('open'))
  toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Close menu')
  document.body.classList.add('locked'); lenis && lenis.stop()
}
function closeMenu() {
  if (!menuOpen) return
  menuOpen = false; menu.classList.remove('open')
  toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu')
  document.body.classList.remove('locked'); lenis && lenis.start()
  setTimeout(() => { if (!menuOpen) menu.hidden = true }, 700)
}
toggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()))
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu() })
window.matchMedia('(min-width:821px)').addEventListener('change', e => e.matches && closeMenu())

let lastY = 0
const onScrollNav = y => {
  nav.classList.toggle('scrolled', y > 40)
  nav.classList.toggle('hide', y > lastY && y > 500 && !menuOpen)
  lastY = y
}
if (lenis) lenis.on('scroll', ({ scroll }) => onScrollNav(scroll))
else window.addEventListener('scroll', () => onScrollNav(window.scrollY), { passive: true })

/* ---------- cursor ---------- */
if (fine) {
  const c = $('.cursor'), dot = $('.cursor-dot'), ring = $('.cursor-ring')
  const xd = gsap.quickSetter(dot, 'x', 'px'), yd = gsap.quickSetter(dot, 'y', 'px')
  const xr = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power3' }), yr = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power3' })
  c.classList.add('is-hidden')
  window.addEventListener('mousemove', e => { c.classList.remove('is-hidden'); xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY) })
  document.addEventListener('mouseleave', () => c.classList.add('is-hidden'))
  document.addEventListener('mouseover', e => c.classList.toggle('is-link', !!e.target.closest('a,button,input,select,textarea,.member,.g-item')))
}

/* ---------- magnetic buttons ---------- */
if (fine && !reduce) {
  $$('[data-magnet]').forEach(b => {
    const mx = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), my = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' })
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .28); my((e.clientY - r.top - r.height / 2) * .35) })
    b.addEventListener('mouseleave', () => { mx(0); my(0) })
  })
}

/* ---------- loader + hero intro ---------- */
const loader = $('#loader')
const heroWords = $$('.hero-title .word')
if (!reduce) gsap.set(heroWords, { yPercent: 115 })
function heroIn() {
  gsap.to(heroWords, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .07, delay: .1 })
  gsap.from('.eyebrow', { opacity: 0, y: 20, duration: .9, ease: 'power3.out', delay: .2 })
  gsap.from('.hero-sub,.hero-cta', { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: .12, delay: .75 })
  gsap.from('.hero-foot', { opacity: 0, duration: 1, delay: 1.1 })
  gsap.from('.hero-ring', { opacity: 0, scale: .9, duration: 2, ease: 'power2.out', delay: .2 })
}
let introDone = false
function finishLoader() {
  if (introDone) return
  introDone = true
  if (reduce) { loader.remove(); lenis && lenis.start(); return }
  gsap.timeline({ onComplete: () => { loader.remove(); lenis && lenis.start(); ScrollTrigger.refresh() } })
    .to('.loader-inner', { opacity: 0, y: -20, duration: .5, ease: 'power2.in' })
    .to('.loader-curtain.l', { xPercent: -101, duration: 1, ease: 'expo.inOut' }, '>-.05')
    .to('.loader-curtain.r', { xPercent: 101, duration: 1, ease: 'expo.inOut' }, '<')
    .add(heroIn, '-=.55')
}
if (reduce) { finishLoader() } else {
  lenis && lenis.stop()
  const num = $('#loader-num'), fill = $('#loader-fill')
  const state = { p: 0 }
  const heroImg = $('.hero-bg img')
  const imgReady = new Promise(res => (heroImg.complete ? res() : (heroImg.onload = heroImg.onerror = res)))
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve()
  let ready = false
  Promise.all([imgReady, fontsReady]).then(() => (ready = true))
  gsap.to(state, {
    p: 100, duration: 1.8, ease: 'power1.inOut',
    onUpdate() {
      const v = ready ? state.p : Math.min(state.p, 88)
      num.textContent = Math.round(v); fill.style.width = v + '%'
    },
    onComplete() {
      const wait = setInterval(() => { if (ready) { clearInterval(wait); num.textContent = '100'; fill.style.width = '100%'; setTimeout(finishLoader, 250) } }, 60)
    }
  })
  setTimeout(finishLoader, 6000) // failsafe
}

/* ---------- hero parallax ---------- */
if (!reduce) {
  gsap.to('.hero-bg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
  gsap.to('.hero-content', { yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true } })
}

/* ---------- marquee ---------- */
$$('.marquee-row').forEach(row => {
  const track = $('.marquee-track', row)
  row.appendChild(track.cloneNode(true))
  const dir = Number(row.dataset.dir)
  const w = () => track.getBoundingClientRect().width
  let x = dir < 0 ? 0 : -w()
  let speed = 60
  const tracks = $$('.marquee-track', row)
  let vel = 0
  if (lenis) lenis.on('scroll', ({ velocity }) => (vel = velocity))
  gsap.ticker.add((t, dt) => {
    const s = (speed + Math.min(Math.abs(vel), 40) * 12) * (dt / 1000)
    x += dir * s
    const W = w()
    if (dir < 0 && x <= -W) x += W
    if (dir > 0 && x >= 0) x -= W
    tracks.forEach(el => (el.style.transform = `translate3d(${x}px,0,0)`))
  })
  if (reduce) speed = 0
})

/* ---------- about ---------- */
const big = $('#about-big')
if (big) {
  const text = big.textContent.trim()
  big.setAttribute('aria-label', text)
  big.textContent = ''
  text.split(' ').forEach((w, i, arr) => {
    const s = document.createElement('span'); s.className = 'w'; s.textContent = w; s.setAttribute('aria-hidden', 'true')
    big.appendChild(s); if (i < arr.length - 1) big.appendChild(document.createTextNode(' '))
  })
  const words = $$('.w', big)
  if (reduce) words.forEach(w => w.classList.add('on'))
  else ScrollTrigger.create({
    trigger: big, start: 'top 82%', end: 'bottom 45%', scrub: true,
    onUpdate: self => { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)) }
  })
}
$$('[data-count]').forEach(el => {
  const end = Number(el.dataset.count), pad = Number(el.dataset.pad || 0)
  const fmt = v => String(Math.round(v)).padStart(pad, '0')
  if (reduce) return
  const o = { v: end > 100 ? end - 40 : 0 }
  el.textContent = fmt(o.v)
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) }) })
})

/* ---------- reveals ---------- */
if (!reduce) {
  gsap.utils.toArray('.label,.h2,.book-title,.about-copy,.stat,.about-photo,.wed-points,.wed-copy .btn,.phone,.wed-cap,.form .field,.form-actions,.contact .c-row,.footer-logo').forEach(el => el.classList.add('rv'))
  ScrollTrigger.batch('.rv', {
    start: 'top 90%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09, overwrite: true })
  })
  ScrollTrigger.batch('.member', {
    start: 'top 92%', once: true,
    onEnter: b => gsap.fromTo(b, { opacity: 0, y: 70, clipPath: 'inset(12% 0 0 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power3.out', stagger: .12 })
  })
  gsap.set('.member', { opacity: 0 })
}

/* ---------- gallery pin ---------- */
const mm = gsap.matchMedia()
mm.add('(min-width:901px)', () => {
  if (reduce) return
  const track = $('#gallery-track'), pin = $('.gallery-pin')
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
  const tween = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: pin, start: 'center center', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 }
  })
  gsap.utils.toArray('.g-item img').forEach(img => {
    gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
  })
})

/* ---------- member tilt ---------- */
if (fine && !reduce) {
  $$('.member').forEach(card => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3' })
    gsap.set(card, { transformPerspective: 900 })
    card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 8); rx(-((e.clientY - r.top) / r.height - .5) * 8) })
    card.addEventListener('mouseleave', () => { rx(0); ry(0) })
  })
}

/* ---------- wedding video ---------- */
const vid = $('#wed-video')
if (vid) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { vid.preload = 'auto'; const p = vid.play(); p && p.catch(() => {}) } else vid.pause()
    })
  }, { threshold: .35 })
  io.observe(vid)
}

/* ---------- booking form ---------- */
const form = $('#form'), note = $('#form-note')
const dateEl = $('#f-date')
const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
dateEl.min = today.toISOString().slice(0, 10)
const fields = { name: $('#f-name'), event: $('#f-event'), city: $('#f-city') }
const errs = { name: 'Tell us your name.', event: 'Pick an event type.', city: 'Add the city or venue.' }
function validate() {
  let ok = true
  Object.entries(fields).forEach(([k, el]) => {
    const bad = !el.value.trim()
    el.closest('.field').classList.toggle('invalid', bad)
    $('#e-' + k).textContent = bad ? errs[k] : ''
    el.setAttribute('aria-invalid', String(bad))
    if (bad) ok = false
  })
  if (!ok) { const first = Object.values(fields).find(el => !el.value.trim()); first && first.focus() }
  return ok
}
Object.values(fields).forEach(el => el.addEventListener('input', () => { if (el.value.trim()) { el.closest('.field').classList.remove('invalid'); $('#e-' + el.name).textContent = ''; el.setAttribute('aria-invalid', 'false') } }))
function summary() {
  const d = dateEl.value ? new Date(dateEl.value + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'not fixed yet'
  const lines = [
    'Hi Minerva! I would like to enquire about a booking.',
    `Name: ${fields.name.value.trim()}`,
    `Event: ${fields.event.value}`,
    `Date: ${d}`,
    `City / venue: ${fields.city.value.trim()}`
  ]
  const n = $('#f-note').value.trim(); if (n) lines.push(`Notes: ${n}`)
  return lines.join('\n')
}
form.addEventListener('submit', e => {
  e.preventDefault()
  if (!validate()) { note.classList.remove('ok'); note.textContent = 'A few details are missing above.'; return }
  const url = `https://wa.me/${WA}?text=${encodeURIComponent(summary())}`
  const w = window.open(url, '_blank', 'noopener')
  note.classList.add('ok')
  note.innerHTML = w ? 'WhatsApp opened with your details. Tap send there and we will get back to you.' : `Tap to continue on WhatsApp: <a href="${url}" target="_blank" rel="noopener" style="text-decoration:underline">open WhatsApp</a>`
})
$('#mail-btn').addEventListener('click', () => {
  if (!validate()) { note.classList.remove('ok'); note.textContent = 'A few details are missing above.'; return }
  const href = `mailto:${EMAIL}?subject=${encodeURIComponent('Booking enquiry: ' + fields.event.value)}&body=${encodeURIComponent(summary())}`
  window.location.href = href
  note.classList.add('ok'); note.textContent = 'Your email app should open with the details filled in.'
})

window.addEventListener('load', () => ScrollTrigger.refresh())
