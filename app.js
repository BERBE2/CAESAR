document.addEventListener('DOMContentLoaded', () => {
    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('Service worker registered.');

                // --- NEW: Check for updates immediately after registration ---
                reg.addEventListener('updatefound', () => {
                    console.log('New service worker found.');
                    const installingWorker = reg.installing;
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // A new service worker is installed and waiting to activate
                            console.log('New content is available; please refresh.');
                            app.showUpdateNotification();
                        }
                    });
                });

                // --- NEW: Manually check for updates every hour ---
                setInterval(() => {
                    reg.update();
                }, 60 * 60 * 1000); // 60 minutes
            })
            .catch(err => console.error('Service worker registration failed:', err));
    }

    // --- APP STATE & DATA ---
    let deferredPrompt; // Variable to store the install event

    const appState = {
        currentGalleryFilter: 'all',
        isMobileMenuOpen: false
    };

    const appData = {
        phoneNumber: "9647769592080",
        galleryItems: [
            { id: 1, category: 'men', title: 'بدلة كلاسيكية', desc: 'اكتشف أرقى مستويات الجودة والأناقة مع هذه الدشداشة الكلاسيكية العصرية! هل تبحث عن إطلالة تجمع بين الرسمية الراقية والراحة الفائقة؟ إليك الثوب الذي سيعكس ذوقك الرفيع في كل خطوة.', price: 'يبدأ من 45,000 د.ع', img: 'دشداشة.webp' },
            { id: 6, category: 'men', title: ' تألق بلا حدود: بنطلون الأناقة والراحة الفائقة', desc: 'هل تبحث عن القطعة التي تجمع بين الرقي الكلاسيكي والراحة العصرية؟ نقدم لك هذا البنطلون بتصميمه المتقن، الخيار الأمثل لإطلالة مميزة في جميع مناسباتك، من اجتماعات العمل الرسمية إلى الفعاليات الاجتماعية الأنيقة. القصة الراقية: يتميز بقصة مريحة ومنسدلة تضمن لك حرية الحركة طوال اليوم، مع الحفاظ على مظهر مصقول وجذاب.ثنيات (Pleats) أمامية: تُضفي الثنيات الأنيقة على الجزء الأمامي لمسة من الفخامة الكلاسيكية وتوفر مساحة إضافية لتناسب مثالي ومريح.', price: 'يبدأ من 25,000 د.ع', img: 'بنطلون.avif' },
            { id: 2, category: 'men', title: 'قميص رجالي', desc: 'قميص قطني ناعم بتفاصيل يدوية في الأزرار والأكمام، يناسب المناسبات الرسمية وغير الرسمية.', price: 'يبدأ من 25,000 د.ع', img: 'قميص.webp' },
            { id: 3, category: 'women', title: 'دشداشة عود الملكي', desc: 'دشداشة ملكية فصال عود الملكي تتميز بمظهر جميل واناقة مع اضافة الدانتيل في الصدر والازار تضيف طابع جميل جدا', price: 'يبدأ من 35,000 د.ع', img: 'Gemini_Generated_Image_wrmtviwrmtviwrmt.png' },
            { id: 4, category: 'women', title: 'معطف شتوي', desc: 'يتميز المعطف بقصة مُحكمة ومُفصلة تبرز الأناقة، مع ياقة عالية واقفة (ماندارين أو ياقة عسكرية الأزرار: السمة الأبرز هي الأزرار الكبيرة واللامعة باللون الذهبي (أو النحاسي)، والتي تنتشر بشكل لافت على طول المقدمة وعلى أطراف الأكمام، مما يضفي لمسة كلاسيكية وراقية أو مستوحاة من الزي العسكري الأنيق.', price: 'يبدأ من 50,000 د.ع', img: '07d8be644f8134dfd48452639af48d4a.jpg' },
            { id: 5, category: 'women', title: 'اللباس الهندي الشرقي', desc: 'اللباس الأساسي (القُميص/الكورتي): هو قُميص طويل، يصل طوله إلى ما بعد الركبتين، أو ما يُعرف محليًا بـ "الدشداشة" أو "الزي الهندي" (الكورتي). الإطلالة العامة: الإطلالة تجمع بين الطابع الشرقي/الهندي التقليدي من حيث الشكل والزخرفة، وبين اللمسة العصرية والكاجوال من خلال إضافة البنطلون الأسود.', price: 'يبدأ من 35,000 د.ع', img: 'هندي.png' }
        ]
    };

    // --- DOM ELEMENTS ---
    const appRoot = document.getElementById('app');

    // --- COMPONENTS (Functions that return HTML strings) ---
    const HeaderComponent = () => `
        <header id="main-header" class="main-header">
            <div class="container">
                <div class="logo">
                    <i class="fas fa-crown"></i>
                    خياطة القيصر
                </div>
                <nav class="main-nav" id="main-nav" style="display: ${appState.isMobileMenuOpen ? 'flex' : 'none'}">
                    <ul>
                        <li><a href="#hero" onclick="app.navigate('hero')">الرئيسية</a></li>
                        <li><a href="#main-services" onclick="app.navigate('main-services')">الأقسام</a></li>
                        <li><a href="#about" onclick="app.navigate('about')">من نحن</a></li>
                        <li><a href="#gallery" onclick="app.showAllGallery(); app.navigate('gallery');">أعمالنا</a></li>
                        <li><a href="#contact" onclick="app.navigate('contact')">تواصل معنا</a></li>
                    </ul>
                </nav>
                <!-- Install Button -->
                <button id="install-button" class="install-btn" style="display: none;">
                    <i class="fas fa-download"></i>
                    <span>ثبّت التطبيق</span>
                </button>
                <!-- Mobile Menu Toggle -->
                <div class="menu-toggle" id="mobile-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </header>
    `;

    const HeroSection = () => `
        <section id="hero">
            <h1>خياطة القيصر</h1>
            <p class="tagline">إتقانٌ يرتديه الملوك</p>
            <a href="#contact" class="btn" onclick="app.navigate('contact')">اطلب استشارتك الآن</a>
        </section>
    `;

    const MainServicesSection = () => `
        <section id="main-services">
            <div class="container">
                <h2>اختر عالم الأناقة الذي يناسبك</h2>
                <div class="services-container">
                    <div class="service-box" onclick="app.showGallery('men')">
                        <img src="a5f8f7d2-ee95-42bb-9051-5f9cdc3aa505.webp" alt="خياطة رجالية">
                        <div class="overlay">
                            <h3>رجالي</h3>
                            <p>أناقة البدلات الكلاسيكية والقمصان المخصصة بلمسة عصرية</p>
                            <a href="#gallery" class="btn" onclick="app.navigate('gallery')">تصفح المعرض</a>
                        </div>
                    </div>
                    <div class="service-box" onclick="app.showGallery('women')">
                        <img src="خياطة نسائية وعرض الأزياء.png" alt="خياطة نسائية">
                        <div class="overlay">
                            <h3>نسائي</h3>
                            <p>فخامة فساتين السهرة والتصاميم الفريدة التي تليق بك</p>
                            <a href="#gallery" class="btn" onclick="app.navigate('gallery')">تصفح المعرض</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

    const AboutSection = () => `
        <section id="about">
            <div class="container">
                <img src="كارت.png" alt="صورة داخل المحل">
                <div class="about-content">
                    <h2>من نحن</h2>
                    <p>في "خياطة القيصر"، نؤمن أن الأناقة ليست مجرد ملابس، بل هي تعبير عن الهوية والذوق الرفيع. نحن نحول القماش إلى فن، والأفكار إلى واقع ملموس بفضل خبرة تمتد لسنوات وعيون لا ترى إلا التفاصيل الدقيقة.</p>
                    <p>نستخدم أجود الأقمشة المستوردة وأحدث تقنيات الخياطة لضمان أن تخرج كل قطعة من ورشتنا تحمل بصمة الجودة والفخامة التي تليق باسم "القيصر".</p>
                </div>
            </div>
        </section>
    `;

    const GallerySection = () => {
        const itemsToRender = appState.currentGalleryFilter === 'all'
            ? appData.galleryItems
            : appData.galleryItems.filter(item => item.category === appState.currentGalleryFilter);

        const galleryItemsHtml = itemsToRender.map(item => `
            <div class="gallery-item" data-id="${item.id}" onclick="app.openModal(${item.id})">
                <img src="${item.img}" alt="${item.title}">
            </div>
        `).join('');

        return `
            <section id="gallery">
                <div class="container">
                    <h2>أعمالنا تتحدث عنا</h2>
                    <div class="gallery-grid" id="gallery-grid">
                        ${galleryItemsHtml}
                    </div>
                </div>
            </section>
        `;
    };

    const ContactSection = () => `
        <section id="contact">
            <div class="container">
                <h2>تواصل معنا مباشرة عبر واتساب</h2>
                <div class="contact-wrapper">
                    <div class="contact-info">
                        <h3>معلومات المتجر</h3>
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>فرع الاندلس، المجاور لمودا مول</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>أوقات العمل: من 10 صباحاً حتى 10 مساءً</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-phone"></i>
                            <span>07769592080</span>
                        </div>
                        <div class="map-container">
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d803.0468724701796!2d43.133877730348026!3d36.38045499827311!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4007eacd750669cf%3A0xcee5c3a087261868!2z2KfZhNin2YbYr9mE2LPYjCDYp9mE2YXZiNi12YTYjCDZhtmK2YbZiNmJINmF2K3Yp9mB2LjYqQ!5e0!3m2!1sar!2siq!4v1763512891444!5m2!1sar!2siq" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                        </div>
                    </div>
                    <div class="contact-form">
                        <h3>أرسل لنا رسالة فورية</h3>
                        <form id="whatsapp-form" onsubmit="app.handleWhatsAppSubmit(event)">
                            <div class="form-group">
                                <input type="text" id="name" name="name" placeholder="الاسم الكامل" required>
                            </div>
                            <div class="form-group">
                                <input type="tel" id="phone" name="phone" placeholder="رقم هاتفك" required>
                            </div>
                            <div class="form-group">
                                <textarea id="message" name="message" placeholder="اكتب رسالتك أو طلبك هنا..." required></textarea>
                            </div>
                            <button type="submit" class="btn">
                                <i class="fab fa-whatsapp"></i> إرسال عبر واتساب
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    `;

    const ModalComponent = (item) => `
        <div id="imageModal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="app.closeModal()">&times;</span>
                <div class="modal-image-container">
                    <img src="${item.img}" alt="${item.title}">
                </div>
                <div class="modal-details">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                    <p class="price">${item.price}</p>
                    <a href="#contact" class="btn" onclick="app.closeModal(); app.navigate('contact');">اطلب تصميمك الآن</a>
                </div>
            </div>
        </div>
    `;

    const FooterComponent = () => `
        <footer id="main-footer" class="main-footer">
            <div class="container">
                <div class="social-icons">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-tiktok"></i></a>
                </div>
                <p>&copy; 2025 خياطة القيصر. جميع الحقوق محفوظة. صُمم بفخر في العراق.</p>
            </div>
        </footer>
    `;

    // --- APP LOGIC & RENDERING ---
    const app = {
        render() {
            appRoot.innerHTML = `
                ${HeaderComponent()}
                <main>
                    ${HeroSection()}
                    ${MainServicesSection()}
                    ${AboutSection()}
                    ${GallerySection()}
                    ${ContactSection()}
                </main>
                ${FooterComponent()}
            `;
            this.attachEventListeners();
            this.setupInstallButton();
        },

        attachEventListeners() {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.addEventListener('click', () => {
                    appState.isMobileMenuOpen = !appState.isMobileMenuOpen;
                    this.render();
                });
            }
        },

        setupInstallButton() {
            const installButton = document.getElementById('install-button');
            if (!installButton) return;

            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                installButton.style.display = 'inline-flex';
            });

            installButton.addEventListener('click', () => {
                installButton.style.display = 'none';
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                });
            });

            window.addEventListener('appinstalled', () => {
                installButton.style.display = 'none';
                console.log('PWA was installed');
                this.showInstallSuccessMessage();
            });
        },

        showInstallSuccessMessage() {
            const successMessage = document.createElement('div');
            successMessage.style.position = 'fixed';
            successMessage.style.bottom = '20px';
            successMessage.style.left = '50%';
            successMessage.style.transform = 'translateX(-50%)';
            successMessage.style.backgroundColor = 'var(--primary-color)';
            successMessage.style.color = 'var(--secondary-color)';
            successMessage.style.padding = '1rem 1.5rem';
            successMessage.style.borderRadius = '50px';
            successMessage.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            successMessage.style.zIndex = '3000';
            successMessage.style.fontWeight = '700';
            successMessage.style.fontSize = '1rem';
            successMessage.style.transition = 'opacity 0.5s ease-in-out';
            successMessage.textContent = 'شكراً لك! تم تثبيت التطبيق بنجاح.';

            document.body.appendChild(successMessage);

            setTimeout(() => {
                successMessage.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(successMessage)) {
                        document.body.removeChild(successMessage);
                    }
                }, 500);
            }, 3000);
        },

        // --- NEW: Function to show update notification ---
        showUpdateNotification() {
            const updateNotification = document.createElement('div');
            updateNotification.id = 'update-notification';
            updateNotification.style.position = 'fixed';
            updateNotification.style.bottom = '20px';
            updateNotification.style.left = '50%';
            updateNotification.style.transform = 'translateX(-50%)';
            updateNotification.style.backgroundColor = 'var(--secondary-color)';
            updateNotification.style.color = 'var(--light-text)';
            updateNotification.style.padding = '1rem 1.5rem';
            updateNotification.style.borderRadius = '10px';
            updateNotification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
            updateNotification.style.zIndex = '10001'; // Higher than other notifications
            updateNotification.style.display = 'flex';
            updateNotification.style.alignItems = 'center';
            updateNotification.style.gap = '1rem';
            updateNotification.style.fontWeight = '600';
            updateNotification.style.fontSize = '1rem';
            updateNotification.style.transition = 'opacity 0.5s ease-in-out';
            updateNotification.innerHTML = `
                <span>يتوفر تحديث جديد للتطبيق.</span>
                <button class="btn" style="margin: 0; padding: 0.5rem 1rem; font-size: 0.9rem; background-color: var(--primary-color); color: var(--secondary-color);">
                    تحديث الآن
                </button>
            `;

            const updateButton = updateNotification.querySelector('button');
            updateButton.addEventListener('click', () => {
                // Hide notification
                updateNotification.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(updateNotification)) {
                        document.body.removeChild(updateNotification);
                    }
                }, 500);
                // Reload the page to get the new version
                window.location.reload();
            });

            document.body.appendChild(updateNotification);
        },

        navigate(sectionId) {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
            appState.isMobileMenuOpen = false;
            if (window.innerWidth <= 768) {
                this.render();
            }
        },

        showGallery(category) {
            appState.currentGalleryFilter = category;
            this.navigate('gallery');
            this.render();
        },

        showAllGallery() {
            appState.currentGalleryFilter = 'all';
            this.render();
        },

        openModal(itemId) {
            const item = appData.galleryItems.find(i => i.id === itemId);
            if (item) {
                const modalContainer = document.createElement('div');
                modalContainer.id = 'modal-container';
                modalContainer.innerHTML = ModalComponent(item);
                document.body.appendChild(modalContainer);
            }
        },

        closeModal() {
            const modalContainer = document.getElementById('modal-container');
            if (modalContainer) {
                document.body.removeChild(modalContainer);
            }
        },

        handleWhatsAppSubmit(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            const whatsappMessage = `مرحباً، أنا ${name}، رقم هاتفي: ${phone}.%0A%0Aالرسالة: ${message}`;
            const whatsappUrl = `https://wa.me/${appData.phoneNumber}?text=${whatsappMessage}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    // --- INITIAL RENDER ---
    app.render();

    // --- EXPOSE APP FUNCTIONS GLOBALLY FOR INLINE ONCLICK HANDLERS ---
    window.app = app;
});