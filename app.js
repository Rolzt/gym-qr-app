// ======================================
// Gym Tracker V2
// app.js
// Authentication (Del 1)
// ======================================


// ---------- SUPABASE ----------

const SUPABASE_URL = "https://fvsvwfutgeghucystumo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bJ--KwyRbwjtBSF9Ar5xsA_CHpS3MqG";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ---------- HTML ----------

const loginSection =
    document.getElementById("loginSection");

const passwordResetSection =
    document.getElementById("passwordResetSection");

const accountSection =
    document.getElementById("accountSection");

const workoutSection =
    document.getElementById("workoutSection");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const newPasswordInput =
    document.getElementById("newPassword");

const userEmail =
    document.getElementById("userEmail");


// ---------- BUTTONS ----------

document
    .getElementById("loginButton")
    .addEventListener("click", signIn);

document
    .getElementById("signupButton")
    .addEventListener("click", signUp);

document
    .getElementById("logoutButton")
    .addEventListener("click", signOut);

document
    .getElementById("forgotPasswordButton")
    .addEventListener("click", resetPassword);

document
    .getElementById("savePasswordButton")
    .addEventListener("click", updatePassword);


// ---------- SIGN UP ----------

async function signUp() {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {

        alert("Indtast email og adgangskode.");

        return;
    }

    const { error } =
        await supabaseClient.auth.signUp({

            email,
            password

        });

    if (error) {

        alert(error.message);

        return;
    }

    alert("Bruger oprettet.");
}


// ---------- LOGIN ----------

async function signIn() {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const { error } =
        await supabaseClient.auth.signInWithPassword({

            email,
            password

        });

    if (error) {

        alert(error.message);

        return;
    }

    updateAuthUI();
}


// ---------- LOGOUT ----------

async function signOut() {

    await supabaseClient.auth.signOut();

    updateAuthUI();

}


// ---------- RESET PASSWORD ----------

async function resetPassword() {

    const email = emailInput.value.trim();

    if (!email) {

        alert("Indtast din email.");

        return;

    }

    const { error } =
        await supabaseClient.auth.resetPasswordForEmail(

            email,

            {

                redirectTo:
                window.location.origin +
                window.location.pathname

            }

        );

    if (error) {

        alert(error.message);

        return;

    }

    alert("Password reset sendt.");
}


// ---------- UPDATE PASSWORD ----------

async function updatePassword() {

    const password =
        newPasswordInput.value;

    if (!password) {

        alert("Indtast en ny adgangskode.");

        return;

    }

    const { error } =
        await supabaseClient.auth.updateUser({

            password

        });

    if (error) {

        alert(error.message);

        return;

    }

    alert("Adgangskoden er opdateret.");

    passwordResetSection.classList.add("hidden");

    updateAuthUI();

}


// ---------- AUTH EVENTS ----------

supabaseClient.auth.onAuthStateChange(

    async (event) => {

        console.log("AUTH EVENT:", event);

        if (event === "PASSWORD_RECOVERY") {

            loginSection.classList.add("hidden");

            accountSection.classList.add("hidden");

            workoutSection.classList.add("hidden");

            passwordResetSection.classList.remove("hidden");

        }

        else {

            updateAuthUI();

        }

    }

);


// ---------- UI ----------

async function updateAuthUI() {

    const {

        data: { user }

    } = await supabaseClient.auth.getUser();

    if (user) {

        loginSection.classList.add("hidden");

        passwordResetSection.classList.add("hidden");

        accountSection.classList.remove("hidden");

        workoutSection.classList.remove("hidden");

        userEmail.textContent =
            user.email;

    }

    else {

        loginSection.classList.remove("hidden");

        passwordResetSection.classList.add("hidden");

        accountSection.classList.add("hidden");

        workoutSection.classList.add("hidden");

    }

}


// ---------- START ----------

updateAuthUI();
