/* =========================================================
   script.js
   - CMD splash (Win95 / MS-DOS) + localStorage + ENTER
   - Typewriter: "Trabajo con: ..." en loop
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // TYPEWRITER (PORTAFOLIO)
    // =========================
    const typingTextEl = document.getElementById("typing-text");
    const typingCursorEl = document.getElementById("typing-cursor");

    // Lista inicial
    const techWheel = [
        "Piero Olivares — Web dev en formación",
        "HTML • CSS • JavaScript",
        "Python • Flask • SQLite",
        "PHP • MySQL • XAMPP",
        "Automatización • Scripts • Herramientas"
    ];

    if (typingTextEl) {
        startTypewriter(typingTextEl, techWheel);
    }

    // Cursor parpadeante
    if (typingCursorEl) {
        setInterval(() => {
            typingCursorEl.style.visibility =
                typingCursorEl.style.visibility === "hidden" ? "visible" : "hidden";
        }, 450);
    }

    // =========================
    // CMD / BOOT SCREEN
    // =========================
    const bootScreen = document.getElementById("boot-screen");
    const bootLog = document.getElementById("boot-log");
    const bootBar = document.getElementById("boot-progress-bar");
    const bootStatus = document.getElementById("boot-status");

    // Si no existe el boot screen, no hacemos nada con el CMD
    if (!bootScreen || !bootLog || !bootBar || !bootStatus) return;

    const STORAGE_KEY = "pierodev_boot_seen";

    // Atajo debug: Ctrl + Shift + R -> reinicia boot
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });

    const seenBoot = localStorage.getItem(STORAGE_KEY) === "1";

    // Si ya se vio una vez, ocultar inmediato
    if (seenBoot) {
        hideBoot();
        return;
    }

    // Si no se ha visto, correr animación y esperar ENTER
    runBootSequence()
        .then(waitForEnter)
        .then(() => {
            localStorage.setItem(STORAGE_KEY, "1");
            hideBoot();
        });

    /* =========================================================
       Helpers CMD
       ========================================================= */

    // Dispara la animación del H2 cuando el boot ya no tapa la pantalla
    function triggerH2Pop() {
        const h2Titulo = document.querySelector("#datos_principales h2");
        if (!h2Titulo) return;

        // Reinicia la animación aunque ya se haya aplicado antes
        h2Titulo.classList.remove("h2-pop-run");
        void h2Titulo.offsetWidth; // fuerza reflow
        h2Titulo.classList.add("h2-pop-run");
    }

    function hideBoot() {
        bootScreen.classList.add("hidden");
        bootScreen.setAttribute("aria-hidden", "true");

        // Espera a que el navegador "pinte" el ocultado del boot y luego anima el h2
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                triggerH2Pop();
            });
        });
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function setProgress(percent) {
        const p = Math.max(0, Math.min(100, percent));
        bootBar.style.width = p + "%";
    }

    async function typeText(targetEl, text, speedMin = 6, speedMax = 16) {
        for (let i = 0; i < text.length; i++) {
            targetEl.textContent += text[i];
            const jitter = Math.floor(Math.random() * (speedMax - speedMin + 1)) + speedMin;
            await sleep(jitter);
        }
    }

    async function printLine(line, delayAfter = 80) {
        await typeText(bootLog, line);
        bootLog.textContent += "\n";
        bootLog.scrollTop = bootLog.scrollHeight;
        await sleep(delayAfter);
    }

    async function dosCommand(cmd, outputLines = [], delayAfterCmd = 120) {
        await printLine(`C:\\PIERODEV>${cmd}`, 40);
        await sleep(delayAfterCmd);
        for (const out of outputLines) {
            await printLine(out, 50);
        }
    }

    async function runBootSequence() {
        bootLog.textContent = "";
        bootStatus.textContent = "";
        setProgress(0);

        await printLine("Microsoft(R) Windows 95");
        await printLine("(C)Copyright Microsoft Corp 1981-1995.");
        await printLine("");

        const steps = [
            { pct: 10, cmd: "ver", out: ["MS-DOS Version 7.0"] },
            { pct: 20, cmd: "mem /c", out: ["Memory status: OK", "Conventional: 640K", "Extended: 64MB"] },
            { pct: 35, cmd: "cd PORTAFOLIO", out: [""] },
            { pct: 50, cmd: "loading modules", out: ["[OK] ui.dll", "[OK] render.dll", "[OK] net.dll"] },
            { pct: 70, cmd: "fetch proyectos.json", out: ["Downloading: proyectos.json ... OK"] },
            { pct: 85, cmd: "parse proyectos.json", out: ["Parsing data ... OK", "Projects detected ... OK"] },
            { pct: 100, cmd: "start portfolio.exe", out: ["Launching interface ... OK"] }
        ];

        for (const s of steps) {
            setProgress(s.pct);
            await dosCommand(s.cmd, s.out, 120);
            await sleep(80);
        }

        bootStatus.textContent = "System ready.";
        await sleep(250);
    }

    function waitForEnter() {
        return new Promise((resolve) => {
            let done = false;

            const baseText = "Press ENTER (o toca la pantalla) to continue...";

            bootStatus.textContent = baseText;

            let showCursor = true;
            const cursorTimer = setInterval(() => {
                showCursor = !showCursor;
                bootStatus.textContent = showCursor
                    ? baseText + " _"
                    : baseText + "  ";
            }, 350);

            function finish() {
                if (done) return;
                done = true;

                clearInterval(cursorTimer);
                document.removeEventListener("keydown", onKeyDown);

                // Tap / click en el splash
                bootScreen.removeEventListener("click", onTap);
                bootScreen.removeEventListener("touchstart", onTap);

                resolve();
            }

            function onKeyDown(e) {
                if (e.key === "Enter") {
                    finish();
                }
            }

            function onTap() {
                finish();
            }

            document.addEventListener("keydown", onKeyDown);

            // Click/tap para móvil (y también funciona en PC si alguien hace click)
            bootScreen.addEventListener("click", onTap);
            bootScreen.addEventListener("touchstart", onTap, { passive: true });
        });
    }

    /* =========================================================
       TYPEWRITER (funciones)
       ========================================================= */
    function startTypewriter(targetEl, words) {
        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const typeSpeed = 70;     // velocidad escribiendo
        const deleteSpeed = 45;   // velocidad borrando
        const pauseAfterType = 900;
        const pauseAfterDelete = 220;

        async function tick() {
            const currentWord = words[wordIndex];

            if (!deleting) {
                // Escribiendo
                charIndex++;
                targetEl.textContent = currentWord.slice(0, charIndex);

                if (charIndex === currentWord.length) {
                    // Pausa al terminar palabra
                    await sleep(pauseAfterType);
                    deleting = true;
                } else {
                    await sleep(typeSpeed);
                }
            } else {
                // Borrando
                charIndex--;
                targetEl.textContent = currentWord.slice(0, charIndex);

                if (charIndex <= 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    await sleep(pauseAfterDelete);
                } else {
                    await sleep(deleteSpeed);
                }
            }

            tick();
        }

        tick();
    }
});
