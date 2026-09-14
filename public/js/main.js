/**
 * ==========================================================================
 * ASTROPORTAL - FRONTEND LOGIC & AUTHENTICATION MANAGEMENT
 * ==========================================================================
 */

// Detección dinámica de la URL base de la API (Soporta Live Server y Express directo)
const API_BASE_URL = window.location.port === '3000'
  ? '/api/v1/auth'
  : 'http://localhost:3000/api/v1/auth';

let currentZodiacName = 'Solar';

// Initial load check
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    loadUserProfile();
  } else {
    showGuestMode();
  }
});

// Tab Switcher (Login / Register)
function switchTab(tab) {
  clearErrors();
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
  }
}

// Clear input error messages
function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

// Login Handler
async function handleLogin(event) {
  event.preventDefault();
  clearErrors();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Basic validation
  let hasError = false;
  if (!email) {
    document.getElementById('errorLoginEmail').textContent = 'El correo electrónico es obligatorio';
    hasError = true;
  }
  if (!password) {
    document.getElementById('errorLoginPassword').textContent = 'La contraseña es obligatoria';
    hasError = true;
  }

  if (hasError) return;

  const btnSubmit = document.getElementById('btnLoginSubmit');
  const spinner = document.getElementById('spinnerLogin');
  setLoadingState(btnSubmit, spinner, true);

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password_hash: password
      })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      showToast('¡Bienvenido!', 'Inicio de sesión exitoso.', 'success');
      document.getElementById('formLogin').reset();
      await loadUserProfile();
    } else {
      handleApiErrors(data, 'Login');
    }
  } catch (err) {
    console.error('Error de conexión:', err);
    showToast('Error de Conexión', 'No se pudo conectar con el servidor.', 'error');
  } finally {
    setLoadingState(btnSubmit, spinner, false);
  }
}

// Register Handler
async function handleRegister(event) {
  event.preventDefault();
  clearErrors();

  const nombre_completo = document.getElementById('regNombre').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const fecha_nacimiento = document.getElementById('regFechaNac').value;

  // Client-side quick checks
  let hasError = false;
  if (!nombre_completo || nombre_completo.length < 2) {
    document.getElementById('errorRegNombre').textContent = 'El nombre debe tener al menos 2 caracteres';
    hasError = true;
  }
  if (!email) {
    document.getElementById('errorRegEmail').textContent = 'El correo es obligatorio';
    hasError = true;
  }
  if (!password || password.length < 6) {
    document.getElementById('errorRegPassword').textContent = 'La contraseña debe tener al menos 6 caracteres';
    hasError = true;
  }
  if (!fecha_nacimiento) {
    document.getElementById('errorRegFechaNac').textContent = 'La fecha de nacimiento es obligatoria';
    hasError = true;
  }

  if (hasError) return;

  const btnSubmit = document.getElementById('btnRegisterSubmit');
  const spinner = document.getElementById('spinnerRegister');
  setLoadingState(btnSubmit, spinner, true);

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_completo,
        email,
        password_hash: password,
        fecha_nacimiento
      })
    });

    const data = await response.json();

    if (response.status === 201) {
      showToast('Cuenta Creada', 'Tu usuario ha sido registrado exitosamente. Ahora puedes iniciar sesión.', 'success');
      document.getElementById('formRegister').reset();
      
      switchTab('login');
      document.getElementById('loginEmail').value = email;
    } else {
      handleApiErrors(data, 'Register');
    }
  } catch (err) {
    console.error('Error de conexión:', err);
    showToast('Error de Conexión', 'No se pudo registrar el usuario.', 'error');
  } finally {
    setLoadingState(btnSubmit, spinner, false);
  }
}

