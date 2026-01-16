class PasswordManager {
    constructor() {
        this.passwords = this.loadPasswords();
        this.init();
    }

    loadPasswords() {
        const stored = localStorage.getItem('passwords');
        return stored ? JSON.parse(stored) : [];
    }

    savePasswords() {
        localStorage.setItem('passwords', JSON.stringify(this.passwords));
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    addPassword(service, login, password) {
        const newPassword = {
            id: Date.now().toString(),
            service,
            login,
            password,
            createdAt: new Date().toISOString()
        };
        
        this.passwords.push(newPassword);
        this.savePasswords();
        this.renderPasswords();
        this.showNotification('Пароль успешно сохранен!');
    }

    deletePassword(id) {
        if (confirm('Вы уверены, что хотите удалить этот пароль?')) {
            this.passwords = this.passwords.filter(p => p.id !== id);
            this.savePasswords();
            this.renderPasswords();
            this.showNotification('Пароль удален');
        }
    }

    getServiceIcon(service) {
        return service.charAt(0).toUpperCase();
    }

    renderPasswords() {
        const container = document.getElementById('passwords-container');
        const mobileContainer = document.getElementById('mobile-passwords-container');
        
        const render = (container) => {
            if (this.passwords.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div>🔐</div>
                        <h3>Пароли не найдены</h3>
                        <p>Добавьте первый пароль чтобы начать</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = this.passwords.map(password => `
                <div class="password-item" data-id="${password.id}">
                    <div class="password-header">
                        <div class="service-name">
                            <div class="service-icon">${this.getServiceIcon(password.service)}</div>
                            ${password.service}
                        </div>
                        <div class="expand-icon">▼</div>
                    </div>
                    <div class="password-details">
                        <div class="detail-row">
                            <span class="detail-label">Логин:</span>
                            <span class="detail-value">${password.login}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Пароль:</span>
                            <span class="detail-value password-field" data-password="${password.password}">••••••••</span>
                        </div>
                        <div class="password-actions">
                            <button class="btn btn-outline show-password" data-id="${password.id}">
                                👁️ Показать
                            </button>
                            <button class="btn btn-danger delete-password" data-id="${password.id}">
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        };

        render(container);
        render(mobileContainer);
    }

    togglePasswordItem(id) {
        const desktopItems = document.querySelectorAll('#passwords-container .password-item');
        desktopItems.forEach(item => {
            if (item.dataset.id === id) {
                item.classList.toggle('expanded');
            }
        });

        const mobileItems = document.querySelectorAll('#mobile-passwords-container .password-item');
        mobileItems.forEach(item => {
            if (item.dataset.id === id) {
                item.classList.toggle('expanded');
            }
        });
    }

    togglePasswordVisibility(button) {
        const field = button.closest('.password-item').querySelector('.password-field');
        const password = field.dataset.password;
        
        if (field.textContent === '••••••••') {
            field.textContent = password;
            button.innerHTML = '👓 Скрыть';
        } else {
            field.textContent = '••••••••';
            button.innerHTML = '👁️ Показать';
        }
    }

    toggleInputPasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('toggle-password');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.innerHTML = '👓';
        } else {
            passwordInput.type = 'password';
            toggleButton.innerHTML = '👁️';
        }
    }

    generatePassword(length = 12) {
        const chars = {
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            numbers: '0123456789',
            symbols: '!@#$%^&*'
        };

        let charSet = '';
        if (document.getElementById('lowercase').checked) charSet += chars.lowercase;
        if (document.getElementById('uppercase').checked) charSet += chars.uppercase;
        if (document.getElementById('numbers').checked) charSet += chars.numbers;
        if (document.getElementById('symbols').checked) charSet += chars.symbols;

        if (!charSet) charSet = chars.lowercase + chars.uppercase;

        let password = '';
        for (let i = 0; i < length; i++) {
            password += charSet[Math.floor(Math.random() * charSet.length)];
        }
        
        return password;
    }

    showCopyNotification() {
        const notification = document.getElementById('copy-notification');
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    init() {
        this.renderPasswords();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('add-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const service = document.getElementById('service-name').value;
            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;
            
            this.addPassword(service, login, password);
            e.target.reset();
        });

        document.getElementById('toggle-password').addEventListener('click', () => {
            this.toggleInputPasswordVisibility();
        });

        document.getElementById('generator-toggle').addEventListener('click', () => {
            document.getElementById('password-generator').classList.add('open');
            document.getElementById('overlay').classList.add('active');
        });

        document.getElementById('mobile-passwords-btn').addEventListener('click', () => {
            document.getElementById('mobile-sidebar').classList.add('open');
            document.getElementById('overlay').classList.add('active');
        });

        document.getElementById('mobile-generator-btn').addEventListener('click', () => {
            document.getElementById('password-generator').classList.add('open');
            document.getElementById('overlay').classList.add('active');
        });

        document.getElementById('close-sidebar').addEventListener('click', () => {
            document.getElementById('mobile-sidebar').classList.remove('open');
            document.getElementById('overlay').classList.remove('active');
        });

        document.getElementById('close-generator').addEventListener('click', () => {
            document.getElementById('password-generator').classList.remove('open');
            document.getElementById('overlay').classList.remove('active');
        });

        document.getElementById('overlay').addEventListener('click', () => {
            document.getElementById('mobile-sidebar').classList.remove('open');
            document.getElementById('password-generator').classList.remove('open');
            document.getElementById('overlay').classList.remove('active');
        });

        document.getElementById('generate-password').addEventListener('click', () => {
            const length = parseInt(document.getElementById('password-length').value);
            const password = this.generatePassword(length);
            document.getElementById('generated-password').value = password;
        });

        document.getElementById('use-generated').addEventListener('click', () => {
            const length = parseInt(document.getElementById('password-length').value);
            const password = this.generatePassword(length);
            document.getElementById('password').value = password;
            document.getElementById('password-generator').classList.remove('open');
            document.getElementById('overlay').classList.remove('active');
            this.showNotification('Пароль скопирован в форму!');
        });

        document.getElementById('copy-password').addEventListener('click', () => {
            const passwordField = document.getElementById('generated-password');
            passwordField.select();
            document.execCommand('copy');
            this.showCopyNotification();
        });

        document.getElementById('password-length').addEventListener('input', (e) => {
            document.getElementById('length-value').textContent = e.target.value;
        });

        document.getElementById('passwords-container').addEventListener('click', (e) => {
            if (e.target.closest('.password-header') && 
                !e.target.classList.contains('show-password') && 
                !e.target.classList.contains('delete-password')) {
                const passwordItem = e.target.closest('.password-item');
                this.togglePasswordItem(passwordItem.dataset.id);
            }

            if (e.target.classList.contains('show-password')) {
                e.stopPropagation();
                this.togglePasswordVisibility(e.target);
            }

            if (e.target.classList.contains('delete-password')) {
                e.stopPropagation();
                this.deletePassword(e.target.dataset.id);
            }
        });

        document.getElementById('mobile-passwords-container').addEventListener('click', (e) => {
            if (e.target.closest('.password-header') && 
                !e.target.classList.contains('show-password') && 
                !e.target.classList.contains('delete-password')) {
                const passwordItem = e.target.closest('.password-item');
                this.togglePasswordItem(passwordItem.dataset.id);
            }

            if (e.target.classList.contains('show-password')) {
                e.stopPropagation();
                this.togglePasswordVisibility(e.target);
            }

            if (e.target.classList.contains('delete-password')) {
                e.stopPropagation();
                this.deletePassword(e.target.dataset.id);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PasswordManager();
    document.getElementById('generate-password').click();
});