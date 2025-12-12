// Alpine.js data functions for login flow

const DEFAULT_ERROR_MESSAGE = "An error occurred. Please try again.";

function loginEmailForm() {
    return {
        email: "",
        error: "",
        async submitEmail() {
            this.error = "";
            try {
                const response = await fetch("/.e/rest/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_key: this.email, cookie_ok: true }),
                });
                const data = await response.json();
                if (data.status === "success") {
                    window.location.href = "/login-token.html";
                } else if (data.message) {
                    this.error = data.message;
                } else {
                    this.error = DEFAULT_ERROR_MESSAGE;
                }
            } catch (e) {
                this.error = DEFAULT_ERROR_MESSAGE;
            }
        },
    };
}

function loginTokenForm() {
    return {
        token: "",
        error: "",
        async submitToken() {
            this.error = "";
            try {
                const response = await fetch("/.e/rest/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_secret: this.token,
                        cookie_ok: true,
                    }),
                });
                const data = await response.json();
                if (data.status === "success") {
                    window.location.href = "/";
                } else if (data.message) {
                    this.error = data.message;
                } else {
                    this.error = DEFAULT_ERROR_MESSAGE;
                }
            } catch (e) {
                this.error = DEFAULT_ERROR_MESSAGE;
            }
        },
    };
}

// Make functions available globally for Alpine.js
window.loginEmailForm = loginEmailForm;
window.loginTokenForm = loginTokenForm;

// Export for testing
export { loginEmailForm, loginTokenForm };
