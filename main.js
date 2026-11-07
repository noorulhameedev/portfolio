// --- Contact form configuration -------------------------------------------
// Web3Forms delivers submissions to hameedevelop@gmail.com. The inbox is bound to
// the access key on web3forms.com, so the key alone decides where mail lands;
// changing it silently redirects every enquiry. If the key is ever removed, the
// form reports a configuration error instead of sending.
// displayEmail is the address visitors see in the Contact section and mailto links.
const SITE_CONFIG = {
    web3FormsAccessKey: '65209b08-eb1b-4e75-80c9-a135cb381ec4',
    displayEmail: 'noorulhameed@outlook.in',
    fromName: 'New Enquiry'
};

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

document.addEventListener('DOMContentLoaded', () => {

    // --- Project previews ---
    document.querySelectorAll('.project-media').forEach(media => {
        const img = media.querySelector('.project-img');
        if (!img) return;
        const markMissing = () => media.classList.add('no-image');
        img.addEventListener('error', markMissing, { once: true });
        if (img.complete && img.naturalWidth === 0) markMissing();
    });

    // --- Scroll: navbar, back-to-top, active link ---
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    let scrollTicking = false;

    function onScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);

        backToTop.classList.toggle('show', window.scrollY > 600);

        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= (section.offsetTop - section.clientHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(link => {
            const target = link.getAttribute('href');
            link.classList.toggle('active', Boolean(current) && target === `#${current}`);
        });

        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(onScroll);
            scrollTicking = true;
        }
    });

    onScroll();

    backToTop.addEventListener('click', () => {
        window.scrollTo(0, 0);
    });

    // --- Mobile Menu Toggle ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navOverlay = document.getElementById('nav-overlay');

    function closeMenu() {
        mobileMenu.classList.remove('open');
        navLinks.classList.remove('open');
        navOverlay.classList.remove('show');
        mobileMenu.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function openMenu() {
        mobileMenu.classList.add('open');
        navLinks.classList.add('open');
        navOverlay.classList.add('show');
        mobileMenu.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    mobileMenu.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navOverlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    navItems.forEach(item => item.addEventListener('click', closeMenu));

    // --- Contact form (Web3Forms) ---
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');
    const honeypot = document.getElementById('botcheck');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const successCard = document.getElementById('form-success');
    const successName = document.getElementById('success-name');
    const directEmailLink = document.getElementById('email-direct');
    const directEmailText = document.getElementById('email-direct-text');

    const accessKey = SITE_CONFIG.web3FormsAccessKey.trim();
    const isConfigured = accessKey.length > 0;
    const publicEmail = SITE_CONFIG.displayEmail;

    const statusIcons = {
        info: 'fa-solid fa-circle-notch fa-spin',
        success: 'fa-solid fa-circle-check',
        error: 'fa-solid fa-circle-exclamation'
    };

    // The status line is a flex row (icon + text), so every word has to live in
    // one child or inline links get pushed into their own column.
    function setStatus(kind, text) {
        statusEl.className = kind ? `form-status ${kind}` : 'form-status';
        statusEl.textContent = '';
        if (kind) {
            const icon = document.createElement('i');
            icon.className = statusIcons[kind];
            icon.setAttribute('aria-hidden', 'true');
            statusEl.appendChild(icon);
        }
        const body = document.createElement('span');
        body.className = 'form-status-text';
        body.appendChild(document.createTextNode(text));
        statusEl.appendChild(body);
        return body;
    }

    function setBusy(busy) {
        submitBtn.disabled = busy;
        submitBtn.innerHTML = busy
            ? '<i class="fa-solid fa-paper-plane"></i> Sending…'
            : 'Say Hello <i class="fa-regular fa-paper-plane"></i>';
    }

    directEmailLink.href = `mailto:${publicEmail}`;
    directEmailText.textContent = publicEmail;
    directEmailLink.hidden = false;

    document.querySelectorAll('.footer-email').forEach(link => {
        link.href = `mailto:${publicEmail}`;
        link.setAttribute('aria-label', `Email ${publicEmail}`);
    });

    // Real names span alphabets, so letters are Unicode-aware; digits and
    // punctuation such as @ or / are rejected, separators are not.
    const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} '\u2019-]*$/u;

    function nameProblem(value, label) {
        if (!value) return `Please enter your ${label}.`;
        if (value.length < 2) return `${label[0].toUpperCase() + label.slice(1)} needs at least 2 characters.`;
        if (!NAME_PATTERN.test(value)) return `${label[0].toUpperCase() + label.slice(1)} can use letters, spaces, hyphens and apostrophes only.`;
        return '';
    }

    const validatedFields = [
        {
            input: firstNameInput,
            error: document.getElementById('first-name-error'),
            validate: value => nameProblem(value, 'first name')
        },
        {
            // Optional, so an empty value is valid; rules apply only once typed.
            input: lastNameInput,
            error: document.getElementById('last-name-error'),
            validate: value => value ? nameProblem(value, 'last name') : ''
        },
        {
            input: emailInput,
            error: document.getElementById('email-error'),
            validate(value) {
                if (!value) return 'Please enter your email address.';
                if (/\s/.test(value)) return 'Your email address cannot contain spaces.';
                if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address so I can reply to you.';
                return '';
            }
        },
        {
            input: messageInput,
            error: document.getElementById('message-error'),
            validate(value) {
                if (!value) return 'Please tell me a little about your project.';
                if (value.length < 10) return 'Please add a short message (at least 10 characters).';
                return '';
            }
        }
    ];

    function markField(field, message) {
        const invalid = message !== '';
        field.error.textContent = message;
        field.error.classList.toggle('show', invalid);
        field.input.classList.toggle('is-invalid', invalid);
        field.input.setAttribute('aria-invalid', String(invalid));
    }

    // Trimmed before every check so leading/trailing spaces never count.
    function validateField(field) {
        const message = field.validate(field.input.value.trim());
        markField(field, message);
        return message;
    }

    validatedFields.forEach(field => {
        field.input.addEventListener('blur', () => validateField(field));
        // A flagged field re-checks on each keystroke so the message disappears
        // the moment it is fixed; quiet fields stay quiet until they are blurred.
        field.input.addEventListener('input', () => {
            if (field.input.classList.contains('is-invalid')) validateField(field);
        });
    });

    function firstInvalidField() {
        let firstBad = null;
        validatedFields.forEach(field => {
            if (validateField(field) && !firstBad) firstBad = field;
        });
        return firstBad;
    }

    let isSubmitting = false;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Bots fill the visually hidden field; humans never see it.
        if (honeypot.value.trim() !== '') {
            return;
        }

        // A second click while the request is in flight is ignored; the button is
        // also disabled, so the guard is the backstop.
        if (isSubmitting) {
            return;
        }

        if (!isConfigured) {
            setStatus('error', 'The contact form is not connected yet. Add the Web3Forms access key to SITE_CONFIG.web3FormsAccessKey in main.js.');
            return;
        }

        const invalidField = firstInvalidField();
        if (invalidField) {
            setStatus('error', 'Please check the highlighted fields and try again.');
            invalidField.input.focus();
            return;
        }

        // Web3Forms notifies with a single "name" field, so the two inputs are
        // rejoined here; a missing last name simply drops out of the string.
        const senderName = [firstNameInput.value.trim(), lastNameInput.value.trim()]
            .filter(Boolean)
            .join(' ');
        const senderEmail = emailInput.value.trim();
        const enteredSubject = subjectInput.value.trim();

        const payload = {
            access_key: accessKey,
            name: senderName,
            email: senderEmail,
            subject: enteredSubject || `Portfolio enquiry from ${senderName}`,
            message: messageInput.value.trim(),
            // Replies from the inbox go straight back to the visitor.
            replyto: senderEmail,
            from_name: SITE_CONFIG.fromName
        };

        isSubmitting = true;
        setBusy(true);
        setStatus('info', 'Sending your message…');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(WEB3FORMS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            const result = await response.json().catch(() => ({}));
            const accepted = result.success === true || result.success === 'true';

            if (!response.ok || !accepted) {
                throw new Error(result.message || `Request failed (${response.status})`);
            }

            // Only reached once Web3Forms has accepted the submission.
            successName.textContent = senderName;
            form.hidden = true;
            successCard.hidden = false;
            successCard.focus();
        } catch (error) {
            console.error('Contact form submission failed:', error);
            setStatus('error', error.name === 'AbortError'
                ? 'The request timed out. Please try sending it again.'
                : 'Your message could not be sent. Please check your connection and try again.');
        } finally {
            clearTimeout(timeout);
            isSubmitting = false;
            setBusy(false);
        }
    });

    // --- Footer year ---
    document.getElementById('year').textContent = new Date().getFullYear();
});
