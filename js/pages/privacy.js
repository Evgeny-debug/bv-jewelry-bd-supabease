/**
 * Page script extracted from privacy.html (Phase 5).
 * Loaded as ES module after js/main.js. Behavior unchanged.
 */

// 1. Функции работы с куки (общий скрипт)
        function setCookie(name, value, days) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
        }

        function getCookie(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(c.substring(nameEQ.length, c.length));
                }
            }
            return null;
        }

        // 2. Логика показа и скрытия всплывающего окна
        document.addEventListener("DOMContentLoaded", function() {
            const banner = document.getElementById("cookieBanner");
            const acceptBtn = document.getElementById("acceptCookiesBtn");

            // Проверяем, давал ли пользователь согласие ранее
            if (!getCookie("bv_cookie_consent")) {
                // Если нет — плавно показываем окошко через полсекунды
                setTimeout(() => {
                    banner.classList.remove("translate-y-4", "opacity-0", "pointer-events-none");
                    banner.classList.add("translate-y-0", "opacity-100");
                }, 500);
            }

            // При нажатии на кнопку записываем куку и скрываем окно
            acceptBtn.addEventListener("click", function() {
                setCookie("bv_cookie_consent", "accepted", 30); // Запоминаем на 30 дней
                
                // Плавное исчезновение
                banner.classList.remove("translate-y-0", "opacity-100");
                banner.classList.add("translate-y-4", "opacity-0", "pointer-events-none");
            });
        });
