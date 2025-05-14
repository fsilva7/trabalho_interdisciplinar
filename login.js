// Simulação de autenticação simples usando localStorage
// Usuários salvos: [{user, pass}]

function getUsers() {
    return JSON.parse(localStorage.getItem('adminUsers') || '[]');
}
function saveUser(user, email, pass) {
    const users = getUsers();
    users.push({ user, email, pass });
    localStorage.setItem('adminUsers', JSON.stringify(users));
}
function checkUser(user, pass) {
    return getUsers().some(u => u.user === user && u.pass === pass);
}

document.getElementById('showRegister').onclick = function(e) {
    e.preventDefault();
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('registerFormContainer').style.display = 'block';
    document.getElementById('loginError').style.display = 'none';
};
document.getElementById('showLogin').onclick = function(e) {
    e.preventDefault();
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('registerFormContainer').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
};

document.getElementById('registerForm').onsubmit = async function(e) {
    e.preventDefault();
    const user = document.getElementById('registerUser').value;
    const email = document.getElementById('registerEmail').value;
    const pass = document.getElementById('registerPass').value;
    if (!user || !email || !pass) return;
    try {
        const res = await fetch('backend/register_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, email, pass })
        });
        const data = await res.json();
        if (data.success) {
            alert('Registrado com sucesso! Faça login.');
            document.getElementById('showLogin').click();
        } else {
            showError(data.error || 'Erro ao registrar!');
        }
    } catch (err) {
        showError('Erro ao registrar!');
    }
};

document.getElementById('loginForm').onsubmit = async function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    try {
        const res = await fetch('backend/login_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('adminLogged', '1');
            window.location.href = 'admin_agendamentos.html';
        } else {
            showError(data.error || 'Usuário ou senha inválidos!');
        }
    } catch (err) {
        showError('Erro ao fazer login!');
    }
};

function showError(msg) {
    const err = document.getElementById('loginError');
    err.textContent = msg;
    err.style.display = 'block';
}
