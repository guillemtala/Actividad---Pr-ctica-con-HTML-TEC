document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:3000";

    // -------------------------------------------------------------
    // 0. VERIFICACIÓN DE ESTADO DEL BACKEND
    // -------------------------------------------------------------
    const apiBadge = document.getElementById("api-status-badge");
    if (apiBadge) {
        fetch(`${API_URL}/ping`)
            .then(res => res.text())
            .then(text => {
                if (text === "pong") {
                    apiBadge.className = "badge bg-success";
                    apiBadge.textContent = "Online (Puerto 3000)";
                } else {
                    apiBadge.className = "badge bg-warning text-dark";
                    apiBadge.textContent = "Respuesta desconocida";
                }
            })
            .catch(() => {
                apiBadge.className = "badge bg-danger";
                apiBadge.textContent = "Offline (Inicia rest-api)";
            });
    }

    // -------------------------------------------------------------
    // 1. LOGIN DE USUARIO (index.html)
    // -------------------------------------------------------------
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const user = document.getElementById("username").value.trim();
            const pass = document.getElementById("password").value.trim();
            const alertBox = document.getElementById("login-alert");

            alertBox.className = "alert alert-info mt-3";
            alertBox.textContent = "Conectando con el servidor...";
            alertBox.classList.remove("d-none");

            fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login: user, password: pass })
            })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200 && body.user) {
                    alertBox.className = "alert alert-success mt-3";
                    alertBox.textContent = `¡Bienvenido ${body.user.username}! Redirigiendo al perfil...`;
                    localStorage.setItem("currentUser", JSON.stringify(body.user));
                    setTimeout(() => {
                        window.location.href = "profile.html";
                    }, 1000);
                } else {
                    alertBox.className = "alert alert-danger mt-3";
                    alertBox.textContent = body.message || "Usuario o contraseña incorrectos";
                }
            })
            .catch(err => {
                console.error("Error en login:", err);
                alertBox.className = "alert alert-warning mt-3";
                alertBox.textContent = "No se pudo conectar con el backend (http://localhost:3000).";
            });
        });
    }

    // -------------------------------------------------------------
    // 2. REGISTRO DE USUARIO (formulario.html)
    // -------------------------------------------------------------
    const registroForm = document.getElementById("registro-form");
    if (registroForm) {
        registroForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("reg-username").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const password = document.getElementById("reg-password").value.trim();
            const planRadio = document.querySelector('input[name="opcion-plan"]:checked');
            const role = planRadio ? planRadio.value.toLowerCase() : 'user';
            const registroMensaje = document.getElementById("registro-mensaje");

            registroMensaje.className = "alert alert-info mt-3";
            registroMensaje.textContent = "Enviando registro al backend...";
            registroMensaje.classList.remove("d-none");

            fetch(`${API_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, role })
            })
            .then(res => res.json().then(data => ({ ok: res.ok, status: res.status, body: data })))
            .then(({ ok, body }) => {
                if (ok && (body.status === "success" || body.status.includes("success"))) {
                    registroMensaje.className = "alert alert-success mt-3";
                    registroMensaje.textContent = `¡Registro exitoso! Usuario ${body.data.username} guardado en el backend.`;
                    registroForm.reset();
                    // Deshabilitar botón de nuevo hasta marcar checkboxes
                    const btnEnviar = document.getElementById("btn-enviar-registro");
                    if (btnEnviar) btnEnviar.disabled = true;
                } else {
                    registroMensaje.className = "alert alert-danger mt-3";
                    registroMensaje.textContent = body.message || "Error al registrar usuario.";
                }
            })
            .catch(err => {
                console.error("Error en registro:", err);
                registroMensaje.className = "alert alert-danger mt-3";
                registroMensaje.textContent = "Error al comunicarse con el servidor REST API.";
            });
        });
    }

    // -------------------------------------------------------------
    // 3. PERFIL DE USUARIO Y GESTIÓN DE USUARIOS (profile.html)
    // -------------------------------------------------------------
    const userDisplayUsername = document.getElementById("user-display-username");
    const userDisplayEmail = document.getElementById("user-display-email");
    const userDisplayRole = document.getElementById("user-display-role");
    const userDisplayCreated = document.getElementById("user-display-created");
    const btnLogout = document.getElementById("btn-logout");
    const btnCargarUsuarios = document.getElementById("btn-cargar-usuarios");
    const usuariosTableBody = document.getElementById("usuarios-table-body");
    const usersApiAlert = document.getElementById("users-api-alert");

    // Cargar sesión del usuario en perfil
    if (userDisplayUsername) {
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                userDisplayUsername.textContent = user.username;
                if (userDisplayEmail) userDisplayEmail.textContent = user.email;
                if (userDisplayRole) userDisplayRole.textContent = user.role;
                if (userDisplayCreated && user.created_at) {
                    userDisplayCreated.textContent = new Date(user.created_at).toLocaleDateString();
                }
                if (btnLogout) btnLogout.classList.remove("d-none");
            } catch (e) {
                console.error("Error al parsear currentUser:", e);
            }
        }
    }

    // Botón de logout
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    // Función para obtener la lista de usuarios desde la REST API
    function cargarUsuariosBackend() {
        if (!usuariosTableBody) return;

        usuariosTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Cargando usuarios desde REST API...</td></tr>`;

        fetch(`${API_URL}/users`)
            .then(res => res.json())
            .then(resData => {
                const users = resData.data || [];
                if (!Array.isArray(users) || users.length === 0) {
                    usuariosTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay usuarios registrados.</td></tr>`;
                    return;
                }

                usuariosTableBody.innerHTML = "";
                users.forEach(user => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${user.id}</td>
                        <td class="fw-bold">${user.username}</td>
                        <td>${user.email}</td>
                        <td><span class="badge bg-secondary">${user.role}</span></td>
                        <td>
                            <button class="btn btn-outline-danger btn-sm btn-delete-user" data-id="${user.id}">Eliminar</button>
                        </td>
                    `;
                    usuariosTableBody.appendChild(tr);
                });

                // Asignar eventos de eliminación
                document.querySelectorAll(".btn-delete-user").forEach(btn => {
                    btn.addEventListener("click", function () {
                        const userId = this.getAttribute("data-id");
                        eliminarUsuarioBackend(userId);
                    });
                });
            })
            .catch(err => {
                console.error("Error cargando usuarios:", err);
                if (usuariosTableBody) {
                    usuariosTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar usuarios desde ${API_URL}/users</td></tr>`;
                }
            });
    }

    // Función para eliminar usuario vía DELETE /users/:id
    function eliminarUsuarioBackend(id) {
        if (!confirm(`¿Estás seguro de que deseas eliminar al usuario con ID ${id}?`)) return;

        fetch(`${API_URL}/users/${id}`, {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(data => {
            if (usersApiAlert) {
                usersApiAlert.className = "alert alert-success mt-2";
                usersApiAlert.textContent = data.message || `Usuario con ID ${id} eliminado.`;
                usersApiAlert.classList.remove("d-none");
                setTimeout(() => usersApiAlert.classList.add("d-none"), 3000);
            }
            cargarUsuariosBackend();
        })
        .catch(err => {
            console.error("Error al eliminar usuario:", err);
            if (usersApiAlert) {
                usersApiAlert.className = "alert alert-danger mt-2";
                usersApiAlert.textContent = `Error al eliminar el usuario con ID ${id}.`;
                usersApiAlert.classList.remove("d-none");
            }
        });
    }

    if (btnCargarUsuarios) {
        btnCargarUsuarios.addEventListener("click", cargarUsuariosBackend);
        // Cargar automáticamente al entrar a perfil
        cargarUsuariosBackend();
    }

    // -------------------------------------------------------------
    // 4. ACCIONES INTERACTIVAS EN INDEX (Boton de color, fecha, saludo)
    // -------------------------------------------------------------
    const btnColor = document.getElementById("btn-color");
    if (btnColor) {
        btnColor.addEventListener("click", function () {
            document.body.classList.toggle("bg-dark");
            document.body.classList.toggle("text-white");
        });
    }

    const btnFecha = document.getElementById("btn-fecha");
    if (btnFecha) {
        btnFecha.addEventListener("click", function () {
            document.getElementById("fecha-output").textContent = new Date().toLocaleString();
        });
    }

    const btnSaludo = document.getElementById("btn-saludo");
    if (btnSaludo) {
        btnSaludo.addEventListener("click", function () {
            document.getElementById("saludo-output").textContent = "¡Hola! Bienvenido al sitio.";
        });
    }

    // -------------------------------------------------------------
    // 5. MENÚS DESPLEGABLES PAÍSES Y REGIÓN (formulario.html)
    // -------------------------------------------------------------
    const selectPais = document.getElementById("select-pais");
    const selectRegion = document.getElementById("select-region");
    let listaPaises = [];

    if (selectPais && selectRegion) {
        fetch("country-region-data.json")
            .then(response => response.json())
            .then(data => {
                listaPaises = data;
                data.forEach(pais => {
                    const option = document.createElement("option");
                    option.value = pais.countryShortCode;
                    option.textContent = pais.countryName;
                    selectPais.appendChild(option);
                });
            })
            .catch(err => console.warn("No se pudo cargar country-region-data.json", err));

        selectPais.addEventListener("change", function () {
            const codigoPais = this.value;
            selectRegion.innerHTML = '<option value="">-- Selecciona una región --</option>';

            if (!codigoPais) {
                selectRegion.disabled = true;
                return;
            }

            const paisEncontrado = listaPaises.find(p => p.countryShortCode === codigoPais);

            if (paisEncontrado) {
                paisEncontrado.regions.forEach(region => {
                    const option = document.createElement("option");
                    option.value = region.shortCode;
                    option.textContent = region.name;
                    selectRegion.appendChild(option);
                });
                selectRegion.disabled = false;
            }
        });
    }

    // -------------------------------------------------------------
    // 6. RADIO BUTTONS DE PLANES (formulario.html)
    // -------------------------------------------------------------
    const radios = document.querySelectorAll('input[name="opcion-plan"]');
    const contenidoOculto = document.getElementById("contenido-oculto");

    radios.forEach(radio => {
        radio.addEventListener("change", function () {
            if (contenidoOculto) {
                contenidoOculto.classList.remove("d-none");
                if (this.value === "Estudiante") {
                    contenidoOculto.innerHTML = "<strong>Plan Estudiante:</strong> Acceso básico y gratuito para fines académicos.";
                } else if (this.value === "Profesional") {
                    contenidoOculto.innerHTML = "<strong>Plan Profesional:</strong> Acceso completo por $15/mes con soporte prioritario.";
                } else if (this.value === "Empresarial") {
                    contenidoOculto.innerHTML = "<strong>Plan Empresarial:</strong> Herramientas avanzadas por $45/mes para empresas y equipos.";
                }
            }
        });
    });

    // -------------------------------------------------------------
    // 7. CHECKBOXES DE TÉRMINOS Y CONDICIONES (formulario.html)
    // -------------------------------------------------------------
    const check1 = document.getElementById("check-terminos");
    const check2 = document.getElementById("check-privacidad");
    const btnEnviar = document.getElementById("btn-enviar-registro");

    function revisarCheckboxes() {
        if (check1 && check2 && btnEnviar) {
            btnEnviar.disabled = !(check1.checked && check2.checked);
        }
    }

    if (check1 && check2) {
        check1.addEventListener("change", revisarCheckboxes);
        check2.addEventListener("change", revisarCheckboxes);
    }
});
