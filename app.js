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

// ---------- CURRENT EXERCISE ----------

// ---------- EXERCISES ----------

const exercises = {
    "bench-press": "Bench Press",
    "squat": "Squat",
    "leg-press": "Leg Press",
    "lat-pulldown": "Lat Pulldown"
};

const params = new URLSearchParams(window.location.search);

const exerciseKey =
    params.get("exercise");

const currentExercise =
    exercises[exerciseKey] || "Øvelse";

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

document
    .getElementById("saveSetButton")
    .addEventListener("click", saveSet);


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

    //updateAuthUI();
    
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

    console.trace("updateAuthUI()");

    const {

        data: { user }

    } = await supabaseClient.auth.getUser();

    if (user) {

        loginSection.classList.add("hidden");

        passwordResetSection.classList.add("hidden");

        accountSection.classList.remove("hidden");

        workoutSection.classList.remove("hidden");

        userEmail.textContent = user.email;

        document.getElementById("exerciseName").textContent = currentExercise;

     await loadTodaySets();
     await loadLastWorkout();
     await loadProgress();
     await loadProgressChart();

    }

     else {

        loginSection.classList.remove("hidden");

        passwordResetSection.classList.add("hidden");

        accountSection.classList.add("hidden");

        workoutSection.classList.add("hidden");

    }

}


// ---------- START ----------
// ---------- SAVE SET ----------

async function saveSet() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Du er ikke logget ind.");
        return;
    }

    const weight =
        Number(document.getElementById("weight").value);

    const reps =
        Number(document.getElementById("reps").value);

    if (!weight || !reps) {
        alert("Indtast både kg og reps.");
        return;
    }

const exercise = exerciseKey;

    const { error } =
        await supabaseClient
            .from("workout_sets")
            .insert({

                user_id: user.id,

                exercise: exercise,

                weight: weight,

                reps: reps,

                workout_day:
                    new Date().toISOString().split("T")[0]

            });

    if (error) {

        console.error(error);

        alert(error.message);

        return;

    }
    
document.getElementById("weight").value = "";
document.getElementById("reps").value = "";

await loadTodaySets();
await loadLastWorkout();
await loadProgress();

}


// ---------- LOAD TODAY'S SETS ----------

async function loadTodaySets() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;


    const today =
        new Date().toISOString().split("T")[0];

    console.log("User ID:", user.id);
    console.log("Today:", today);

    const { data, error } =
    await supabaseClient
        .from("workout_sets")
        .select("*")
        .eq("user_id", user.id)
        .eq("exercise", exerciseKey)
        .eq("workout_day", today)
        .order("created_at", { ascending: true });

            console.log("Data:", data);
            console.log("Error:", error);

    if (error) {

        console.error(error);

        return;

    }

    const list =
        document.getElementById("setsList");

    list.innerHTML = "";

    if (data.length === 0) {
    
        list.innerHTML = "<p>Ingen sæt endnu.</p>";
    
        return;
}

    data.forEach(set => {

    const div = document.createElement("div");
        div.className = "set";

    const text = document.createElement("span");
        text.textContent = `${set.weight} kg × ${set.reps}`;

    const button = document.createElement("button");
        button.textContent = "Slet";

        button.addEventListener("click", () => {
        console.log("Klik på Slet");
});
        button.onclick = () => deleteSet(set.id);

        div.appendChild(text);
        div.appendChild(button);

        list.appendChild(div);

 });

}

// ---------- LAST WORKOUT ----------

async function loadLastWorkout() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const today =
        new Date().toISOString().split("T")[0];

    const { data, error } =
        await supabaseClient
            .from("workout_sets")
            .select("workout_day")
            .eq("user_id", user.id)
            .eq("exercise", exerciseKey)
            .lt("workout_day", today)
            .order("workout_day", { ascending: false })
            .limit(1);

    if (error) {

        console.error(error);

        return;

    }

    const div =
        document.getElementById("lastWorkout");

    if (data.length === 0) {

        div.textContent =
            "Ingen tidligere træning.";

        return;

    }

const lastWorkoutDay = data[0].workout_day;

    const { data: lastSets, error: lastError } =
    await supabaseClient
        .from("workout_sets")
        .select("*")
        .eq("user_id", user.id)
        .eq("exercise", exerciseKey)
        .eq("workout_day", lastWorkoutDay)
        .order("created_at", { ascending: true });

    if (lastError) {

    console.error(lastError);

    return;

}

    div.innerHTML = `<strong>${lastWorkoutDay}</strong><br><br>`;

    lastSets.forEach(set => {

    div.innerHTML +=
        `${set.weight} kg × ${set.reps}<br>`;

});

}

// ---------- PROGRESSION ----------

