document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const user = document.getElementById("username").value;
            const pass = document.getElementById("password").value;
            const alertBox = document.getElementById("login-alert");

            if (user === "admin" && pass === "1234") {
                alertBox.className = "alert alert-success mt-3";
                alertBox.textContent = "¡Bienvenido! Redirigiendo...";
                alertBox.classList.remove("d-none");
                setTimeout(function () {
                    window.location.href = "profile.html";
                }, 1000);
            } else {
                alertBox.className = "alert alert-danger mt-3";
                alertBox.textContent = "Usuario o contraseña incorrectos";
                alertBox.classList.remove("d-none");
            }
        });
    }

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

    const selectPais = document.getElementById("select-pais");
    const selectRegion = document.getElementById("select-region");
    let listaPaises = [];

    if (selectPais && selectRegion) {
        fetch("country-region-data.json")
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                listaPaises = data;
                data.forEach(function (pais) {
                    const option = document.createElement("option");
                    option.value = pais.countryShortCode;
                    option.textContent = pais.countryName;
                    selectPais.appendChild(option);
                });
            });

        selectPais.addEventListener("change", function () {
            const codigoPais = this.value;
            selectRegion.innerHTML = '<option value="">-- Selecciona una región --</option>';

            if (!codigoPais) {
                selectRegion.disabled = true;
                return;
            }

            const paisEncontrado = listaPaises.find(function (p) {
                return p.countryShortCode === codigoPais;
            });

            if (paisEncontrado) {
                paisEncontrado.regions.forEach(function (region) {
                    const option = document.createElement("option");
                    option.value = region.shortCode;
                    option.textContent = region.name;
                    selectRegion.appendChild(option);
                });
                selectRegion.disabled = false;
            }
        });
    }

    const radios = document.querySelectorAll('input[name="opcion-plan"]');
    const contenidoOculto = document.getElementById("contenido-oculto");

    radios.forEach(function (radio) {
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