// Load User Profile & Numerology from JWT
async function loadUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    showGuestMode();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/perfil`, {
      method: 'GET',
      headers: {
        'x-token': token,
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.usuario) {
      renderProfile(data.usuario, data.numerologia);
    } else {
      localStorage.removeItem('token');
      showGuestMode();
      showToast('Sesión Expirada', 'Tu token no es válido o ha expirado.', 'warning');
    }
  } catch (err) {
    console.error('Error al cargar perfil:', err);
    showGuestMode();
  }
}

// Render Profile & Numerology View
function renderProfile(user, numerologia) {
  document.getElementById('authCard').classList.add('hidden');
  document.getElementById('profileCard').classList.remove('hidden');

  // Update Status Badge
  const badge = document.getElementById('userStatusBadge');
  const badgeDot = badge.querySelector('.badge-dot');
  const badgeText = document.getElementById('userStatusText');
  badgeDot.className = 'badge-dot dot-online';
  badgeText.textContent = 'Autenticado';

  // Basic Info
  document.getElementById('profileNombre').textContent = user.nombre_completo || 'Usuario';
  document.getElementById('profileEmail').textContent = user.email || '';
  
  // Format Birth Date & Zodiac
  if (user.fecha_nacimiento) {
    const fechaNac = new Date(user.fecha_nacimiento);
    document.getElementById('profileFechaNac').textContent = formatDate(user.fecha_nacimiento);
    
    const zodiac = getZodiacSign(fechaNac);
    currentZodiacName = zodiac.name;
    document.getElementById('zodiacSymbol').textContent = zodiac.symbol;
    document.getElementById('zodiacName').textContent = `${zodiac.name} (${zodiac.element})`;
    document.getElementById('zodiacDesc').textContent = zodiac.dates;
  } else {
    document.getElementById('profileFechaNac').textContent = 'No especificada';
  }

  // Format Register Date
  const fechaReg = user.fecha_registro || user.createdAt;
  if (fechaReg) {
    document.getElementById('profileFechaReg').textContent = formatDate(fechaReg);
  }

  // Set avatar initials
  const initials = user.nombre_completo
    ? user.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '👤';
  document.getElementById('profileAvatar').textContent = initials;

  // Render Numerology Map
  if (numerologia) {
    if (numerologia.caminoVida) {
      document.getElementById('numCaminoVida').textContent = numerologia.caminoVida.numero;
      document.getElementById('tituloCaminoVida').textContent = numerologia.caminoVida.titulo;
      document.getElementById('descCaminoVida').textContent = numerologia.caminoVida.significado;
    }
    if (numerologia.expresion) {
      document.getElementById('numExpresion').textContent = numerologia.expresion.numero;
      document.getElementById('tituloExpresion').textContent = numerologia.expresion.titulo;
      document.getElementById('descExpresion').textContent = numerologia.expresion.significado;
    }
    if (numerologia.alma) {
      document.getElementById('numAlma').textContent = numerologia.alma.numero;
      document.getElementById('tituloAlma').textContent = numerologia.alma.titulo;
      document.getElementById('descAlma').textContent = numerologia.alma.significado;
    }
  }
}

// Handler: Generate Gemini AI Reading
async function handleGenerarLectura() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const btn = document.getElementById('btnGenerarLectura');
  const spinner = document.getElementById('spinnerGemini');
  const lecturaBox = document.getElementById('lecturaGeminiBox');
  const lecturaContent = document.getElementById('lecturaGeminiContent');
  const lecturaTimestamp = document.getElementById('lecturaTimestamp');

  setLoadingState(btn, spinner, true);

  try {
    const response = await fetch(`${API_BASE_URL}/lectura-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token,
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ signo: currentZodiacName })
    });

    const data = await response.json();

    if (response.ok && data.lectura) {
      lecturaBox.classList.remove('hidden');
      
      // Convert Markdown headers (###) to styled HTML for display
      let formattedText = data.lectura
        .replace(/### (.*?)\n/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      lecturaContent.innerHTML = formattedText;
      lecturaTimestamp.textContent = `Generado el ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

      showToast('Lectura Generada', 'La Inteligencia Artificial Gemini ha analizado tu mapa.', 'success');
    } else {
      showToast('Error', data.mensaje || 'No se pudo generar la lectura.', 'error');
    }
  } catch (err) {
    console.error('Error al solicitar lectura:', err);
    showToast('Error de Conexión', 'No se pudo conectar con el servicio de IA Gemini.', 'error');
  } finally {
    setLoadingState(btn, spinner, false);
  }
}

// Show Guest Mode View
function showGuestMode() {
  document.getElementById('authCard').classList.remove('hidden');
  document.getElementById('profileCard').classList.add('hidden');

  const badge = document.getElementById('userStatusBadge');
  const badgeDot = badge.querySelector('.badge-dot');
  const badgeText = document.getElementById('userStatusText');
  badgeDot.className = 'badge-dot dot-offline';
  badgeText.textContent = 'Invitado';
}

// Logout Handler
function handleLogout() {
  localStorage.removeItem('token');
  showGuestMode();
  switchTab('login');
  showToast('Sesión Cerrada', 'Has salido del sistema correctamente.', 'success');
}

// Helper: Process express-validator or server errors
function handleApiErrors(data, context) {
  if (data.errores && Array.isArray(data.errores)) {
    data.errores.forEach(err => {
      const field = err.path || err.param;
      if (context === 'Register') {
        if (field === 'nombre_completo') document.getElementById('errorRegNombre').textContent = err.msg;
        if (field === 'email') document.getElementById('errorRegEmail').textContent = err.msg;
        if (field === 'password_hash') document.getElementById('errorRegPassword').textContent = err.msg;
        if (field === 'fecha_nacimiento') document.getElementById('errorRegFechaNac').textContent = err.msg;
      } else if (context === 'Login') {
        if (field === 'email') document.getElementById('errorLoginEmail').textContent = err.msg;
        if (field === 'password_hash') document.getElementById('errorLoginPassword').textContent = err.msg;
      }
    });
    showToast('Error de Validación', 'Por favor revisa los campos señalados.', 'error');
  } else if (data.mensaje) {
    showToast('Error', data.mensaje, 'error');
  } else {
    showToast('Error', 'Ocurrió un error inesperado al procesar la solicitud.', 'error');
  }
}

// Helper: Date Formatter (YYYY-MM-DD to locale date string)
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return new Date(dateStr).toLocaleDateString('es-ES');
}

// Helper: Zodiac Sign Calculator
function getZodiacSign(dateObj) {
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
    return { name: 'Aries', symbol: '♈', element: 'Fuego', dates: '21 Mar - 19 Abr' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
    return { name: 'Tauro', symbol: '♉', element: 'Tierra', dates: '20 Abr - 20 May' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
    return { name: 'Géminis', symbol: '♊', element: 'Aire', dates: '21 May - 20 Jun' };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
    return { name: 'Cáncer', symbol: '♋', element: 'Agua', dates: '21 Jun - 22 Jul' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22))
    return { name: 'Leo', symbol: '♌', element: 'Fuego', dates: '23 Jul - 22 Ago' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
    return { name: 'Virgo', symbol: '♍', element: 'Tierra', dates: '23 Ago - 22 Sep' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
    return { name: 'Libra', symbol: '♎', element: 'Aire', dates: '23 Sep - 22 Oct' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return { name: 'Escorpio', symbol: '♏', element: 'Agua', dates: '23 Oct - 21 Nov' };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return { name: 'Sagitario', symbol: '♐', element: 'Fuego', dates: '22 Nov - 21 Dic' };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return { name: 'Capricornio', symbol: '♑', element: 'Tierra', dates: '22 Dic - 19 Ene' };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return { name: 'Acuario', symbol: '♒', element: 'Aire', dates: '20 Ene - 18 Feb' };
  return { name: 'Piscis', symbol: '♓', element: 'Agua', dates: '19 Feb - 20 Mar' };
}

// Helper: Button Loading State
function setLoadingState(button, spinner, isLoading) {
  if (isLoading) {
    button.disabled = true;
    spinner.classList.remove('hidden');
    const btnText = button.querySelector('.btn-text') || button.querySelector('span:not(.spinner)');
    if (btnText) btnText.style.opacity = '0.7';
  } else {
    button.disabled = false;
    spinner.classList.add('hidden');
    const btnText = button.querySelector('.btn-text') || button.querySelector('span:not(.spinner)');
    if (btnText) btnText.style.opacity = '1';
  }
}

// Toast Notification System
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✨',
    error: '⚠️',
    warning: '🔮',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