async function loadProgress() {

    console.log("loadProgress()");

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const today =
        new Date().toISOString().split("T")[0];

    // ---------- Dagens træning ----------

    const { data: todaySets, error: todayError } =
        await supabaseClient
            .from("workout_sets")
            .select("*")
            .eq("user_id", user.id)
            .eq("exercise", exerciseKey)
            .eq("workout_day", today)
            .order("created_at", { ascending: true });

    if (todayError) {

        console.error(todayError);

        return;

    }

    // ---------- Sidste træning ----------

    const { data: lastWorkout, error: lastWorkoutError } =
        await supabaseClient
            .from("workout_sets")
            .select("*")
            .eq("user_id", user.id)
            .eq("exercise", exerciseKey)
            .lt("workout_day", today)
            .order("workout_day", { ascending: false })
            .order("created_at", { ascending: true });

    if (lastWorkoutError) {

        console.error(lastWorkoutError);

        return;

    }

    const progressDiv =
        document.getElementById("progress");

    if (todaySets.length === 0 || lastWorkout.length === 0) {

        progressDiv.textContent =
            "Ingen sammenligning mulig.";

        return;

    }

    // ---------- Tungeste sæt ----------

    const todaySet =
        todaySets.reduce((best, set) =>
            set.weight > best.weight ? set : best
        );

    const lastSet =
        lastWorkout.reduce((best, set) =>
            set.weight > best.weight ? set : best
        );

    // ---------- Progress ----------

    let message = "";

    if (todaySet.weight > lastSet.weight) {

        message = `🟢 +${todaySet.weight - lastSet.weight} kg`;

    }

    else if (todaySet.weight < lastSet.weight) {

        message = `🔴 ${todaySet.weight - lastSet.weight} kg`;

    }

    else {

        if (todaySet.reps > lastSet.reps) {

            message = `🟢 +${todaySet.reps - lastSet.reps} reps`;

        }

        else if (todaySet.reps < lastSet.reps) {

            message = `🔴 ${todaySet.reps - lastSet.reps} reps`;

        }

        else {

            message = "🟡 Samme resultat";

        }

    }

    // ---------- Tidligere PR ----------

    const { data: allSets, error: allSetsError } =
        await supabaseClient
            .from("workout_sets")
            .select("weight")
            .eq("user_id", user.id)
            .eq("exercise", exerciseKey)
            .lt("workout_day", today);

    if (allSetsError) {

        console.error(allSetsError);

        return;

    }

    let prMessage = "";

    if (allSets.length === 0) {

        prMessage = "<br><br>🏆 Første registrerede træning!";

    }

    else {

        const maxWeight = Math.max(
            ...allSets.map(set => set.weight)
        );

        console.log("Tidligere PR:", maxWeight);

        if (todaySet.weight > maxWeight) {

            prMessage =
                "<br><br>🏆 Ny personlig rekord!";

        }

        else if (todaySet.weight === maxWeight) {

            prMessage =
                "<br><br>🤝 Tangering af personlig rekord!";

        }

    }

    // ---------- Vis ----------

    progressDiv.innerHTML = `
        ${message}<br><br>
        ${lastSet.weight} kg × ${lastSet.reps}
        <br>↓<br>
        ${todaySet.weight} kg × ${todaySet.reps}
        ${prMessage}
    `;

}

// ---------- DELETE SET ----------

async function deleteSet(id) {

    console.log("Sletter:", id);

    const { error } =
        await supabaseClient
            .from("workout_sets")
            .delete()
            .eq("id", id);

  console.log("Delete error:", error);

if (error) {
    console.error(error);
    alert(error.message);
    return;
}

    await loadTodaySets();
    await loadLastWorkout();

}

// ---------- TEST CHART ----------

async function loadProgressChart() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { data, error } =
        await supabaseClient
            .from("workout_sets")
            .select("*")
            .eq("user_id", user.id)
            .eq("exercise", exerciseKey)
            .order("workout_day", { ascending: true });

    if (error) {

        console.error(error);

        return;

    }

    console.log(data);

    const labels = [];
const weights = [];
const bestSets = {};

data.forEach(set => {

    if (
        !bestSets[set.workout_day] ||
        set.weight > bestSets[set.workout_day]
    ) {

        bestSets[set.workout_day] = set.weight;

    }

});

Object.keys(bestSets).forEach(day => {

    const date = new Date(day);

const formattedDate =
    date.toLocaleDateString("da-DK", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

labels.push(formattedDate);

    weights.push(bestSets[day]);

});

const ctx =
    document.getElementById("progressChart");

new Chart(ctx, {

    type: "line",

    data: {

        labels: labels,

        datasets: [{

            label: "Bedste sæt",

            data: weights,

            tension: 0.3

        }]

    }

});

const exerciseSelect = document.getElementById("exerciseSelect");

exerciseSelect.value = exerciseKey;

exerciseSelect.addEventListener("change", function () {

    window.location.search = `?exercise=${this.value}`;

});

}

//updateAuthUI();
