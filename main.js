document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor Glow ---
    const cursorGlow = document.getElementById('cursor-glow');
    
    let mouseX = 0;
    let mouseY = 0;
    let isCursorMoving = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isCursorMoving) {
            window.requestAnimationFrame(() => {
                cursorGlow.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
                isCursorMoving = false;
            });
            isCursorMoving = true;
        }
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    
    let isNavThrottled = false;
    window.addEventListener('scroll', () => {
        if (!isNavThrottled) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                isNavThrottled = false;
            });
            isNavThrottled = true;
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // --- Scroll Animations (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-scale, .reveal-fade');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // --- Active Link On Scroll ---
    const sections = document.querySelectorAll('section');
    
    let activeLinkTicking = false;
    window.addEventListener('scroll', () => {
        if (!activeLinkTicking) {
            window.requestAnimationFrame(() => {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                        current = section.getAttribute('id');
                    }
                });

                navItems.forEach(li => {
                    li.classList.remove('active');
                    if (current && li.getAttribute('href').includes(current)) {
                        li.classList.add('active');
                    }
                });
                activeLinkTicking = false;
            });
            activeLinkTicking = true;
        }
    });
});
